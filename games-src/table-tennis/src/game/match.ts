import { MathUtils, Quaternion, Vector3 } from 'three';
import {
  HALF_L,
  HALF_W,
  SLOWMO,
  TABLE,
  other,
  sideSign,
  type AvatarPose,
  type BallEvent,
  type CareerStats,
  type Difficulty,
  type GameMode,
  type Handedness,
  type PaddleInput,
  type PointResult,
  type Settings,
  type ShotRequest,
  type Side,
  type StrokeKind,
  type SwingEvent,
} from '../core/contracts';
import { Ball, predictPath } from '../physics/ball';
import { findIntercept, solveServe, solveShot, type Intercept } from '../physics/solver';
import { Referee, Scoreboard } from './rules';
import { AIPlayer, type AIPlan } from './ai';
import { challengeById, type ChallengeId } from './challenges';
import { HIT, aimZone, cueState, gradeSwing, planShot, ringFill, timingWindow, type Grade, type Zone } from './hitTiming';
import { LESSONS, type Lesson } from './lessons';
import type { Stage } from '../scene/stage';
import type { HitCue } from '../scene/hitCue';
import type { ResultData, StartConfig, UI } from '../ui/ui';
import type { Sfx } from '../audio/sfx';

const clamp = MathUtils.clamp;
/** Turns a paddle around its handle so the red (forehand) rubber faces the other way. */
const FLIP = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);
const TOP = TABLE.height;

type Phase = 'idle' | 'serve' | 'toss' | 'rally' | 'dead' | 'over';

export interface MatchDeps {
  stage: Stage;
  ui: UI;
  sfx: Sfx;
  input: () => PaddleInput;
  /** Player 2's controller (versus mode only). */
  input2: () => PaddleInput | null;
  /** Player 2's handedness (from their phone). */
  hand2: () => Handedness;
  settings: () => Settings;
  stats: () => CareerStats;
  saveStats: () => void;
  /** Sends phase/score info to the phone screen. */
  phone: (
    msg: { screen: 'menu' | 'calibrate' | 'serve' | 'rally' | 'paused' | 'result'; label?: string } | { score: true } | { power: true } | { sound: 'bat'; q: number },
    side?: Side,
  ) => void;
}

/** Per-match tallies for the result screen. */
interface Tally {
  longestRally: number;
  fastest: number;
  winners: number;
  errors: number;
  aces: number;
  hits: number;
  pointsWon: number;
  pointsLost: number;
}

const freshTally = (): Tally => ({ longestRally: 0, fastest: 0, winners: 0, errors: 0, aces: 0, hits: 0, pointsWon: 0, pointsLost: 0 });

/** Rival names per difficulty — keep in sync with the play-setup cards in ui.ts. */
const DIFF_NAMES: Record<Difficulty, string> = { rookie: 'Pip', club: 'Max', pro: 'Rina', legend: 'Kaz' };

/**
 * Mirror between a side's local frame and the world. The local frame is the near player's view
 * (standing at +Z, facing −Z, right = +X); for the far end it is the world rotated π about Y.
 * Works for positions, velocities and spin vectors alike, and is its own inverse.
 */
const mir = (v: Vector3, s: 1 | -1) => (s > 0 ? v.clone() : new Vector3(-v.x, v.y, -v.z));

/** A human-controlled end: movement and paddle driven by a PaddleInput with auto-positioning. */
class HumanSide {
  readonly s: 1 | -1;
  body = new Vector3();
  vel = new Vector3();
  paddlePos = new Vector3();
  paddleRot = new Quaternion();
  backhand = false;
  /** 0..1 swing follow-through animation; <0 when idle. */
  swingT = -1;
  swingPower = 0;
  /** Swings / taps waiting to be played at the ideal contact moment (match clock). */
  pending: { e: SwingEvent; at: number }[] = [];
  /** Per incoming ball: feedback already shown. */
  tooEarlyShown = false;
  missShown = false;
  /** Where the incoming ball will bounce on this half (null once it has). */
  landing: Vector3 | null = null;
  /** Aim chosen with the phone's ◀ ▶ buttons for the next shot (overrides pointing). */
  aimOverride: Zone | null = null;
  lastZone: Zone = 0;
  lastGrade: Grade | null = null;
  /** Debug autoplayer (?auto=jitter): when it will swing at the current ball. */
  autoAt: number | null = null;
  autoDone = false;
  intercept: (Intercept & { at: number }) | null = null;
  interceptDirty = true;
  trajTimer = 0;
  lastKind: StrokeKind | null = null;
  fastest = 0;
  private target = new Vector3();

  constructor(readonly side: Side) {
    this.s = sideSign(side);
    this.reset();
  }

  reset() {
    this.body.set(0, 0, this.s * (HALF_L + 0.7));
    this.vel.set(0, 0, 0);
    this.target.copy(this.body);
    this.swingT = -1;
    this.pending = [];
    this.intercept = null;
    this.landing = null;
    this.aimOverride = null;
    this.tooEarlyShown = this.missShown = false;
    this.autoAt = null;
    this.autoDone = false;
    this.lastKind = null;
  }

  /** Target in the side's local frame (x to their right, z = distance from the net on their half). */
  setTarget(x: number, z: number) {
    this.target.set(this.s * clamp(x, -HALF_W - 1.0, HALF_W + 1.0), 0, this.s * clamp(z, HALF_L + 0.12, HALF_L + 2.2));
  }

  update(dt: number) {
    // Critically-damped spring toward the target with a speed cap — feels like quick side-steps.
    const k = 38;
    const c = 2 * Math.sqrt(k);
    const ax = (this.target.x - this.body.x) * k - this.vel.x * c;
    const az = (this.target.z - this.body.z) * k - this.vel.z * c;
    this.vel.x += ax * dt;
    this.vel.z += az * dt;
    const sp = Math.hypot(this.vel.x, this.vel.z);
    const max = 5;
    if (sp > max) this.vel.multiplyScalar(max / sp);
    this.body.addScaledVector(this.vel, dt);
    if (this.swingT >= 0) {
      this.swingT += dt / 0.32;
      if (this.swingT >= 1) this.swingT = -1;
    }
  }

  pose(): AvatarPose {
    return { body: this.body.clone(), paddlePos: this.paddlePos.clone(), paddleRot: this.paddleRot.clone() };
  }
}

/** Ball machine used by practice and drills. Fires from the opponent end. */
interface Feed {
  speed: [number, number];
  spin: 'top' | 'back' | 'mixed' | 'none' | 'high';
  /** Lateral spread (× half table width); default 1.3. */
  spread?: number;
}

export class Match {
  active = false;
  paused = false;
  mode: GameMode = 'demo';
  /** Slow-motion factor (1 = real time). */
  timeScale = 1;
  /** Debug/testing: the human side swings by itself at the ideal moment. */
  autoSwing = 0;

  readonly ball = new Ball();
  private ref = new Referee();
  private board: Scoreboard | null = null;
  private opp = new AIPlayer('opponent', 'club');
  private auto: AIPlayer | null = null; // autopilot on the player side (demo)
  /** Human-controlled ends: the near player (unless demo) and, in versus, the far player too. */
  private humans: Record<Side, HumanSide | null> = { player: new HumanSide('player'), opponent: null };
  private cfg: StartConfig = { mode: 'demo', difficulty: 'club', gamesToWin: 2 };
  private phase: Phase = 'idle';
  private phaseT = 0;
  private clock = 0;
  private server: Side = 'player';
  private oppPlan: (AIPlan & { at: number }) | null = null;
  private autoPlan: (AIPlan & { at: number }) | null = null;
  private serveReq: { request: ShotRequest; kind: StrokeKind; strikeAt: number } | null = null;
  private lastHitSpeed = 0;
  private ballVisible = false;
  private tally = freshTally();
  private streak = 0; // consecutive points (player +, opponent −)
  private slowmoT = 0;
  private overT = 0;
  private offSwing: (() => void)[] = [];
  // Slow-mo power-up (vs-AI matches): charges left this game and real seconds remaining.
  private powerCharges = 0;
  private powerT = 0;
  /** Eased approach slow-mo factor (see update). */
  private approachK = 1;
  /** Match clock of the latest strike or serve. */
  private lastHitAt = 0;
  /** Guided lesson (Learn to Play), null otherwise. */
  private lesson: (Lesson & { step: number; count: number }) | null = null;

