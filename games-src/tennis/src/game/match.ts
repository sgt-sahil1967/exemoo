import * as THREE from 'three';
import { COURT, clamp, gauss, lerp } from '../constants';
import { Athlete, type Stroke } from '../players/athlete';
import {
  BallState,
  PHYS_DT,
  courtHalf,
  inBox,
  predict,
  serviceBox,
  solveShot,
  stepBall,
  type BallEvent,
  type Box,
} from '../physics/ball';
import type { World } from '../scene/world';
import { BallView, Effects } from '../scene/fx';
import type { ChaseCamera } from '../camera/chase';
import type { InputSource, SwingIntent } from '../input/swing';
import type { Sfx } from '../audio';
import type { Grade, Mode, UI } from '../ui/ui';
import { ROOKIE, aiServe, aiShot, feedShot, findContact, type Contact, type ShotPlan } from './ai';
import { SetScore, other, type Side } from './rules';

type Phase = 'idle' | 'serveReady' | 'toss' | 'rally' | 'pointOver' | 'done';

const SWING_LEAD = 0.07;
const PLAYER_REACH = 1.9;
const TOSS_VY = 5.4;
const SERVE_IDEAL_H = 2.85;
const GOAL_TARGET = 3;
const PRACTICE_BALLS = 3;
const GOAL_BALLS = 12;

interface PendingHit {
  at: number;
  grade: Grade;
  dt: number;
  intent: SwingIntent;
  stroke: Stroke;
  serve: boolean;
}

interface Stats {
  pointsWon: number;
  winners: number;
  aces: number;
  perfects: number;
  fastest: number;
  longestRally: number;
  doubleFaults: number;
}

const todayKey = () => `courtace.goal.${new Date().toISOString().slice(0, 10)}`;

export function loadGoal(): number {
  try {
    return Number(localStorage.getItem(todayKey()) ?? 0) || 0;
  } catch {
    return 0;
  }
}

function saveGoal(n: number) {
  try {
    localStorage.setItem(todayKey(), String(n));
  } catch {
    /* storage unavailable */
  }
}

export class Match {
  me = new Athlete({ shirt: '#1f5fd6', shorts: '#f2f2f2', skin: '#d7a27c', hair: '#2a1a12', shoes: '#ffffff', band: '#c8ff2e', racket: '#c8ff2e' }, 1);
  ai = new Athlete({ shirt: '#d62839', shorts: '#1b1b24', skin: '#a8714f', hair: '#111111', shoes: '#f5f5f5', band: '#ffffff', racket: '#e8e8e8' }, -1);
  ball = new BallState();
  ballView = new BallView();
  fx = new Effects();
  paused = false;
  /** Debug: swing automatically with random timing error (seconds). */
  autoPlay: number | null = null;
  mode: Mode = 'match';
  time = 0;

  private phase: Phase = 'idle';
  private score = new SetScore(0);
  private acc = 0;
  private events: BallEvent[] = [];
  private ballLive = false;
  private ballVisible = false;
  private holder: Athlete | null = null;

  // Rally state.
  private lastHitter: Side = 1;
  private bounces = 0;
  private isServe = false;
  private serveNum: 1 | 2 = 1;
  private serveBox: Box = serviceBox(0, 'deuce');
  private server: Side = 0;
  private rallyCount = 0;
  private phaseAt = 0;
  private next: (() => void) | null = null;

  // Player.
  private myContact: Contact | null = null;
  private pending: PendingHit | null = null;
  private serveIdealAt = 0;

  // AI.
  private aiContact: Contact | null = null;
  private aiPlays = true;
  private aiReactAt = 0;
  private aiSwung = false;
  private aiServeAt = 0;
  /** Distance the AI needed to cover for the current ball. */
  private aiRun = 0;
  private aiTossed = false;

  // Modes.
  private feeds = 0;
  private successes = 0;
  private goalCount = loadGoal();
  private stats!: Stats;

  constructor(
    private world: World,
    private ui: UI,
    private sfx: Sfx,
    private input: InputSource,
    private cam: ChaseCamera,
  ) {
    world.scene.add(this.me.root, this.ai.root, this.ballView.group, this.fx.group);
    this.me.maxSpeed = 6.6;
    this.ai.maxSpeed = ROOKIE.speed;
    this.ai.accel = 16;
    this.input.onSwing((i) => this.onSwing(i));
    this.resetPositions();
    this.ui.setGoal(this.goalCount, GOAL_TARGET);
  }