  // Challenge / practice state
  private machine = false;
  private feed: Feed = { speed: [7, 10], spin: 'mixed' };
  private chal: {
    id: ChallengeId;
    score: number;
    timeLeft: number;
    feedsLeft: number;
    attempts: number;
    combo: number;
    rally: number;
    targets: { id: string; pos: Vector3; radius: number }[];
  } | null = null;
  private practiceStreak = 0;
  private practiceBest = 0;

  constructor(private d: MatchDeps) {
    this.bindInput();
  }

  /** Rebind swing listeners when an input changes (phone ↔ mouse, player 2 joining). */
  bindInput() {
    for (const off of this.offSwing) off();
    this.offSwing = [this.d.input().onSwing((e) => this.onSwing('player', e))];
    const p2 = this.d.input2();
    if (p2) this.offSwing.push(p2.onSwing((e) => this.onSwing('opponent', e)));
  }

  get versus() {
    return this.mode === 'versus';
  }
  get focusBall() {
    return this.ball.state.pos;
  }
  get focusPlayer() {
    return this.humans.player?.body ?? this.auto?.body ?? this.ball.state.pos;
  }
  get focusOpponent() {
    return this.humans.opponent?.body ?? this.opp.body;
  }

  private inputFor(side: Side): PaddleInput | null {
    return side === 'player' ? this.d.input() : this.d.input2();
  }
  private handOf(side: Side): Handedness {
    return side === 'player' ? this.d.settings().handedness : this.d.hand2();
  }
  private bodyOf(side: Side): Vector3 {
    return this.humans[side]?.body ?? (side === 'player' ? this.auto?.body : this.opp.body) ?? new Vector3();
  }
  private nameOf(side: Side): string {
    if (side === 'player') return this.d.settings().playerName || (this.versus ? 'Player 1' : 'You');
    return this.versus ? 'Player 2' : this.mode === 'demo' ? 'CPU' : DIFF_NAMES[this.cfg.difficulty];
  }
  private setSwingEnabled(on: boolean) {
    this.d.input().setSwingEnabled(on);
    this.d.input2()?.setSwingEnabled(on && this.versus);
  }

  // ───────────────────────────── lifecycle ─────────────────────────────
  start(cfg: StartConfig) {
    this.cfg = cfg;
    this.mode = cfg.mode;
    this.active = true;
    this.paused = false;
    this.tally = freshTally();
    this.streak = 0;
    this.timeScale = 1;
    this.slowmoT = 0;
    this.endPower(true);
    this.humans = { player: cfg.mode === 'demo' ? null : new HumanSide('player'), opponent: cfg.mode === 'versus' ? new HumanSide('opponent') : null };
    this.opp.setDifficulty(cfg.difficulty);
    this.opp.clearPlan();
    this.oppPlan = this.autoPlan = null;
    this.chal = null;
    this.machine = false;
    this.lesson = null;
    this.approachK = 1;
    this.auto = cfg.mode === 'demo' ? new AIPlayer('player', 'pro') : null;
    const { stage, ui } = this.d;
    stage.setTargets([]);
    stage.setTrajectory(null);
    const s = this.d.settings();
    stage.setAvatarColors('player', '#ff6b4a');
    stage.setAvatarColors('opponent', '#2ec4b6');

    if (cfg.mode === 'match' || cfg.mode === 'demo' || cfg.mode === 'versus') {
      this.server = Math.random() < 0.5 ? 'player' : 'opponent';
      this.board = new Scoreboard(cfg.mode === 'demo' ? 1 : cfg.gamesToWin, this.server);
      ui.hud.setChallenge(null);
    } else if (cfg.mode === 'practice') {
      this.board = null;
      this.machine = true;
      this.feed = { speed: [5.5, 8], spin: 'mixed' };
      this.practiceStreak = 0;
      ui.hud.setChallenge({ name: 'Practice', score: 0, best: this.practiceBest, detail: 'Return the machine balls' });
      this.setLesson(0);
    } else if (cfg.mode === 'challenge') {
      this.board = null;
      const def = challengeById(cfg.challengeId)!;
      this.chal = {
        id: def.id,
        score: 0,
        timeLeft: def.seconds ?? 0,
        feedsLeft: def.feeds ?? 0,
        attempts: def.id === 'rally' ? 3 : 0,
        combo: 0,
        rally: 0,
        targets: [],
      };
      if (def.id === 'rally') {
        this.opp.setDifficulty('club');
        this.server = 'player';
      } else {
        this.machine = true;
        this.feed =
          def.id === 'targets'
            ? { speed: [6.5, 9], spin: 'mixed' }
            : def.id === 'speed'
              ? { speed: [5, 6.5], spin: 'high' }
              : { speed: [6, 8.5], spin: 'back' };
      }
      if (def.id === 'targets') this.spawnTargets();
      this.refreshChallengeHud();
    }
    ui.hud.show(cfg.mode !== 'demo');
    ui.hud.setSplit(this.versus, this.versus ? [this.nameOf('player'), this.nameOf('opponent')] : undefined);
    stage.setSplit(this.versus);
    this.powerCharges = cfg.mode === 'match' ? SLOWMO.perGame : 0;
    this.refreshPowerHud();
    this.updateScoreHud();
    stage.setCameraMode(cfg.mode === 'demo' ? 'menu' : 'serve');
    this.setSwingEnabled(cfg.mode !== 'demo');
    if (cfg.mode !== 'demo') this.d.sfx.music('match');
    this.d.sfx.crowd(s.theme === 'arena' ? 0.5 : 0.25);
    this.beginPoint();
  }

  stop() {
    this.active = false;
    this.lesson = null;
    this.d.stage.setHitCue('player', null);
    this.d.stage.setHitCue('opponent', null);
    this.phase = 'idle';
    this.ballVisible = false;
    this.d.ui.hud.show(false);
    this.d.stage.setTargets([]);
    this.d.stage.setTrajectory(null);
    this.d.stage.setSplit(false);
    this.d.ui.hud.setSplit(false);
    this.endPower(true);
    this.d.ui.hud.setSlowMo(null);
    this.setSwingEnabled(false);
  }

  // ───────────────────────────── slow-mo power-up ─────────────────────────────
  /** Slow-mo is a vs-AI match feature only (not versus, practice or challenges). */
  get powerAvailable() {
    return this.mode === 'match';
  }

  /** Triggered by the phone's SLOW-MO button (or E). Returns true if it fired. */
  activatePower(): boolean {
    if (!this.active || this.paused || !this.powerAvailable) return false;
    if (this.powerT > 0 || this.powerCharges <= 0) return false;
    if (this.phase !== 'rally' && this.phase !== 'serve' && this.phase !== 'toss') return false;
    this.powerCharges--;
    this.powerT = SLOWMO.duration;
    this.d.sfx.slowMo(true);
    this.d.stage.setSlowMo(1);
    this.d.ui.hud.callout('SLOW-MO', 'gold', `${this.powerCharges} left this game`);
    this.d.input().vibrate([20, 40, 60]);
    this.refreshPowerHud();
    return true;
  }

  private endPower(silent = false) {
    if (this.powerT <= 0 && silent) {
      this.d.stage.setSlowMo(0);
      return;
    }
    this.powerT = 0;
    this.d.stage.setSlowMo(0);
    if (!silent) this.d.sfx.slowMo(false);
    this.refreshPowerHud();
  }

  private refreshPowerHud() {
    if (!this.powerAvailable) {
      this.d.ui.hud.setSlowMo(null);
    } else {
      this.d.ui.hud.setSlowMo({ charges: this.powerCharges, max: SLOWMO.perGame, active: this.powerT > 0, remaining: clamp(this.powerT / SLOWMO.duration, 0, 1) });
    }
    this.d.phone({ power: true });
  }

  /** Slow-mo state for the phone: charges < 0 hides the button. */
  phonePower() {
    return { charges: this.powerAvailable ? this.powerCharges : -1, max: SLOWMO.perGame, active: this.powerT > 0 };
  }

  // ───────────────────────────── points ─────────────────────────────
  private beginPoint() {
    this.phase = 'serve';
    this.phaseT = 0;
    this.oppPlan = this.autoPlan = null;
    this.opp.clearPlan();
    this.auto?.clearPlan();
    this.serveReq = null;
    this.d.stage.setTrajectory(null);
    this.humans.player?.reset();
    this.humans.opponent?.reset();
    if (this.machine) {
      // Machine feeds: no serve, the "point" starts with a feed after a beat.
      this.ballVisible = false;
      this.d.ui.hud.setPrompt(this.lesson?.title ?? null);
      return;
    }
    if (this.board) this.server = this.board.server();
    this.ref.startRally(this.server);
    this.ballVisible = true;
    this.placeBallInHand();
    const humanServes = !!this.humans[this.server];
    if (this.versus) {
      this.d.ui.hud.setPrompt(null, other(this.server));
      this.d.ui.hud.setPrompt('Swing or tap to serve', this.server);
    } else this.d.ui.hud.setPrompt(humanServes ? 'Swing (or tap the phone button) to serve' : null);
    this.d.stage.setCameraMode(this.mode === 'demo' ? 'menu' : 'serve');
    for (const side of ['player', 'opponent'] as const) {
      if (!this.humans[side]) continue;
      const serving = side === this.server;
      this.d.phone({ screen: serving ? 'serve' : 'rally', label: serving ? 'Your serve — swing!' : 'Get ready' }, side);
    }
    if (!humanServes) {
      const ai = this.server === 'player' ? this.auto! : this.opp;
      const sc = this.scoreFor(this.server);
      const plan = ai.planServe({ myScore: sc.mine, theirScore: sc.theirs });
      this.serveReq = { request: plan.request, kind: plan.kind, strikeAt: 0 };
      this.phaseT = -Math.max(0.6, plan.tossTime);
    }
  }

  private scoreFor(side: Side) {
    const p = this.board?.points ?? { player: 0, opponent: 0 };
    return { mine: p[side], theirs: p[other(side)] };
  }

  private serverHand(side: Side): Vector3 {
    const body = this.bodyOf(side);
    const s = sideSign(side);
    // Free hand slightly to the server's left (right-handed), just behind the end line.
    const hand = this.humans[side] && this.handOf(side) === 'left' ? 0.25 : -0.25;
    return new Vector3(clamp(body.x + hand * s, -HALF_W + 0.1, HALF_W - 0.1), TOP + 0.08, s * (HALF_L + 0.22));
  }

  private placeBallInHand() {
    const hand = this.serverHand(this.server);
    hand.y += Math.sin(this.clock * 3) * 0.015;
    this.ball.set(hand, new Vector3(), new Vector3());
  }

  private toss() {
    this.phase = 'toss';
    this.phaseT = 0;
    const p = this.serverHand(this.server);
    this.ball.set(p, new Vector3(0, 2.3, 0), new Vector3());
    this.d.ui.hud.setPrompt(null, this.server);
    this.d.sfx.whoosh(0.2);
  }

  private endPoint(r: PointResult) {
    if (this.phase === 'dead' || this.phase === 'over') return;
    this.phase = 'dead';
    this.phaseT = 0;
    this.oppPlan = this.autoPlan = null;
    if (this.humans.player) this.humans.player.pending = [];
    if (this.humans.opponent) this.humans.opponent.pending = [];
    this.d.stage.setTrajectory(null);
    const { ui, sfx, stage } = this.d;
    const playerWon = r.winner === 'player';
    this.tally.longestRally = Math.max(this.tally.longestRally, r.rally);
    if (this.versus) {
      this.endVersusPoint(r);
      return;
    }

    if (this.machine || this.chal?.id === 'rally') {
      this.endDrillPoint(r);
      return;
    }

    if (this.mode !== 'demo') {
      if (playerWon) this.tally.pointsWon++;
      else this.tally.pointsLost++;
      if (r.ace && playerWon) this.tally.aces++;
      if (playerWon && (r.reason === 'winner' || r.reason === 'missed' || r.reason === 'double-bounce') && !r.ace && r.rally > 1) this.tally.winners++;
      if (!playerWon && r.faultBy === 'player') this.tally.errors++;
      this.streak = playerWon ? Math.max(1, this.streak + 1) : Math.min(-1, this.streak - 1);
    }

    const text = this.calloutFor(r);
    if (this.mode !== 'demo') {
      ui.hud.callout(text.title, playerWon ? (r.ace || r.reason === 'winner' ? 'gold' : 'good') : 'bad', text.sub);
      sfx.score(playerWon);
      if (playerWon) sfx.applause(r.rally > 6 ? 0.9 : 0.5);
      else if (r.rally > 6) sfx.groan();
      this.d.input().vibrate(playerWon ? [30, 40, 30] : 120);
    } else if (r.rally > 5) sfx.applause(0.4);
    stage.fx.pointWon(r.winner);
    stage.avatarReact(r.winner, 'cheer');
    stage.avatarReact(other(r.winner), 'sad');
    stage.setCameraMode(this.mode === 'demo' ? 'menu' : 'point');

    if (!this.board) return;
    const res = this.board.award(r.winner);
    this.updateScoreHud();
    if (res.matchWon) {
      this.phase = 'over';
      this.overT = 0;
      this.timeScale = 0.35;
      this.slowmoT = 0.9;
      if (this.mode !== 'demo') {
        ui.hud.callout(res.matchWon === 'player' ? 'MATCH!' : 'GAME OVER', res.matchWon === 'player' ? 'gold' : 'bad');
        if (res.matchWon === 'player') {
          stage.fx.confetti();
          sfx.win();
        } else sfx.lose();
        stage.setCameraMode('celebrate');
      }
    } else if (res.gameWon && this.mode !== 'demo') {
      const g = this.board.games;
      // Fresh slow-mo charges every game.
      if (this.powerAvailable) {
        this.powerCharges = SLOWMO.perGame;
        this.refreshPowerHud();
      }
      setTimeout(() => ui.hud.callout(res.gameWon === 'player' ? 'GAME' : 'GAME LOST', res.gameWon === 'player' ? 'gold' : 'bad', `${g.player} – ${g.opponent} in games`), 900);
      this.phaseT = -1.2; // longer pause between games
    } else if (this.mode !== 'demo') {
      const gp = this.board.matchPoint() ?? this.board.gamePoint();
      if (this.board.deuce()) setTimeout(() => ui.hud.callout('DEUCE', 'neutral'), 900);
      else if (gp) setTimeout(() => ui.hud.callout(this.board!.matchPoint() ? 'MATCH POINT' : 'GAME POINT', gp === 'player' ? 'gold' : 'neutral'), 900);
    }
  }

  /** Versus: neutral callouts naming the point winner; both phones get feedback. */
  private endVersusPoint(r: PointResult) {
    const { ui, sfx, stage } = this.d;
    const name = this.nameOf(r.winner);
    const reason: Partial<Record<PointResult['reason'], string>> = {
      net: 'NET',
      out: 'OUT',
      'serve-fault': 'FAULT',
      'own-side': 'OWN SIDE',
      volley: 'VOLLEY',
      'double-hit': 'DOUBLE HIT',
    };
    const title = r.ace ? 'ACE!' : (reason[r.reason] ?? (this.lastHitSpeed > 16 ? 'WINNER!' : 'POINT'));
    ui.hud.callout(title, 'gold', `Point ${name}${r.rally > 4 ? ` · ${r.rally}-hit rally` : ''}`);
    sfx.score(true);
    sfx.applause(r.rally > 6 ? 0.9 : 0.5);
    this.inputFor(r.winner)?.vibrate([30, 40, 30]);
    this.inputFor(other(r.winner))?.vibrate(120);
    stage.fx.pointWon(r.winner);
    stage.avatarReact(r.winner, 'cheer');
    stage.avatarReact(other(r.winner), 'sad');
    stage.setCameraMode('point');
    const b = this.board!;
    const res = b.award(r.winner);
    this.updateScoreHud();
    if (res.matchWon) {
      this.phase = 'over';
      this.overT = 0;
      this.timeScale = 0.35;
      this.slowmoT = 0.9;
      ui.hud.callout(`${this.nameOf(res.matchWon).toUpperCase()} WINS!`, 'gold');
      stage.fx.confetti();
      sfx.win();
      stage.setCameraMode('celebrate', { side: res.matchWon });
    } else if (res.gameWon) {
      setTimeout(() => ui.hud.callout(`GAME ${this.nameOf(res.gameWon!)}`, 'gold', `${b.games.player} – ${b.games.opponent} in games`), 900);
      this.phaseT = -1.2;
    } else {
      const gp = b.matchPoint() ?? b.gamePoint();
      if (b.deuce()) setTimeout(() => ui.hud.callout('DEUCE', 'neutral'), 900);
      else if (gp) setTimeout(() => ui.hud.callout(b.matchPoint() ? 'MATCH POINT' : 'GAME POINT', 'neutral', this.nameOf(gp)), 900);
    }
  }