  get active() {
    return this.phase !== 'idle' && this.phase !== 'done';
  }

  // ------------------------------------------------------------------ lifecycle

  start(mode: Mode) {
    this.mode = mode;
    this.score = new SetScore(0);
    this.stats = { pointsWon: 0, winners: 0, aces: 0, perfects: 0, fastest: 0, longestRally: 0, doubleFaults: 0 };
    this.feeds = 0;
    this.successes = 0;
    this.paused = false;
    this.fx.targetBand.visible = mode === 'goal';
    this.input.enabled = true;
    this.cam.mode = 'chase';
    this.ui.hideResult();
    this.refreshScore();
    this.updateProgress();
    if (mode === 'match') this.setupServe();
    else this.setupFeed();
  }

  stop() {
    this.phase = 'idle';
    this.input.enabled = false;
    this.ballVisible = false;
    this.ballLive = false;
    this.fx.targetBand.visible = false;
    this.fx.reticle.visible = false;
    this.cam.mode = 'orbit';
    this.ui.hint(null);
    this.resetPositions();
  }

  debugTiebreak() {
    this.score.forceTiebreak();
    this.refreshScore();
  }

  private resetPositions() {
    this.me.pos.set(0.4, 0, COURT.halfLen + 0.6);
    this.ai.pos.set(-0.4, 0, -COURT.halfLen - 0.6);
    for (const a of [this.me, this.ai]) {
      a.vel.set(0, 0, 0);
      a.target = a.pos.clone();
      a.holdingBall = false;
    }
  }

  private schedule(delay: number, f: () => void) {
    this.phaseAt = this.time + delay;
    this.next = f;
  }

  // ------------------------------------------------------------------ serving

  private setupServe() {
    this.phase = 'serveReady';
    this.server = this.score.server;
    const side = this.score.serveSide;
    const srv = this.server === 0 ? this.me : this.ai;
    const rcv = this.server === 0 ? this.ai : this.me;
    // Deuce side is the server's right: +x for the near player, −x for the far player.
    const right = srv.facing;
    const sx = (side === 'deuce' ? 1 : -1) * right * 0.75;
    srv.pos.set(sx, 0, srv.facing * (COURT.halfLen + 0.25));
    this.serveBox = serviceBox(this.server, side);
    const boxCx = (this.serveBox.x0 + this.serveBox.x1) / 2;
    rcv.pos.set(boxCx * 1.15, 0, rcv.facing * (COURT.halfLen + 1.0));
    for (const a of [srv, rcv]) {
      a.vel.set(0, 0, 0);
      a.target = a.pos.clone();
    }
    srv.holdingBall = true;
    rcv.holdingBall = false;
    this.holder = srv;
    this.ballLive = false;
    this.ballVisible = true;
    this.ball.rolling = false;
    this.ball.touchedNet = false;
    this.ball.spin = 0;
    this.ballView.resetTrail();
    this.pending = null;
    this.myContact = null;
    this.aiContact = null;
    this.rallyCount = 0;
    this.ui.rally(0);
    if (this.server === 0) {
      this.ui.hint(this.serveNum === 1 ? '<b>Click</b> or <b>Space</b> to toss, again at the top to serve' : '<b>Second serve</b> — toss when ready');
    } else {
      this.ui.hint(null);
      this.aiServeAt = this.time + 1.4;
      this.aiTossed = false;
    }
    this.refreshScore();
  }

  private toss(srv: Athlete) {
    srv.holdingBall = false;
    this.holder = null;
    srv.leftHandWorld(this.ball.p);
    this.ball.p.y = Math.max(this.ball.p.y, 1.5);
    this.ball.v.set(0, TOSS_VY, -0.25 * srv.facing);
    this.ball.spin = 0;
    this.ball.rolling = false;
    this.ballLive = true;
    this.phase = 'toss';
    const y0 = this.ball.p.y;
    const t = (TOSS_VY + Math.sqrt(Math.max(0, TOSS_VY * TOSS_VY - 2 * 9.81 * (SERVE_IDEAL_H - y0)))) / 9.81;
    this.serveIdealAt = this.time + t;
    // Hold the trophy pose until the hit is triggered.
    srv.startSwing('serve', this.time, this.time + (srv === this.me ? 2 : t));
    this.sfx.whoosh();
  }