  private calloutFor(r: PointResult): { title: string; sub?: string } {
    const youWon = r.winner === 'player';
    if (r.ace) return { title: 'ACE!', sub: youWon ? 'Untouchable serve' : 'Ace against you' };
    switch (r.reason) {
      case 'net':
        return { title: 'NET', sub: youWon ? 'Point to you' : undefined };
      case 'out':
        return { title: 'OUT', sub: youWon ? 'Point to you' : undefined };
      case 'serve-fault':
        return { title: 'FAULT', sub: 'Illegal serve' };
      case 'own-side':
        return { title: 'OWN SIDE', sub: 'Must land on the far half' };
      case 'volley':
        return { title: 'VOLLEY', sub: 'Let it bounce first' };
      case 'double-hit':
        return { title: 'DOUBLE HIT' };
      case 'missed':
      case 'double-bounce':
        if (youWon) {
          if (this.streak >= 3) return { title: `${this.streak} IN A ROW`, sub: 'On fire!' };
          return { title: this.lastHitSpeed > 16 ? 'WINNER!' : 'POINT', sub: this.lastHitSpeed > 0 ? `${Math.round(this.lastHitSpeed * 3.6)} km/h` : undefined };
        }
        return { title: 'MISSED', sub: r.rally > 1 ? `${r.rally}-hit rally` : undefined };
      default:
        return { title: youWon ? 'WINNER!' : 'POINT LOST', sub: r.rally > 4 ? `${r.rally}-hit rally` : undefined };
    }
  }

  private updateScoreHud() {
    const s = this.d.settings();
    if (!this.board) return;
    const b = this.board;
    const names: [string, string] = [this.nameOf('player'), this.nameOf('opponent')];
    void s;
    this.d.ui.hud.setScore({
      points: { ...b.points },
      games: { ...b.games },
      server: b.server(),
      names,
      gamePoint: b.gamePoint(),
      matchPoint: b.matchPoint(),
    });
    this.d.stage.setScoreboard({ player: b.points.player, opponent: b.points.opponent, gamesP: b.games.player, gamesO: b.games.opponent, names });
    this.d.phone({ score: true }, 'player');
    if (this.versus) this.d.phone({ score: true }, 'opponent');
  }

  /** Score snapshot for a side's phone screen. */
  phoneScore(side: Side = 'player') {
    const b = this.board;
    if (!b) return null;
    const o = other(side);
    return { me: b.points[side], them: b.points[o], gamesMe: b.games[side], gamesThem: b.games[o], serving: b.server() === side };
  }

  // ───────────────────────────── drills ─────────────────────────────
  private launchFeed() {
    const f = this.feed;
    const x = (Math.random() - 0.5) * 0.6;
    const from = new Vector3(x, TOP + (f.spin === 'high' ? 0.45 : 0.25), -HALF_L - 0.25);
    const tx = (Math.random() - 0.5) * (HALF_W * (f.spread ?? 1.3));
    let tz = HALF_L * (0.45 + Math.random() * 0.45);
    let speed = MathUtils.lerp(f.speed[0], f.speed[1], Math.random());
    const kind = f.spin === 'mixed' ? (['top', 'back', 'none'] as const)[Math.floor(Math.random() * 3)] : f.spin;
    let spinX = 0;
    if (kind === 'top') spinX = 250 + Math.random() * 250; // topspin for a ball travelling +Z
    if (kind === 'back') spinX = -(300 + Math.random() * 250);
    if (kind === 'high') {
      // Juicy high ball: slow and lofted with a touch of float, lands mid-table and sits up.
      tz = HALF_L * (0.45 + Math.random() * 0.2);
      speed = 3.6 + Math.random() * 0.6;
      spinX = -120;
    }
    const target = new Vector3(tx, TOP, tz);
    const { vel, spin } = solveShot(from, { target, speed, spin: new Vector3(spinX, 0, 0), error: 0.05 });
    this.ref.startRally('opponent');
    this.ref.onHit('opponent');
    // A machine feed isn't a legal serve; tell the referee it already bounced on the feeder's half.
    this.ref.onEvent({ type: 'bounce', side: 'opponent', pos: from.clone(), speed: 1 });
    this.ball.set(from, vel, spin);
    this.ballVisible = true;
    this.phase = 'rally';
    this.phaseT = 0;
    if (this.humans.player) this.humans.player.interceptDirty = true;
    this.d.sfx.paddleHit(0.25, 'push');
    this.d.stage.setCameraMode('play');
    if (this.chal && this.chal.feedsLeft > 0) this.chal.feedsLeft--;
  }

  private endDrillPoint(r: PointResult) {
    const { ui, sfx, stage } = this.d;
    // In a drill the machine never returns: a clean return ends as a "winner" for the player.
    const ok = r.winner === 'player';
    if (this.mode === 'practice' && this.lesson) {
      if (!ok && r.rally > 1) ui.hud.callout('SO CLOSE', 'neutral', 'It counts — the ball just has to come back');
      return;
    }
    if (this.mode === 'practice') {
      this.practiceStreak = ok ? this.practiceStreak + 1 : 0;
      this.practiceBest = Math.max(this.practiceBest, this.practiceStreak);
      ui.hud.setChallenge({ name: 'Practice', score: this.practiceStreak, best: this.practiceBest, detail: ok ? 'Nice return' : this.calloutFor(r).title });
      if (ok) sfx.score(true);
      if (!ok) ui.hud.callout(this.calloutFor(r).title, 'bad');
      return;
    }
    const c = this.chal!;
    if (c.id === 'rally') {
      c.score = Math.max(c.score, r.rally);
      c.attempts--;
      ui.hud.callout(`${r.rally} HITS`, r.rally >= c.score ? 'gold' : 'neutral', c.attempts > 0 ? `${c.attempts} tr${c.attempts === 1 ? 'y' : 'ies'} left` : undefined);
      stage.setCameraMode('point');
      if (c.attempts <= 0) this.finishChallenge();
    } else if (c.id === 'speed') {
      if (ok && this.humans.player?.lastKind) {
        const kmh = Math.round(this.lastHitSpeed * 3.6);
        if (kmh > c.score) {
          c.score = kmh;
          ui.hud.callout(`${kmh} KM/H`, 'gold', 'New best');
        } else ui.hud.callout(`${kmh} km/h`, 'neutral');
      } else ui.hud.callout(this.calloutFor(r).title, 'bad');
      if (c.feedsLeft <= 0) this.finishChallenge();
    } else if (c.id === 'spin') {
      if (ok && (this.humans.player?.lastKind === 'loop' || this.humans.player?.lastKind === 'drive' || this.humans.player?.lastKind === 'flick')) {
        c.score++;
        ui.hud.callout('LOOP!', 'good', `${c.score}`);
        sfx.score(true);
      } else if (ok) ui.hud.callout('Too flat', 'neutral', 'Brush up through the ball');
      else ui.hud.callout(this.calloutFor(r).title, 'bad');
    } else if (c.id === 'targets') {
      if (!ok) {
        c.combo = 0;
        ui.hud.callout(this.calloutFor(r).title, 'bad');
      }
    }
    this.refreshChallengeHud();
  }

  private spawnTargets() {
    const c = this.chal!;
    const n = 3;
    c.targets = [];
    for (let i = 0; i < n; i++) c.targets.push(this.randomTarget(`t${Date.now()}-${i}`));
    this.d.stage.setTargets(c.targets.map((t) => ({ ...t, color: '#ffc94a' })));
  }

  private randomTarget(id: string) {
    const radius = 0.16 + Math.random() * 0.06;
    return {
      id,
      radius,
      pos: new Vector3((Math.random() * 2 - 1) * (HALF_W - radius - 0.04), TOP, -(0.3 + Math.random() * (HALF_L - 0.5))),
    };
  }

  private checkTargets(pos: Vector3) {
    const c = this.chal;
    if (!c || c.id !== 'targets') return;
    const hit = c.targets.find((t) => Math.hypot(t.pos.x - pos.x, t.pos.z - pos.z) <= t.radius + 0.02);
    if (!hit) {
      c.combo = 0;
      this.d.ui.hud.callout('MISS', 'neutral', 'Aim for the rings');
      return;
    }
    c.combo++;
    const pts = 100 * Math.min(c.combo, 5);
    c.score += pts;
    this.d.stage.hitTarget(hit.id);
    this.d.sfx.score(true);
    this.d.ui.hud.callout(`+${pts}`, 'gold', c.combo > 1 ? `Combo x${Math.min(c.combo, 5)}` : undefined);
    this.d.input().vibrate([20, 30, 20]);
    const idx = c.targets.indexOf(hit);
    c.targets[idx] = this.randomTarget(`t${Date.now()}`);
    setTimeout(() => this.chal && this.d.stage.setTargets(this.chal.targets.map((t) => ({ ...t, color: '#ffc94a' }))), 450);
    this.refreshChallengeHud();
  }