  private serveHit(by: Side, grade: Grade, dt: number, intent: SwingIntent | null) {
    const box = this.serveBox;
    const from = this.ball.p.clone();
    let plan: ShotPlan;
    if (by === 0 && intent) {
      const second = this.serveNum === 2;
      const u = (intent.aimX + 1) / 2;
      const tx = lerp(box.x0 + 0.35, box.x1 - 0.35, u);
      const tz = -lerp(4.0, 6.0, (intent.aimY + 1) / 2);
      const sigma = { PERFECT: 0.18, GOOD: 0.42, EARLY: 0.85, LATE: 0.85 }[grade] * (second ? 0.7 : 1);
      let pace = { PERFECT: 46, GOOD: 41, EARLY: 33, LATE: 33 }[grade] + intent.flick * 3;
      if (second) pace *= 0.74;
      plan = {
        target: new THREE.Vector3(tx + gauss() * sigma, 0, tz + gauss() * sigma + (grade === 'EARLY' ? -0.7 : 0)),
        pace,
        spin: second ? 0.9 : 0.25,
        clearance: second ? 0.35 : 0.08,
      };
    } else {
      plan = aiServe(box, this.serveNum === 2);
    }
    const v = solveShot(from, plan.target, plan.pace, plan.spin, plan.clearance);
    if (grade === 'LATE' && Math.abs(dt) > 0.12 && Math.random() < 0.5) v.y -= 1.4; // into the net
    this.launch(by, v, plan.spin, true);
    if (by === 0) this.afterPlayerHit(grade, v);
  }

  // ------------------------------------------------------------------ feeds (practice/goal)

  private setupFeed() {
    this.phase = 'serveReady';
    this.ai.pos.set(0, 0, -COURT.halfLen + 0.4);
    this.ai.target = this.ai.pos.clone();
    this.me.target = new THREE.Vector3(0.3, 0, COURT.halfLen + 0.6);
    this.ai.holdingBall = true;
    this.holder = this.ai;
    this.ballLive = false;
    this.ballVisible = true;
    this.ballView.resetTrail();
    this.myContact = null;
    this.pending = null;
    this.rallyCount = 0;
    this.ui.rally(0);
    this.ui.hint(this.feeds === 0 ? 'Swing with <b>Click</b> / <b>Space</b> as the ball reaches you — mouse aims' : null);
    this.schedule(1.3, () => {
      this.ai.holdingBall = false;
      this.holder = null;
      this.ai.leftHandWorld(this.ball.p);
      this.ball.p.set(this.ai.pos.x + 0.5, 1.0, this.ai.pos.z - 0.3);
      this.ai.startSwing('fh', this.time - 0.2, this.time + 0.05);
      const plan = feedShot();
      const v = solveShot(this.ball.p, plan.target, plan.pace, plan.spin, plan.clearance);
      this.feeds++;
      this.launch(1, v, plan.spin, false);
      this.updateProgress();
    });
  }

  // ------------------------------------------------------------------ shots

  private launch(by: Side, v: THREE.Vector3, spin: number, serve: boolean) {
    this.ball.v.copy(v);
    this.ball.spin = spin;
    this.ball.rolling = false;
    this.ball.touchedNet = false;
    this.ballLive = true;
    this.lastHitter = by;
    this.bounces = 0;
    this.isServe = serve;
    this.phase = 'rally';
    this.rallyCount++;
    this.ui.rally(this.rallyCount);
    this.ui.hint(null);
    const power = clamp((v.length() - 15) / 30, 0, 1);
    this.sfx.hit(power);
    this.fx.flash(this.ball.p, by === 0 ? '#e9ffb0' : '#ffffff', 0.6 + power * 0.6, 0.18);
    this.fx.burst(this.ball.p, 10, new THREE.Color(1, 1, 0.8), 3);
    this.predictFor(other(by));
  }