  private refreshChallengeHud() {
    const c = this.chal;
    if (!c) return;
    const def = challengeById(c.id)!;
    const best = this.d.stats().challengeBest[c.id] ?? 0;
    let detail = def.goal;
    if (def.seconds) detail = `${Math.ceil(Math.max(0, c.timeLeft))}s left`;
    if (def.feeds) detail = `${c.feedsLeft} balls left`;
    if (c.id === 'rally') detail = `${c.attempts} tries left · current ${c.rally}`;
    this.d.ui.hud.setChallenge({ name: def.name, score: c.score, best, detail });
  }

  private finishChallenge() {
    const c = this.chal!;
    const def = challengeById(c.id)!;
    const stats = this.d.stats();
    const prev = stats.challengeBest[c.id] ?? 0;
    const records: string[] = [];
    if (c.score > prev) {
      stats.challengeBest[c.id] = c.score;
      records.push(`New ${def.name} best: ${c.score} ${def.unit}`);
    }
    this.updateCareerFromTally(stats);
    this.d.saveStats();
    this.phase = 'over';
    this.overT = 0;
    const r: ResultData = {
      title: c.score > prev ? 'New Record!' : 'Challenge Complete',
      won: c.score > prev,
      mode: 'challenge',
      games: [],
      stats: [
        { label: 'Score', value: `${c.score} ${def.unit}` },
        { label: 'Personal best', value: `${Math.max(prev, c.score)} ${def.unit}` },
        { label: 'Longest rally', value: `${this.tally.longestRally}` },
        { label: 'Fastest shot', value: `${Math.round(this.tally.fastest * 3.6)} km/h` },
      ],
      newRecords: records,
    };
    if (c.score > prev) {
      this.d.stage.fx.confetti();
      this.d.sfx.win();
    }
    this.pendingResult = r;
  }

  /** Result waiting to be shown once the end-of-match beat finishes. */
  pendingResult: ResultData | null = null;
  onFinished: (r: ResultData) => void = () => {};

  private finishMatch() {
    const b = this.board!;
    if (this.versus) {
      // Local 2-player games don't count toward the single-player career.
      const winner: Side = b.games.player > b.games.opponent ? 'player' : 'opponent';
      const kmh = (side: Side) => `${Math.round((this.humans[side]?.fastest ?? 0) * 3.6)} km/h`;
      this.pendingResult = {
        title: `${this.nameOf(winner)} wins!`,
        won: true,
        mode: 'versus',
        games: b.gameScores.map((g) => ({ ...g })),
        stats: [
          { label: `${this.nameOf('player')} fastest`, value: kmh('player') },
          { label: `${this.nameOf('opponent')} fastest`, value: kmh('opponent') },
          { label: 'Longest rally', value: `${this.tally.longestRally}` },
          { label: 'Games', value: `${b.games.player} – ${b.games.opponent}` },
        ],
        newRecords: [],
      };
      return;
    }
    const won = b.games.player > b.games.opponent;
    const stats = this.d.stats();
    const records: string[] = [];
    if (this.tally.longestRally > stats.longestRally && stats.matchesPlayed > 0) records.push(`Longest rally: ${this.tally.longestRally}`);
    if (this.tally.fastest * 3.6 > stats.fastestShotKmh && stats.matchesPlayed > 0) records.push(`Fastest shot: ${Math.round(this.tally.fastest * 3.6)} km/h`);
    stats.matchesPlayed++;
    if (won) stats.matchesWon++;
    stats.aces += this.tally.aces;
    stats.pointsWon += this.tally.pointsWon;
    stats.pointsLost += this.tally.pointsLost;
    this.updateCareerFromTally(stats);
    this.d.saveStats();
    const total = this.tally.pointsWon + this.tally.pointsLost;
    this.pendingResult = {
      title: won ? 'Victory!' : 'Defeat',
      won,
      mode: 'match',
      games: b.gameScores.map((g) => ({ ...g })),
      stats: [
        { label: 'Points won', value: `${this.tally.pointsWon} / ${total}` },
        { label: 'Winners', value: `${this.tally.winners}` },
        { label: 'Unforced errors', value: `${this.tally.errors}` },
        { label: 'Aces', value: `${this.tally.aces}` },
        { label: 'Longest rally', value: `${this.tally.longestRally}` },
        { label: 'Fastest shot', value: `${Math.round(this.tally.fastest * 3.6)} km/h` },
      ],
      newRecords: records,
    };
  }

  private updateCareerFromTally(stats: CareerStats) {
    stats.longestRally = Math.max(stats.longestRally, this.tally.longestRally);
    stats.fastestShotKmh = Math.max(stats.fastestShotKmh, Math.round(this.tally.fastest * 3.6));
  }

  // ───────────────────────────── human hitting ─────────────────────────────
  private onSwing(side: Side, e: SwingEvent, tap = false) {
    const h = this.humans[side];
    if (!h || !this.active || this.paused || this.mode === 'demo') return;
    if (!tap) this.d.ui.hud.setSwingMeter(e.power, side);
    if (this.phase === 'serve' && this.server === side && !this.machine) {
      // One gesture serves: the toss is automatic and the swing is replayed at the contact moment.
      h.pending = [{ e, at: this.clock }];
      this.toss();
      return;
    }
    if (this.phase === 'toss' && this.server === side) {
      // A tap followed by a real swing: keep the stronger one.
      if (h.pending[0] && e.power > h.pending[0].e.power) h.pending[0].e = e;
      return;
    }
    if (this.phase !== 'rally' || this.ref.expecting !== side) {
      h.swingT = 0; // whiff animation
      h.swingPower = e.power;
      this.d.sfx.whoosh(e.power * 0.6);
      return;
    }
    h.pending.push({ e, at: this.clock });
    if (h.pending.length > 4) h.pending.shift();
  }

  /** Fallback "tap to hit": the phone's big button (or Enter) counts as a medium swing. */
  tap(side: Side) {
    const input = this.inputFor(side);
    if (!input || !this.humans[side]) return;
    const paddle = { ...input.state, orientation: input.state.orientation.clone() };
    this.onSwing(side, { time: performance.now(), power: 0.5, dir: { x: 0, y: 0.15, z: 1 }, paddle }, true);
  }

  /** Phone ◀ ▶ (or arrow keys): choose left / right for the next shot; pressing the other way recentres. */
  nudgeAim(side: Side, dir: -1 | 1) {
    const h = this.humans[side];
    if (!h || !this.active || this.paused) return;
    const cur = h.aimOverride ?? 0;
    h.aimOverride = (cur === -dir ? 0 : dir) as Zone;
    this.d.sfx.ui('move');
  }

  /** Timing window for the current assist level (lessons are extra forgiving). */
  private timing() {
    const a = this.d.settings().assist;
    return timingWindow(this.lesson ? Math.max(a, 0.85) : a);
  }

  /** True if this human can hit the ball right now (the game moves the paddle; only the bounce and height matter). */
  private humanCanStrike(h: HumanSide): boolean {
    if (!this.ref.readyToStrike) return false;
    const p = this.ball.state.pos;
    if (p.y < TOP - 0.12 || p.y > TOP + 1.1) return false;
    return h.s * p.z > -0.05;
  }

  private fakeSwing(power: number) {
    const paddle = { ...this.d.input().state, aimX: (Math.random() - 0.5) * 1.4, aimY: Math.random() * 0.6 - 0.2 };
    this.onSwing('player', { time: performance.now(), power, dir: { x: (Math.random() - 0.5) * 0.4, y: 0.2, z: 0.9 }, paddle });
  }

  private gradeFx(h: HumanSide, text: string, tone: 'gold' | 'good' | 'neutral' | 'bad', sub?: string) {
    if (this.mode === 'demo') return;
    this.d.ui.hud.hitGrade(text, tone, sub, this.versus ? h.side : undefined);
  }