  private predictFor(side: Side) {
    const pred = predict(this.ball, 4.5, this.bounces);
    if (side === 0) {
      const c = findContact(pred, 0, this.time, 13.3);
      this.myContact = c ? { ...c, stroke: c.p.x >= this.me.pos.x - 0.3 ? 'fh' : 'bh' } : null;
      this.aiContact = null;
    } else {
      const c = findContact(pred, 1, this.time, 13.1);
      if (this.mode !== 'match') {
        this.aiContact = null;
        this.myContact = null;
        return;
      }
      // Far player's forehand is on their right = −x.
      this.aiContact = c ? { ...c, stroke: c.p.x <= this.ai.pos.x + 0.3 ? 'fh' : 'bh' } : null;
      this.aiSwung = false;
      this.aiReactAt = this.time + ROOKIE.reaction;
      this.aiPlays = true;
      this.aiRun = c ? Math.hypot(c.p.x - this.ai.pos.x, c.p.z - this.ai.pos.z) : 0;
      if (c?.firstBounce && !inBox(c.firstBounce, courtHalf(1)) && Math.random() < ROOKIE.judgeOut) this.aiPlays = false;
      this.myContact = null;
    }
  }

  private onSwing(intent: SwingIntent) {
    if (this.paused) return;
    this.sfx.ensure();
    if (this.phase === 'serveReady' && this.server === 0 && this.mode === 'match' && this.holder === this.me) {
      this.toss(this.me);
      return;
    }
    if (this.phase === 'toss' && this.server === 0 && !this.pending) {
      const dt = this.time + SWING_LEAD - this.serveIdealAt;
      const grade = gradeOf(dt, 0.06, 0.13);
      this.pending = { at: this.time + SWING_LEAD, grade, dt, intent, stroke: 'serve', serve: true };
      this.me.startSwing('serve', this.time - 0.5, this.time + SWING_LEAD);
      return;
    }
    if (this.phase !== 'rally' || this.pending || this.me.swinging) return;
    const c = this.myContact;
    const comingToMe = this.lastHitter === 1 && c !== null;
    if (!comingToMe) {
      this.me.startSwing(this.ball.p.x >= this.me.pos.x ? 'fh' : 'bh', this.time, this.time + 0.18);
      return;
    }
    const natural = this.time + SWING_LEAD;
    const dt = natural - c.t;
    if (dt < -0.34 || dt > 0.2) {
      this.me.startSwing(c.stroke, this.time, natural);
      if (dt > 0.2) this.ui.callout('TOO LATE', '', 'bad', 900);
      return;
    }
    const at = clamp(natural, c.t - 0.11, c.t + 0.11);
    this.pending = { at, grade: gradeOf(dt, 0.05, 0.11), dt, intent, stroke: c.stroke, serve: false };
    this.me.startSwing(c.stroke, this.time, at);
  }

  private resolvePlayerHit(h: PendingHit) {
    if (h.serve) {
      if (this.phase === 'toss') this.serveHit(0, h.grade, h.dt, h.intent);
      return;
    }
    if (this.phase !== 'rally' || this.lastHitter !== 1 || this.ball.p.z < 0) return;
    const reachPt = this.me.contactOffset(h.stroke).add(this.me.pos);
    const d = Math.hypot(this.ball.p.x - reachPt.x, this.ball.p.z - reachPt.z);
    if (d > PLAYER_REACH || this.ball.p.y > 2.8 || this.ball.p.y < 0.05) {
      this.ui.callout('MISSED', d > PLAYER_REACH ? 'too far' : '', 'bad', 900);
      return;
    }
    const { grade, intent, stroke, dt } = h;
    let pace = { PERFECT: 30, GOOD: 26.5, EARLY: 22, LATE: 22 }[grade] + intent.flick * 5;
    let spin = grade === 'PERFECT' ? 1.15 : 0.9;
    if (intent.slice) {
      pace *= 0.8;
      spin = -0.6;
    }
    let tx = intent.aimX * 3.4;
    let tz = -lerp(6.6, 10.7, (intent.aimY + 1) / 2);
    const sigma = { PERFECT: 0.28, GOOD: 0.6, EARLY: 1.0, LATE: 1.0 }[grade];
    // Early contact pulls the ball across the body, late pushes it the other way.
    const bias = (dt < 0 ? -1 : 1) * (stroke === 'bh' ? -1 : 1) * Math.min(1.8, Math.max(0, Math.abs(dt) - 0.05) * 14);
    tx += gauss() * sigma + (grade === 'EARLY' || grade === 'LATE' ? bias : 0);
    tz += gauss() * sigma * 1.2;
    const v = solveShot(this.ball.p, new THREE.Vector3(tx, 0, tz), pace, spin, 0.3);
    if (Math.abs(dt) > 0.13 && Math.random() < 0.3) v.y -= 2; // mishit into the net
    this.launch(0, v, spin, false);
    this.afterPlayerHit(grade, v);
  }