  private updateHumanStrike(h: HumanSide) {
    const ic = h.intercept;
    if (this.autoSwing && h.side === 'player' && this.phase === 'rally' && this.ref.expecting === 'player' && ic) {
      // Human-like test bot: aims for the sweet spot with gaussian-ish timing error (± autoSwing s),
      // and can't react sooner than ~0.32 s after the opponent's hit.
      if (h.autoAt === null) {
        const jitter = (Math.random() + Math.random() + Math.random() - 1.5) * this.autoSwing;
        h.autoAt = Math.max(ic.at + ic.t - HIT.sweet - jitter, this.lastHitAt + 0.32);
      }
      if (!h.autoDone && this.clock >= h.autoAt) {
        h.autoDone = true;
        this.fakeSwing(0.3 + Math.random() * 0.5);
      }
    }
    if (this.phase !== 'rally' || this.ref.expecting !== h.side) {
      h.pending.length = 0;
      return;
    }
    if (!ic) {
      h.pending = h.pending.filter((p) => this.clock - p.at < 1.2);
      return;
    }
    const w = this.timing();
    const icAbs = ic.at + ic.t;
    const eta = icAbs - this.clock;
    // Swings far too early (ball still on the other side) are dropped with a friendly hint.
    const before = h.pending.length;
    h.pending = h.pending.filter((p) => icAbs - p.at <= w.openAt + HIT.buffer && icAbs - p.at >= w.lateLimit);
    if (h.pending.length < before && eta > 0 && !h.tooEarlyShown) {
      h.tooEarlyShown = true;
      this.gradeFx(h, 'TOO EARLY', 'neutral', 'Wait for the ring to close');
    }
    if (!h.pending.length) {
      if (eta < w.lateLimit && !h.missShown) {
        h.missShown = true;
        this.gradeFx(h, 'SWING!', 'bad', 'Swing or tap when the ring turns green');
      }
      return;
    }
    if (eta > 0.012) return; // an early swing is held until the ball reaches the paddle
    if (!this.humanCanStrike(h)) {
      if (eta < w.lateLimit - 0.15) h.pending.length = 0;
      return;
    }
    // The best-timed swing sets the grade; the strongest sets power and direction.
    let best: { g: ReturnType<typeof gradeSwing> } | null = null;
    let strongest = h.pending[0];
    for (const p of h.pending) {
      const g = gradeSwing(icAbs - p.at, w);
      if (!best || g.quality > best.g.quality) best = { g };
      if (p.e.power > strongest.e.power) strongest = p;
    }
    h.pending.length = 0;
    this.humanHit(h, strongest.e, best!.g);
  }

  /** Builds the shot in the hitter's local frame (see `mir`), then maps it to the world. */
  private humanHit(h: HumanSide, e: SwingEvent, g: { grade: Grade; quality: number }) {
    const s = this.d.settings();
    const from = this.ball.state.pos.clone();
    // Forgiving late hits: a ball that has already dropped is scooped back up to a playable height.
    from.y = Math.max(from.y, TOP + 0.05);
    const ps = e.paddle;
    const p = clamp(e.power * (0.75 + 0.25 * s.sensitivity), 0.05, 1);
    const zone = h.aimOverride ?? aimZone(ps.aimX, e.dir.x);
    const plan = planShot({ power: p, grade: g.grade, quality: g.quality, zone, lift: e.dir.y, face: ps.face, aboveNet: from.y - (TOP + TABLE.netHeight), halfWidth: HALF_W });
    const target = mir(new Vector3(plan.x, TOP, -(0.2 + plan.depth * (HALF_L - 0.25))), h.s);
    // Local frame: the ball travels −Z, so topspin is −X.
    const spin = mir(new Vector3(-plan.topspin, clamp(e.dir.x, -1, 1) * 100 * p, 0), h.s);
    let { speed, error } = plan;
    if (this.mode === 'match') {
      const t = HIT.vsCpu[this.cfg.difficulty];
      if (plan.kind !== 'smash') speed = Math.min(speed, t.maxSpeed);
      if (g.grade === 'early' || g.grade === 'late') {
        // Mistimed shots against strong CPUs are riskier and float up slower (smash bait).
        error *= t.errorScale;
        speed *= 1 - 0.1 * (t.errorScale - 1);
      }
    }
    const { vel, spin: outSpin } = solveShot(from, { target, speed, spin, error }, Math.random);
    this.applyHit(h.side, from, vel, outSpin, plan.kind, p, g.quality);
    h.lastKind = plan.kind;
    h.lastZone = zone;
    h.lastGrade = g.grade;
    h.aimOverride = null;
    h.swingT = 0;
    h.swingPower = p;
    const input = this.inputFor(h.side);
    if (s.haptics) input?.vibrate(g.grade === 'perfect' ? [40, 30, 40] : Math.round(22 + p * 35));
    this.d.phone({ sound: 'bat', q: g.grade === 'perfect' ? 1 : g.grade === 'good' ? 0.8 : 0.5 }, h.side);
    const label: Record<Grade, [string, 'gold' | 'good' | 'neutral', string | undefined]> = {
      perfect: ['PERFECT', 'gold', plan.kind === 'smash' ? 'Smash!' : plan.kind === 'loop' ? 'Topspin loop' : undefined],
      good: ['GOOD', 'good', undefined],
      early: ['EARLY', 'neutral', 'Wait a beat longer'],
      late: ['LATE', 'neutral', 'Swing a little sooner'],
    };
    const [t, tone, sub] = label[g.grade];
    this.gradeFx(h, t, tone, sub);
    this.onLessonHit(h, zone, p, g.grade);
  }

  private applyHit(by: Side, from: Vector3, vel: Vector3, spin: Vector3, kind: StrokeKind, power: number, quality: number) {
    const res = this.ref.onHit(by);
    this.lastHitAt = this.clock;
    this.ball.set(from, vel, spin);
    this.phaseT = 0; // stuck-ball timeout counts from the latest strike
    const sp = vel.length();
    this.lastHitSpeed = sp;
    const hitter = this.humans[by];
    if (hitter && this.mode !== 'demo') {
      hitter.fastest = Math.max(hitter.fastest, sp);
      if (by === 'player') {
        this.tally.hits++;
        this.tally.fastest = Math.max(this.tally.fastest, sp);
      }
      this.d.ui.hud.setShotSpeed(Math.round(sp * 3.6));
    }
    for (const h of [this.humans.player, this.humans.opponent]) if (h) h.interceptDirty = true;
    if (this.chal?.id === 'rally') {
      this.chal.rally = this.ref.rally;
      this.refreshChallengeHud();
    }
    this.d.ui.hud.setRally(this.ref.rally);
    this.d.sfx.paddleHit(power, kind);
    this.d.stage.fx.hit(from, power, by);
    if (power > 0.85 && kind === 'smash') this.d.stage.shake(0.25);
    if (this.mode !== 'demo' && this.ref.rally === 8) this.d.sfx.applause(0.3);
    this.d.stage.setCameraMode(this.mode === 'demo' ? 'menu' : 'play');
    void quality;
    if (res) this.endPoint(res);
    // Plan the other side's reply if it's an AI.
    const next = other(by);
    const ai = this.aiFor(next);
    if (ai && this.phase === 'rally') this.planFor(ai, next);
  }

  /** The AI playing `side`, or null for humans and the ball machine. */
  private aiFor(side: Side): AIPlayer | null {
    if (this.humans[side]) return null;
    if (side === 'opponent') return this.machine ? null : this.opp;
    return this.auto;
  }

  private planFor(ai: AIPlayer, side: Side) {
    const sc = this.scoreFor(side);
    const plan = ai.planReturn(this.ball.state, { opponentBody: this.bodyOf(other(side)), rally: this.ref.rally, myScore: sc.mine, theirScore: sc.theirs });
    const withAt = plan ? { ...plan, at: this.clock } : null;
    if (side === 'opponent') this.oppPlan = withAt;
    else this.autoPlan = withAt;
  }

  private runAIPlan(side: Side) {
    const plan = side === 'opponent' ? this.oppPlan : this.autoPlan;
    if (!plan || this.phase !== 'rally' || this.ref.expecting !== side) return;
    if (this.clock < plan.at + plan.t) return;
    if (side === 'opponent') this.oppPlan = null;
    else this.autoPlan = null;
    if (plan.willMiss) return;
    const pos = this.ball.state.pos;
    if (pos.distanceTo(plan.strikePos) > 0.35 || !this.ref.readyToStrike) return; // trajectory changed (net cord etc.)
    const { vel, spin } = solveShot(pos.clone(), plan.request, Math.random);
    this.applyHit(side, pos.clone(), vel, spin, plan.kind, clamp(plan.request.speed / 20, 0.1, 1), 1 - plan.request.error);
  }

  // ───────────────────────────── lessons ─────────────────────────────
  private setLesson(i: number) {
    const { ui } = this.d;
    if (i >= LESSONS.length) {
      this.lesson = null;
      this.feed = { speed: [5.5, 8], spin: 'mixed' };
      ui.hud.setPrompt(null);
      ui.hud.callout("YOU'RE READY!", 'gold', 'Free practice now — or Pause → Quit to play a match');
      this.d.stage.fx.confetti();
      this.d.sfx.win();
      ui.hud.setChallenge({ name: 'Practice', score: this.practiceStreak, best: this.practiceBest, detail: 'Return the machine balls' });
      return;
    }
    const l = LESSONS[i];
    this.lesson = { ...l, step: i, count: 0 };
    this.feed = { ...l.feed };
    ui.hud.setPrompt(l.title);
    this.refreshLessonHud();
  }

  private refreshLessonHud() {
    const l = this.lesson;
    if (!l) return;
    this.d.ui.hud.setChallenge({ name: `Lesson ${l.step + 1} / ${LESSONS.length}`, score: l.count, best: l.need, detail: l.detail });
  }

  private onLessonHit(h: HumanSide, zone: Zone, power: number, grade: Grade) {
    const l = this.lesson;
    if (!l || h.side !== 'player') return;
    if (!l.check({ zone, power, grade })) {
      if (l.step >= 2 && l.step <= 3) this.d.ui.hud.callout(zone === 0 ? 'MIDDLE' : zone < 0 ? 'LEFT' : 'RIGHT', 'neutral', l.detail);
      if (l.step === 4) this.d.ui.hud.callout('HARDER!', 'neutral', 'Really whip it');
      return;
    }
    l.count++;
    this.refreshLessonHud();
    if (l.count >= l.need) {
      const next = l.step + 1;
      if (next < LESSONS.length) this.d.ui.hud.callout('GREAT!', 'good', `Lesson ${next + 1} of ${LESSONS.length}`);
      setTimeout(() => this.active && this.mode === 'practice' && this.lesson?.step === l.step && this.setLesson(next), 900);
    }
  }

  // ───────────────────────────── per-frame ─────────────────────────────
  update(rawDt: number) {
    if (!this.active || this.paused) return;
    // Time scale: end-of-match slow-mo wins over the power-up, which wins over real time.
    if (this.slowmoT > 0) this.slowmoT -= rawDt;
    if (this.powerT > 0) {
      this.powerT -= rawDt;
      if (this.powerT <= 0) this.endPower();
      else this.d.ui.hud.setSlowMo({ charges: this.powerCharges, max: SLOWMO.perGame, active: true, remaining: this.powerT / SLOWMO.duration });
    }
    this.timeScale = this.slowmoT > 0 ? 0.35 : this.powerT > 0 ? SLOWMO.timeScale : 1;
    // Approach slow-mo: time eases down while a human's hit window is open (more with assist / in lessons).
    let approach = this.lesson?.slow ?? 1;
    if (this.phase === 'rally' && this.mode !== 'demo') {
      const w = this.timing();
      for (const h of [this.humans.player, this.humans.opponent]) {
        if (!h?.intercept || this.ref.expecting !== h.side) continue;
        const eta = h.intercept.at + h.intercept.t - this.clock;
        if (eta < w.openAt && eta > w.lateLimit) approach *= w.approachScale;
      }
    }
    this.approachK += (approach - this.approachK) * (1 - Math.exp(-rawDt * 10));
    this.timeScale *= this.approachK;
    const dt = rawDt * this.timeScale;
    this.clock += dt;
    this.phaseT += dt;

    // Challenge clocks
    if (this.chal && challengeById(this.chal.id)?.seconds && this.phase !== 'over') {
      this.chal.timeLeft -= dt;
      if (Math.floor(this.chal.timeLeft + dt) !== Math.floor(this.chal.timeLeft)) this.refreshChallengeHud();
      if (this.chal.timeLeft <= 0) this.finishChallenge();
    }

    switch (this.phase) {
      case 'serve':
        this.updateServe();
        break;
      case 'toss':
        this.updateToss(dt);
        break;
      case 'rally':
        this.stepBall(dt, true);
        for (const h of [this.humans.player, this.humans.opponent]) if (h) this.updateHumanStrike(h);
        this.runAIPlan('opponent');
        this.runAIPlan('player');
        if (this.phaseT > 6) this.endPoint({ winner: this.ref.lastHitter ?? 'opponent', reason: 'missed', rally: this.ref.rally, ace: false });
        break;
      case 'dead':
        this.stepBall(dt, false);
        if (this.phaseT > 1.7) {
          this.d.stage.avatarReact('player', 'idle');
          this.d.stage.avatarReact('opponent', 'idle');
          this.beginPoint();
        }
        break;
      case 'over':
        this.stepBall(dt, false);
        this.overT += rawDt;
        if (this.overT > 2.2) {
          if (this.mode === 'demo') {
            this.start(this.cfg);
            return;
          }
          if (!this.pendingResult && this.board) this.finishMatch();
          const r = this.pendingResult;
          this.pendingResult = null;
          this.phase = 'idle';
          this.timeScale = 1;
          if (r) this.onFinished(r);
        }
        break;
    }

    for (const h of [this.humans.player, this.humans.opponent]) if (h) this.updateHumanPose(h, dt);
    if (!this.humans.opponent) this.opp.update(dt);
    this.auto?.update(dt);
    this.present();
  }

  private updateServe() {
    const p1 = this.humans.player;
    if (this.autoSwing && p1 && this.server === 'player' && !this.machine && this.phaseT > 1.2 && !p1.pending.length) this.fakeSwing(0.5);
    if (this.machine) {
      if (this.phaseT > (this.chal?.id === 'speed' ? 1.4 : 1.1)) this.launchFeed();
      return;
    }
    this.placeBallInHand();
    if (this.serveReq && this.phaseT >= 0) this.toss();
  }

  private updateToss(dt: number) {
    this.ball.step(dt); // events ignored: the ball is behind the end line in the air
    const st = this.ball.state;
    // Strike as the ball drops back to ~net height.
    if (st.vel.y < 0 && st.pos.y <= TOP + 0.27) {
      const from = st.pos.clone();
      const h = this.humans[this.server];
      if (h) {
        const e = h.pending[0]?.e;
        h.pending = [];
        const p = clamp(e?.power ?? 0.4, 0.1, 1);
        const ps = e?.paddle;
        // Serves always go in-ish: left / middle / right from where you point, deeper when you swing harder.
        const zone = h.aimOverride ?? aimZone(ps?.aimX ?? 0, e?.dir.x ?? 0);
        h.aimOverride = null;
        const target = mir(new Vector3(zone * HALF_W * 0.5, TOP, -(0.65 + p * 0.45)), h.s);
        const backspin = (ps?.face ?? 0) > 0.5 || (e?.dir.y ?? 0) < -0.45;
        const spin = mir(new Vector3(backspin ? 250 + 150 * p : -(150 + 200 * p), 0, 0), h.s);
        const req: ShotRequest = { target, speed: 4.8 + p * 4.5, spin, error: 0.05 };
        const { vel, spin: sp } = solveServe(from, this.server, req, Math.random);
        this.ref.onHit(this.server);
        this.ball.set(from, vel, sp);
        this.afterServe(this.server, vel.length(), p);
      } else if (this.serveReq) {
        const { vel, spin } = solveServe(from, this.server, this.serveReq.request, Math.random);
        this.ref.onHit(this.server);
        this.ball.set(from, vel, spin);
        this.afterServe(this.server, vel.length(), 0.4);
      }
    }
  }

  private afterServe(by: Side, speed: number, power: number) {
    this.lastHitAt = this.clock;
    this.phase = 'rally';
    this.phaseT = 0;
    this.lastHitSpeed = speed;
    for (const h of [this.humans.player, this.humans.opponent]) if (h) h.interceptDirty = true;
    this.d.ui.hud.setRally(1);
    this.d.sfx.paddleHit(power * 0.7, 'serve');
    this.d.stage.fx.hit(this.ball.state.pos, power * 0.6, by);
    this.d.stage.setCameraMode(this.mode === 'demo' ? 'menu' : 'play');
    const h = this.humans[by];
    if (h) {
      h.swingT = 0;
      h.swingPower = power;
      this.inputFor(by)?.vibrate(25);
    }
    this.d.phone({ screen: 'rally' }, 'player');
    if (this.versus) this.d.phone({ screen: 'rally' }, 'opponent');
    const next = other(by);
    const ai = this.aiFor(next);
    if (ai) this.planFor(ai, next);
  }