  private afterPlayerHit(grade: Grade, v: THREE.Vector3) {
    const kmh = v.length() * 3.6;
    this.ui.grade(grade, kmh);
    this.stats.fastest = Math.max(this.stats.fastest, kmh);
    if (grade === 'PERFECT') {
      this.stats.perfects++;
      this.fx.burst(this.ball.p, 60, new THREE.Color('#c8ff2e'), 6);
      this.fx.flash(this.ball.p, '#c8ff2e', 1.4, 0.3);
      this.cam.kick(0.08);
    }
  }

  private aiHit() {
    const c = this.aiContact!;
    this.aiContact = null;
    const reachPt = this.ai.contactOffset(c.stroke).add(this.ai.pos);
    const d = Math.hypot(this.ball.p.x - reachPt.x, this.ball.p.z - reachPt.z);
    if (d > ROOKIE.reach || this.ball.p.y > 2.8) return;
    const incoming = this.ball.v.length();
    const pressure = clamp((incoming - 16) / 14, 0, 1) + clamp(this.aiRun / 5, 0, 1);
    const plan = aiShot(ROOKIE, this.me.pos.x, pressure);
    const v = solveShot(this.ball.p, plan.target, plan.pace, plan.spin, plan.clearance);
    this.launch(1, v, plan.spin, false);
  }

  // ------------------------------------------------------------------ judging

  private onBallEvent(e: BallEvent) {
    if (e.type === 'net') {
      this.sfx.net();
      if (this.phase === 'rally') this.predictFor(other(this.lastHitter));
      return;
    }
    this.sfx.bounce(e.speed);
    if (e.speed > 2) this.fx.burst(e.pos, 6, new THREE.Color(0.8, 0.85, 1), 1.2, 0.6);
    if (this.phase !== 'rally') return;
    this.bounces++;
    if (this.bounces === 1) {
      if (this.isServe) {
        const good = inBox(e.pos, this.serveBox);
        this.fx.mark(e.pos, !good);
        if (!good) return this.fault();
        if (this.ball.touchedNet) return this.let();
      } else {
        const good = inBox(e.pos, courtHalf(other(this.lastHitter)));
        this.fx.mark(e.pos, !good);
        if (!good) return this.pointTo(other(this.lastHitter), 'OUT');
        if (this.mode !== 'match' && this.lastHitter === 0) {
          const deep = e.pos.z < -COURT.serviceLine;
          return this.feedResult(true, deep);
        }
      }
    } else if (this.bounces >= 2) {
      const label = this.isServe ? 'ACE' : this.lastHitter === 0 ? 'WINNER' : '';
      this.pointTo(this.lastHitter, label);
    }
  }

  private fault() {
    if (this.mode !== 'match') return;
    if (this.serveNum === 1) {
      this.serveNum = 2;
      this.phase = 'pointOver';
      this.ui.callout('FAULT', 'second serve', 'bad', 1200);
      this.sfx.ooh();
      this.schedule(1.4, () => this.setupServe());
    } else {
      if (this.server === 0) this.stats.doubleFaults++;
      this.pointTo(other(this.server), 'DOUBLE FAULT');
    }
  }

  private let() {
    this.phase = 'pointOver';
    this.ui.callout('LET', 'replay the serve', 'neutral', 1200);
    this.schedule(1.4, () => this.setupServe());
  }

  private feedResult(inPlay: boolean, deep: boolean) {
    this.phase = 'pointOver';
    if (inPlay) this.successes++;
    if (this.mode === 'goal' && deep) {
      this.goalCount++;
      saveGoal(this.goalCount);
      this.ui.setGoal(this.goalCount, GOAL_TARGET);
      this.ui.callout('DEEP!', `${Math.min(this.goalCount, GOAL_TARGET)}/${GOAL_TARGET} today`, 'good', 1300);
      this.world.stadium.crowd.cheer(0.8);
      this.sfx.applause(0.7);
    } else if (inPlay) {
      this.ui.callout(this.mode === 'goal' ? 'IN' : 'NICE', this.mode === 'goal' ? 'go deeper — past the service line' : '', 'good', 1100);
      this.sfx.applause(0.35);
    } else {
      this.ui.callout('MISS', '', 'bad', 1000);
    }
    this.updateProgress();
    const done =
      (this.mode === 'practice' && this.feeds >= PRACTICE_BALLS) ||
      (this.mode === 'goal' && (this.goalCount >= GOAL_TARGET || this.feeds >= GOAL_BALLS));
    this.schedule(1.6, () => (done ? this.finishFeeds() : this.setupFeed()));
  }

  private finishFeeds() {
    this.phase = 'done';
    this.input.enabled = false;
    this.ui.hint(null);
    if (this.mode === 'practice') {
      this.ui.result(
        this.successes >= 2 ? 'NICE HANDS' : 'KEEP SWINGING',
        `${this.successes} of ${PRACTICE_BALLS} returns landed in`,
        [
          ['in play', `${this.successes}/${PRACTICE_BALLS}`],
          ['perfect', String(this.stats.perfects)],
          ['top speed', `${Math.round(this.stats.fastest)}`],
        ],
        this.successes >= 2,
      );
    } else {
      const won = this.goalCount >= GOAL_TARGET;
      this.ui.result(
        won ? 'GOAL DONE' : 'SO CLOSE',
        won ? 'Three deep returns. Come back tomorrow for a new goal.' : `${this.goalCount}/${GOAL_TARGET} deep returns today — try again`,
        [
          ['deep', `${Math.min(this.goalCount, GOAL_TARGET)}/${GOAL_TARGET}`],
          ['in play', `${this.successes}/${this.feeds}`],
          ['top speed', `${Math.round(this.stats.fastest)}`],
        ],
        won,
      );
    }
  }

  private pointTo(winner: Side, label: string) {
    if (this.phase !== 'rally') return;
    if (this.mode !== 'match') return this.feedResult(false, false);
    this.phase = 'pointOver';
    this.pending = null;
    this.myContact = null;
    this.aiContact = null;
    this.stats.longestRally = Math.max(this.stats.longestRally, this.rallyCount);
    if (winner === 0) {
      this.stats.pointsWon++;
      if (label === 'WINNER') this.stats.winners++;
      if (label === 'ACE') this.stats.aces++;
    }
    const res = this.score.pointWon(winner);
    this.serveNum = 1;
    const st = this.score.status();
    let sub = '';
    if (res.setWinner !== null) sub = winner === 0 ? 'GAME, SET & MATCH' : 'RAY TAKES THE SET';
    else if (res.gameWinner !== null) sub = res.gameWinner === 0 ? 'GAME YOU' : 'GAME RAY';
    else if (st.setPoint !== null) sub = st.setPoint === 0 ? 'SET POINT' : 'SET POINT RAY';
    else if (st.deuce) sub = 'DEUCE';
    else if (st.adv !== null) sub = st.adv === 0 ? 'ADVANTAGE YOU' : 'ADVANTAGE RAY';
    else if (this.score.tiebreak && res.gameWinner === null) sub = 'TIEBREAK';
    const head = label || (winner === 0 ? 'POINT' : 'POINT RAY');
    this.ui.callout(head, sub, winner === 0 ? 'good' : 'bad', 1900);
    this.world.stadium.crowd.cheer(winner === 0 ? 1 : 0.55);
    this.sfx.applause(winner === 0 ? 1 : 0.5);
    this.refreshScore();
    if (res.setWinner !== null) this.schedule(2.4, () => this.finishMatch(res.setWinner!));
    else this.schedule(2.3, () => this.setupServe());
  }