  private stepBall(dt: number, rules: boolean) {
    const events = this.ball.step(dt);
    for (const ev of events) {
      this.presentEvent(ev);
      if (!rules || this.phase !== 'rally') continue;
      if (ev.type === 'bounce' || ev.type === 'net' || ev.type === 'edge') {
        for (const h of [this.humans.player, this.humans.opponent]) if (h) h.interceptDirty = true;
      }
      if (ev.type === 'bounce' && ev.side === 'opponent' && this.ref.lastHitter === 'player' && this.ref.rally > 1) this.checkTargets(ev.pos);
      const r = this.ref.onEvent(ev);
      if (r === 'let') {
        this.phase = 'dead';
        this.phaseT = 0.3;
        this.d.ui.hud.callout('LET', 'neutral', 'Replay the serve');
        break;
      }
      if (r) {
        this.endPoint(r);
        break;
      }
      // Net cord changes the path: re-plan the AI reply.
      if (ev.type === 'net') {
        const ai = this.aiFor(this.ref.expecting);
        if (ai) this.planFor(ai, this.ref.expecting);
      }
    }
    for (const h of [this.humans.player, this.humans.opponent]) {
      if (!h) continue;
      if (rules && this.phase === 'rally' && this.ref.expecting === h.side) {
        h.trajTimer -= dt;
        // Freeze the contact point once the ball is nearly there, so a late swing is judged against it
        // (re-solving would just find a later point further down the path).
        const close = h.intercept && h.intercept.at + h.intercept.t - this.clock < 0.15;
        if (h.interceptDirty || (h.trajTimer <= 0 && !close)) {
          h.interceptDirty = false;
          h.trajTimer = 0.12;
          const ic = findIntercept(this.ball.state, h.side, this.ref.readyToStrike);
          h.intercept = ic ? { ...ic, at: this.clock } : null;
          if (!this.ref.readyToStrike) {
            const path = predictPath(this.ball.state, Math.min(1.8, (ic?.t ?? 1.4) + 0.1), 1 / 90);
            const bp = path.find((pp) => pp.bounces > 0 && h.s * pp.pos.z > 0);
            h.landing = bp ? bp.pos.clone() : null;
          } else h.landing = null;
          if (this.d.settings().showTrajectory && this.mode !== 'demo' && !this.versus) {
            const path = predictPath(this.ball.state, Math.min(1.6, (ic?.t ?? 1.2) + 0.15), 1 / 60);
            this.d.stage.setTrajectory(path.map((pp) => pp.pos));
          }
        }
      } else if (h.intercept) {
        h.intercept = null;
        h.landing = null;
        h.tooEarlyShown = h.missShown = false;
        h.autoAt = null;
        h.autoDone = false;
        if (h.side === 'player') this.d.stage.setTrajectory(null);
      }
    }
  }

  private presentEvent(ev: BallEvent) {
    const { sfx, stage } = this.d;
    switch (ev.type) {
      case 'bounce':
        sfx.tableBounce(ev.speed);
        stage.fx.bounce(ev.pos, ev.side);
        break;
      case 'edge':
        sfx.tableBounce(3);
        stage.fx.bounce(ev.pos, ev.side);
        break;
      case 'net':
        sfx.netHit();
        stage.fx.net(ev.pos);
        break;
      case 'floor':
        if (ev.speed > 0.6) sfx.floorBounce(ev.speed);
        if (ev.speed > 2) stage.fx.floor(ev.pos);
        break;
    }
  }

  /**
   * Human body + paddle, in the side's local frame. Fully automatic: the player walks to the ball and
   * the paddle is pulled onto it as it arrives, so the human only has to time the swing.
   */
  private updateHumanPose(h: HumanSide, dt: number) {
    const input = this.inputFor(h.side);
    if (!input) return;
    const st = input.state;
    const hand = this.handOf(h.side) === 'left' ? -1 : 1;
    const ic = h.intercept;
    const incoming = this.phase === 'rally' && this.ref.expecting === h.side && ic;
    const icL = incoming ? mir(ic.pos, h.s) : null;

    // Forehand unless the ball comes well over to the off-hand side.
    const backhand = icL ? icL.x * hand < -0.3 : false;
    h.backhand = backhand;
    const offX = (backhand ? -0.12 : 0.42) * hand;
    if (icL) h.setTarget(icL.x - offX, icL.z + 0.38);
    else if (this.phase === 'serve' || this.phase === 'toss') h.setTarget(this.server === h.side ? -0.25 * hand : 0.1 * hand, HALF_L + 0.55);
    else h.setTarget(-offX * 0.4, HALF_L + 0.75);
    h.update(dt);

    const b = mir(h.body, h.s);
    const aimL = new Vector3(b.x + offX, TOP + 0.16 + st.aimY * 0.1, b.z - (backhand ? 0.42 : 0.3));
    if (icL) {
      // Paddle magnet: glides onto the contact point during the last ~0.6 s.
      const tt = ic!.at + ic!.t - this.clock;
      const magnet = clamp(1 - (tt - 0.05) / 0.6, 0, 1) * 0.97;
      aimL.lerp(icL, magnet);
    }
    // Follow-through: forward and up along the swing.
    if (h.swingT >= 0) {
      const k = Math.sin(Math.PI * h.swingT);
      aimL.z -= k * (0.12 + 0.25 * h.swingPower);
      aimL.y += h.swingT * 0.18 * h.swingPower;
      aimL.x -= k * 0.18 * hand * (backhand ? -1 : 1) * h.swingPower;
    }
    h.paddlePos.lerp(mir(aimL, h.s), 1 - Math.exp(-dt * 28));
    // The controller's rotation is a delta in the near player's frame; for the far end, turn it around.
    h.paddleRot.copy(st.orientation);
    if (h.s < 0) h.paddleRot.premultiply(FLIP);
  }

  /** Timing ring, landing marker and aim pads for a human side. */
  private cueFor(h: HumanSide): HitCue | null {
    if (this.mode === 'demo' || this.phase !== 'rally' || this.ref.expecting !== h.side || !h.intercept) return null;
    const w = this.timing();
    const eta = h.intercept.at + h.intercept.t - this.clock;
    if (eta > w.openAt + 0.6 || eta < w.lateLimit - 0.1) return null;
    const input = this.inputFor(h.side);
    const zone = h.aimOverride ?? aimZone(input?.state.aimX ?? 0, 0);
    const depth = -(0.2 + 0.62 * (HALF_L - 0.25));
    const pad = (z: number) => mir(new Vector3(z * HALF_W * HIT.padX, TOP, depth), h.s);
    return {
      ball: this.ball.state.pos,
      fill: ringFill(eta, w),
      state: h.pending.length ? 'armed' : cueState(eta, w),
      landing: h.landing,
      pads: [pad(-1), pad(0), pad(1)],
      zone,
    };
  }

  private present() {
    const { stage, ui } = this.d;
    const st = this.ball.state;
    stage.setBall(st.pos, st.spin, this.ballVisible);
    const p1 = this.humans.player;
    if (p1) stage.setAvatar('player', p1.pose(), { backhand: p1.backhand, handedness: this.handOf('player'), swing: Math.max(0, p1.swingT) });
    else if (this.auto) stage.setAvatar('player', this.auto.paddle, { handedness: 'right', backhand: this.auto.backhand, swing: this.auto.swing });
    const p2 = this.humans.opponent;
    if (p2) stage.setAvatar('opponent', p2.pose(), { backhand: p2.backhand, handedness: this.handOf('opponent'), swing: Math.max(0, p2.swingT) });
    else {
      const op = this.opp.paddle;
      stage.setAvatar('opponent', { body: op.body, paddlePos: op.paddlePos, paddleRot: op.paddleRot.clone().multiply(FLIP) }, { handedness: 'right', backhand: this.opp.backhand, swing: this.opp.swing });
    }
    stage.setHitCue('player', p1 ? this.cueFor(p1) : null);
    stage.setHitCue('opponent', p2 ? this.cueFor(p2) : null);
    if (this.mode !== 'demo') {
      ui.hud.setSwingMeter(this.d.input().state.swing, 'player');
      const in2 = this.d.input2();
      if (this.versus && in2) ui.hud.setSwingMeter(in2.state.swing, 'opponent');
    }
  }
}