  private finishMatch(winner: Side) {
    this.phase = 'done';
    this.input.enabled = false;
    const [a, b] = this.score.games;
    this.world.stadium.crowd.cheer(1.2);
    this.ui.result(
      winner === 0 ? 'YOU WIN' : 'RAY WINS',
      `${a}–${b}${this.score.tiebreak ? ` (${this.score.points[0]}–${this.score.points[1]})` : ''}`,
      [
        ['points', String(this.stats.pointsWon)],
        ['winners', String(this.stats.winners)],
        ['aces', String(this.stats.aces)],
        ['perfect', String(this.stats.perfects)],
        ['top km/h', String(Math.round(this.stats.fastest))],
        ['best rally', String(this.stats.longestRally)],
      ],
      winner === 0,
    );
  }

  private refreshScore() {
    const pts = this.score.pointLabels();
    const server = this.mode === 'match' && this.active ? this.score.server : null;
    this.ui.scorebug(['YOU', 'RAY'], this.score.games, pts, server, this.mode === 'match');
    this.world.drawBoard({
      names: ['YOU', ROOKIE.name],
      games: this.score.games,
      points: pts,
      server,
      headline: this.score.tiebreak ? 'TIEBREAK' : 'COURT ACE',
      sub: this.mode === 'match' ? 'SET 1' : this.mode === 'goal' ? "TODAY'S GOAL" : 'PRACTICE',
    });
  }

  private updateProgress() {
    if (this.mode === 'practice') this.ui.progress(`Practice ball <em>${Math.max(1, this.feeds)}</em>/${PRACTICE_BALLS} · in play <em>${this.successes}</em>`);
    else if (this.mode === 'goal') this.ui.progress(`Deep returns <em>${Math.min(this.goalCount, GOAL_TARGET)}/${GOAL_TARGET}</em> · ball ${Math.max(1, this.feeds)}/${GOAL_BALLS}`);
    else this.ui.progress(null);
  }

  // ------------------------------------------------------------------ frame

  update(dt: number) {
    if (this.paused) return;
    this.time += dt;
    const now = this.time;

    if (this.next && now >= this.phaseAt) {
      const f = this.next;
      this.next = null;
      f();
    }

    // AI serve.
    if (this.phase === 'serveReady' && this.mode === 'match' && this.server === 1 && this.holder === this.ai && now >= this.aiServeAt && !this.aiTossed) {
      this.aiTossed = true;
      this.toss(this.ai);
    }
    if (this.phase === 'toss' && this.server === 1 && now >= this.serveIdealAt) this.serveHit(1, 'GOOD', 0, null);

    // Player's pending swing contact.
    if (this.pending && now >= this.pending.at) {
      const h = this.pending;
      this.pending = null;
      this.resolvePlayerHit(h);
    }

    // Re-toss if the player let the toss drop.
    if (this.phase === 'toss' && this.server === 0 && !this.pending && this.ball.v.y < 0 && this.ball.p.y < 1.3) {
      this.ballLive = false;
      this.phase = 'serveReady';
      this.me.holdingBall = true;
      this.holder = this.me;
      this.ui.hint('Toss again — <b>click</b> as the ball peaks');
    }

    if (this.autoPlay !== null) this.runAutoPlay(now);
    this.updateMovement(now);

    // AI swing and contact.
    if (this.aiContact && this.aiPlays && this.phase === 'rally') {
      if (!this.aiSwung && now >= this.aiContact.t - 0.34) {
        this.aiSwung = true;
        this.ai.startSwing(this.aiContact.stroke, now, this.aiContact.t);
      }
      if (now >= this.aiContact.t) this.aiHit();
    }

    // Physics.
    if (this.holder) {
      this.holder.leftHandWorld(this.ball.p);
      this.ball.v.set(0, 0, 0);
    } else if (this.ballLive) {
      this.acc += dt;
      while (this.acc >= PHYS_DT) {
        this.acc -= PHYS_DT;
        this.events.length = 0;
        stepBall(this.ball, PHYS_DT, this.events);
        for (const e of this.events) this.onBallEvent(e);
      }
    }

    this.me.update(dt, now);
    this.ai.update(dt, now);
    if (this.ball.rolling && this.ball.v.lengthSq() < 0.01 && this.phase !== 'rally') this.ballVisible = false;
    this.ballView.update(this.ball.p, this.ball.v, this.ball.spin, dt, this.world.camera, this.ballVisible && this.phase !== 'idle');
    this.updateReticle();
    this.fx.update(dt, now);
  }

  private updateMovement(now: number) {
    const manual = this.input.enabled ? this.input.moveAxis() : 0;
    if (this.phase === 'rally' && this.lastHitter === 1 && this.myContact) {
      const c = this.myContact;
      const t = c.p.clone().sub(this.me.contactOffset(c.stroke));
      t.y = 0;
      t.z = clamp(t.z, 1.2, 15);
      this.me.target = t;
    } else if (this.phase === 'rally' || this.phase === 'pointOver') {
      // Recover toward the middle of the baseline.
      this.me.target = new THREE.Vector3(clamp(this.ball.p.x * 0.3, -2, 2), 0, COURT.halfLen + 0.6);
    }
    if (manual !== 0 && this.phase !== 'serveReady' && this.phase !== 'toss') {
      this.me.target = new THREE.Vector3(this.me.pos.x + manual * 2, 0, this.me.target?.z ?? this.me.pos.z);
    }

    if (this.phase === 'rally' && this.aiContact && this.aiPlays && now >= this.aiReactAt) {
      const t = this.aiContact.p.clone().sub(this.ai.contactOffset(this.aiContact.stroke));
      t.y = 0;
      t.z = clamp(t.z, -15, -1.2);
      this.ai.target = t;
    } else if (this.mode === 'match' && (this.phase === 'rally' || this.phase === 'pointOver') && now >= this.aiReactAt) {
      this.ai.target = new THREE.Vector3(clamp(this.ball.p.x * 0.3, -2, 2), 0, -COURT.halfLen - 0.6);
    }
  }

  private updateReticle() {
    const show =
      this.input.enabled &&
      ((this.phase === 'rally' && this.lastHitter === 1 && this.myContact !== null) ||
        (this.mode === 'match' && this.server === 0 && (this.phase === 'serveReady' || this.phase === 'toss')));
    this.fx.reticle.visible = show;
    if (!show) return;
    const a = this.input.aim();
    if (this.phase === 'rally') {
      this.fx.reticle.position.set(a.x * 3.4, 0.01, -lerp(6.6, 10.7, (a.y + 1) / 2));
    } else {
      const b = this.serveBox;
      this.fx.reticle.position.set(lerp(b.x0 + 0.35, b.x1 - 0.35, (a.x + 1) / 2), 0.01, -lerp(4.0, 6.0, (a.y + 1) / 2));
    }
  }

  private autoSwingAt = 0;
  private autoFor: Contact | null = null;
  private autoTossAt = 0;
  private runAutoPlay(now: number) {
    const intent = () => ({ aimX: Math.random() * 2 - 1, aimY: Math.random() * 1.4 - 0.4, flick: Math.random() * 0.5, slice: Math.random() < 0.15 });
    const jitter = () => gauss() * this.autoPlay!;
    if (this.phase === 'serveReady' && this.holder === this.me && this.mode === 'match') {
      if (this.autoTossAt < now - 3) this.autoTossAt = now + 0.6;
      if (now < this.autoTossAt) return;
      this.autoTossAt = 0;
      this.onSwing(intent());
    } else if (this.phase === 'toss' && this.server === 0 && !this.pending && now >= this.serveIdealAt - SWING_LEAD + jitter()) {
      this.onSwing(intent());
    } else if (this.phase === 'rally' && this.myContact && this.lastHitter === 1 && !this.pending && !this.me.swinging) {
      if (this.autoFor !== this.myContact) {
        this.autoFor = this.myContact;
        this.autoSwingAt = this.myContact.t - SWING_LEAD + jitter();
      }
      if (now >= this.autoSwingAt) {
        this.autoSwingAt = Infinity;
        this.onSwing(intent());
      }
    }
  }

  /** For the chase camera. */
  focus(): THREE.Vector3 | null {
    return this.ballVisible ? this.ball.p : null;
  }
}

function gradeOf(dt: number, perfect: number, good: number): Grade {
  const a = Math.abs(dt);
  if (a <= perfect) return 'PERFECT';
  if (a <= good) return 'GOOD';
  return dt < 0 ? 'EARLY' : 'LATE';
}

