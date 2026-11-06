/**
 * BIRDIE game orchestrator: wires the phone link, swing input, ball physics, 3D scene, UI and
 * audio together and runs the round / training state machine.
 *
 * Shot lifecycle:
 *   intro (hole flyover) → aim (club, aim, live backswing on the avatar & meter)
 *   → swinging (short delay so the avatar's downswing meets the ball) → flight (ball sim stepping,
 *   events → fx / audio / banners) → settle (outcome banner, penalties) → next turn.
 */
import { Vector3 } from 'three';
import type {
  AudioEngine,
  BallEvent,
  CareerStats,
  ClubId,
  ControllerButton,
  GameSetup,
  GameUI,
  GolfScene,
  Hole,
  HoleDef,
  PhoneScreen,
  PlayerSetup,
  PuttRange,
  Settings,
  ShotInput,
  Surface,
  SwingEvent,
  Wind,
} from '../core/contracts';
import { PALETTE, PUTT_RANGE_M, SURFACES, YARD, clubById, scoreName, toYards, yawForward, yawTo } from '../core/contracts';
import { COURSE, buildHole, courseSummary, holesFor } from '../course';
import { GolfBall } from '../physics';
import { createScene } from '../scene';
import { createInput, type CombinedInput } from '../input';
import { createUI, type BirdieUI } from '../ui';
import { createAudio } from '../audio';
import { PhoneLink } from '../net/phoneLink';
import { SpinshotLink } from '../../../../public/sdk/adapters.js';
import { inExemooShell } from '../../../../public/sdk/exemoo.js';

/**
 * Inside Exemoo the shell already paired the phone. Golf orders its SEN2 button bits differently
 * (swing, a, b, up, down, left, right, minus, plus, map, pause, recenter) and needs club / map buttons.
 */
function makeLink(): PhoneLink {
  if (!inExemooShell()) return new PhoneLink();
  return new SpinshotLink({
    layout: 'swing',
    title: 'Golf',
    buttons: [
      { b: 'minus', label: 'Club -' },
      { b: 'plus', label: 'Club +' },
      { b: 'map', label: 'Map' },
    ],
    buttonMap: { action: 'a', back: 'b' },
    maskBits: { action: 0, back: 2, up: 3, down: 4, left: 5, right: 6, pause: 10, recenter: 11 },
  }) as unknown as PhoneLink;
}
import { Round, formatToPar } from './round';
import { carryFrom, clubsFor, defaultClub, defaultPuttRange, nextPuttRange } from './clubs';
import { TRAINING_HOLE, Training, type Attempt, type TrainingMode } from './training';
import { loadSettings, loadStats, saveSettings, saveStats } from './store';

type Phase = 'menu' | 'intro' | 'aim' | 'swinging' | 'flight' | 'settle' | 'between';

const AIM_STEP = (1.25 * Math.PI) / 180;
const PUTT_AIM_STEP = (0.5 * Math.PI) / 180;
/** Delay between the detected impact and the ball leaving, so the avatar's downswing meets it. */
const IMPACT_DELAY = 0.14;

const WIND_RANGE: Record<GameSetup['wind'], [number, number]> = {
  calm: [0, 1.5],
  normal: [0.5, 5],
  strong: [3.5, 9],
};

interface Turn {
  player: number;
  look: PlayerSetup['look'];
  name: string;
  from: Vector3;
  lie: Surface;
  club: ClubId;
  aimYaw: number;
  puttRange: PuttRange;
  /** Training attempt this shot belongs to (null in rounds). */
  attempt: Attempt | null;
}

export class Game {
  private readonly scene: GolfScene;
  private readonly ui: BirdieUI;
  private readonly audio: AudioEngine;
  private readonly link = makeLink();
  private readonly input: CombinedInput;
  private readonly ball = new GolfBall();

  private settings: Settings = loadSettings();
  private stats: CareerStats = loadStats();
  private setup: GameSetup | null = null;
  private round: Round | null = null;
  private training: Training | null = null;
  private holeDefs: HoleDef[] = [];
  private hole: Hole | null = null;
  private wind: Wind = { yaw: 0, speed: 0 };

  private phase: Phase = 'menu';
  private phaseT = 0;
  private paused = false;
  private turn: Turn | null = null;
  private mapView = false;
  private landing: Vector3 | null = null;
  private pending: { at: number; fn: () => void }[] = [];
  private clock = 0;
  private shot: { input: ShotInput; maxHeight: number; holed: boolean; hazard: 'water' | 'ob' | null; land: Vector3 | null; full: boolean } | null =
    null;
  private lastPhoneScreen = '';
  private controllerUrl = '';

  constructor(appEl: HTMLElement, uiEl: HTMLElement) {
    this.scene = createScene(appEl);
    this.ui = createUI(uiEl, { keyboard: false });
    this.ui.setSound((n) => this.audio.play(n));
    this.audio = createAudio();
    this.input = createInput(this.link, this.scene.canvas);
    this.applySettings(this.settings);
    this.ui.setStats(this.stats);
    this.ui.setCourseSummary(courseSummary());
    this.bindUI();
    this.bindInput();
    this.bindLink();
    this.resize();
    addEventListener('resize', () => this.resize());
    const unlock = () => this.audio.unlock();
    addEventListener('pointerdown', unlock);
    addEventListener('keydown', unlock);
  }

  // ───────────────────────────────────────── boot ─────────────────────────────────────────
  start(): void {
    this.ui.showScreen('loading');
    this.showMenuBackdrop();
    this.link.start().catch(() => {
      /* status listener reports the failure */
    });
    this.link.controllerUrl().then((u) => {
      this.controllerUrl = u;
      this.ui.setLink(this.link.status, this.link.pin, u, this.link.transport);
    });
    this.ui.showScreen('title');
    this.audio.music('menu');
    let last = performance.now();
    const frame = (now: number) => {
      requestAnimationFrame(frame);
      // Cap at ~60 fps: 120 Hz displays would otherwise render (and shadow-map) twice as often for no visible gain.
      if (now - last < 1000 / 62) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      this.tick(dt);
    };
    requestAnimationFrame(frame);
  }

  private showMenuBackdrop(): void {
    const h = buildHole(1 + Math.floor(Math.random() * COURSE.holes.length));
    this.hole = h;
    this.scene.setHole(h);
    this.scene.setWind({ yaw: 0.6, speed: 3 });
    this.scene.setBall(h.tee, false);
    this.scene.setAim(null);
    this.scene.setGreenGrid(false);
    this.scene.setGolfer(h.tee, yawTo(h.tee.x, h.tee.z, h.centerline[1].x, h.centerline[1].z), this.defaultLook(), '1W');
    this.scene.setGolferPose('idle');
    this.scene.setCamera('menu', { target: h.greenCenter });
    this.ui.hud({ visible: false });
    this.ui.power(null);
    this.ui.minimap(null);
    this.ui.marker('landing', null);
    this.phase = 'menu';
    this.input.setMode('menu');
    this.audio.ambience(true, 0.3);
    this.phoneScreen('menu');
  }

  private defaultLook(): PlayerSetup['look'] {
    return { color: PALETTE.accent, skin: '#f2c9a0', hair: '#5a3825', hat: 'cap' };
  }

  // ─────────────────────────────────────── wiring ─────────────────────────────────────────
  private bindUI(): void {
    const ui = this.ui;
    ui.on('start', (s) => this.startGame(s));
    ui.on('resume', () => this.resume());
    ui.on('quit', () => this.quitToTitle());
    ui.on('restart', () => this.setup && this.startGame(this.setup));
    ui.on('next', () => this.onNext());
    ui.on('settings', (s) => this.applySettings(s));
    ui.on('connect', (how) => {
      this.input.preferMouse(how === 'mouse');
      this.audio.play('select');
    });
    ui.on('recenter', () => this.input.recenter());
    ui.on('hudButton', (b) => {
      const map: Record<typeof b, ControllerButton> = {
        clubPrev: 'minus',
        clubNext: 'plus',
        map: 'map',
        pause: 'pause',
        puttRange: 'up',
        aimLeft: 'left',
        aimRight: 'right',
      };
      this.onGameButton(map[b]);
    });
  }

  /** Exemoo air cursor for the menus (phone rotation moves it, Action clicks what's under it). */
  private cursor: { hot(): Element | null } | null = null;

  private bindInput(): void {
    const sdk = (this.link as unknown as { sdk?: { airCursor(o: { active: () => boolean }): { hot(): Element | null } } }).sdk;
    if (sdk) this.cursor = sdk.airCursor({ active: () => this.ui.screen !== 'none' });
    this.input.onButton((b) => {
      this.audio.unlock();
      if (this.ui.screen !== 'none') {
        const hot = this.cursor?.hot();
        if ((b === 'a' || b === 'swing') && hot instanceof HTMLElement) {
          hot.click();
          return;
        }
        // Keyboard/phone aliases inside menus: SWING/Space confirms, Esc backs out.
        const nav: ControllerButton = b === 'swing' ? 'a' : b === 'pause' && this.ui.screen !== 'pause' ? 'b' : b;
        if (this.ui.navigate(nav)) return;
        if (b === 'pause' && this.ui.screen === 'pause') this.resume();
        return;
      }
      this.onGameButton(b);
    });
    this.input.onSwing((e) => this.onSwing(e));
  }

  private bindLink(): void {
    this.link.on('status', (s) => {
      this.ui.setLink(s, this.link.pin, this.controllerUrl, this.link.transport);
      if (s === 'connected') {
        this.audio.play('connect');
        this.link.send({ t: 'theme', color: PALETTE.accent });
        this.lastPhoneScreen = '';
        this.syncPhone();
        this.ui.toast('Phone connected');
        this.input.preferMouse(false);
      } else if (s === 'disconnected' && this.phase !== 'menu') {
        this.ui.toast('Phone disconnected — using mouse');
      }
      if (!this.controllerUrl || s === 'waiting') {
        this.link.controllerUrl().then((u) => {
          this.controllerUrl = u;
          this.ui.setLink(this.link.status, this.link.pin, u, this.link.transport);
        });
      }
    });
  }

  private applySettings(s: Settings): void {
    this.settings = s;
    saveSettings(s);
    this.ui.setSettings(s);
    this.input.setSettings(s);
    this.scene.setQuality(s.quality);
    this.audio.setVolumes(s.masterVolume, s.musicVolume, s.sfxVolume);
    if (this.turn && this.phase === 'aim') this.refreshAim();
  }

  private resize(): void {
    this.scene.resize(innerWidth, innerHeight);
  }

  // ─────────────────────────────────────── game flow ──────────────────────────────────────
  private startGame(setup: GameSetup): void {
    this.setup = setup;
    this.pending = [];
    this.round = null;
    this.training = null;
    this.paused = false;
    this.ui.showScreen('none');
    this.audio.music('course');
    if (setup.mode === 'round') {
      this.holeDefs = holesFor(setup.holes);
      this.round = new Round(setup, this.holeDefs);
      this.startHole();
    } else {
      const mode = setup.mode as TrainingMode;
      this.training = new Training(mode);
      this.holeDefs = [COURSE.holes[TRAINING_HOLE[mode] - 1]];
      this.loadHole(this.holeDefs[0]);
      const h = this.hole!;
      this.ui.banner(this.trainingTitle(), 'info', 2600, mode === 'training-putt' ? 'Sink as many putts as you can' : mode === 'training-drive' ? 'Longest drive in the fairway wins' : 'Get it close to the pin');
      this.scene.setCamera(mode === 'training-putt' ? 'green' : 'flyover', { target: h.pin, ball: h.tee });
      this.setPhase('intro');
      this.later(mode === 'training-putt' ? 1.6 : 0, () => this.phase === 'intro' && !this.scene.cameraBusy && this.nextTurn());
    }
  }

  private trainingTitle(): string {
    return this.training ? { 'training-putt': 'Putting Challenge', 'training-approach': 'Approach Challenge', 'training-drive': 'Long Drive' }[this.training.mode] : '';
  }

  private loadHole(def: HoleDef): void {
    const h = buildHole(def);
    this.hole = h;
    this.ball.setHole(h);
    const [lo, hi] = WIND_RANGE[this.setup?.wind ?? 'normal'];
    // Hole 1 of a round is always calm so new players can learn the swing first.
    const calm = this.round !== null && def.number === 1;
    this.wind = { yaw: Math.random() * Math.PI * 2, speed: calm ? 0 : lo + Math.random() * (hi - lo) };
    this.ball.setWind(this.wind);
    this.scene.setHole(h);
    this.scene.setWind(this.wind);
    this.scene.setGreenGrid(false);
    this.scene.setAim(null);
    this.ui.minimap(h);
    this.audio.ambience(true, this.wind.speed / 9);
  }

  private startHole(): void {
    const r = this.round!;
    const def = r.hole;
    this.loadHole(def);
    r.beginHole();
    const h = this.hole!;
    const first = r.players[r.next(h.pin) ?? 0];
    this.scene.setBall(h.tee, true);
    this.scene.setGolfer(h.tee, yawTo(h.tee.x, h.tee.z, h.centerline[1].x, h.centerline[1].z), first.setup.look, '1W');
    this.scene.setGolferPose('idle');
    this.scene.setCamera('flyover');
    this.ui.hud({ visible: false });
    this.ui.power(null);
    this.ui.banner(`Hole ${def.number}`, 'info', 3200, `Par ${def.par} · ${this.fmtDist(h.yards * YARD)} · ${def.name}`);
    this.phoneScreen('watch', `Hole ${def.number}`);
    this.setPhase('intro');
  }

  /** Pick the next player (or training ball) and set up their shot. */
  private nextTurn(): void {
    const h = this.hole!;
    this.mapView = false;
    if (this.training) {
      const t = this.training;
      if (t.done) return this.finishTraining();
      const att = t.setup(h);
      const p = this.setup!.players[0];
      return this.beginShot({ player: 0, look: p.look, name: p.name, from: att.from, lie: att.lie, attempt: att });
    }
    const r = this.round!;
    const i = r.next(h.pin);
    if (i === null) return this.holeComplete();
    const p = r.players[i];
    if (r.mustPickUp(i)) {
      r.finishPlayer(i, 'pickedUp');
      this.ui.banner('Pick Up', 'bad', 1800, `${p.setup.name} reached the stroke limit`);
      this.later(2, () => this.nextTurn());
      this.setPhase('settle');
      return;
    }
    const from = p.ball ?? h.tee;
    const lie: Surface = p.ball ? p.lie : 'tee';
    if (r.players.length > 1) this.ui.toast(`${p.setup.name}'s turn`);
    this.beginShot({ player: i, look: p.setup.look, name: p.setup.name, from: from.clone(), lie, attempt: null });
  }

  private beginShot(t: Omit<Turn, 'club' | 'aimYaw' | 'puttRange'>): void {
    const h = this.hole!;
    const toPin = this.flatDist(t.from, h.pin);
    const longest = Math.max(...clubsFor(t.lie, toPin).map((c) => (c === 'PT' ? 0 : carryFrom(c, t.lie))));
    const target = t.lie === 'green' ? h.pin : h.aimTarget(t.from, longest);
    let club = defaultClub(t.lie, this.flatDist(t.from, target), toPin);
    if (this.training?.mode === 'training-drive') club = '1W';
    const aimYaw = yawTo(t.from.x, t.from.z, target.x, target.z);
    this.turn = { ...t, club, aimYaw, puttRange: defaultPuttRange(toPin) };
    this.shot = null;
    this.ball.place(t.from);
    this.scene.setBall(t.from, true);
    this.scene.setBallFlying(false);
    this.scene.setGolfer(t.from, aimYaw, t.look, club);
    this.scene.setGolferPose(club === 'PT' ? 'putt' : 'address');
    this.setPhase('aim');
    this.applyClub();
    this.ui.power({ backswing: 0, armed: false, putt: club === 'PT' });
    this.input.recenter();
  }

  /** Club changed or turn began: update input mode, camera, HUD, aim preview. */
  private applyClub(): void {
    const t = this.turn!;
    const putt = t.club === 'PT';
    this.input.setMode(putt ? 'putt' : 'aim');
    this.scene.setGolfer(t.from, t.aimYaw, t.look, t.club);
    this.scene.setGolferPose(putt ? 'putt' : 'address');
    this.scene.setGreenGrid(putt && this.hole!.surfaceAt(t.from.x, t.from.z) === 'green');
    this.setCameraForAim();
    this.refreshAim();
    this.updateHud();
    this.syncPhone();
  }

  private setCameraForAim(instant = false): void {
    const t = this.turn!;
    if (this.mapView) this.scene.setCamera('top', { ball: t.from, target: this.landing ?? this.hole!.pin });
    else if (t.club === 'PT') this.scene.setCamera('green', { ball: t.from, target: this.hole!.pin, yaw: t.aimYaw, instant });
    else this.scene.setCamera('address', { ball: t.from, yaw: t.aimYaw, instant });
  }

  private refreshAim(): void {
    const t = this.turn;
    if (!t || this.phase !== 'aim') return;
    if (t.club === 'PT') {
      const range = PUTT_RANGE_M[t.puttRange];
      const f = yawForward(t.aimYaw, new Vector3());
      if (this.settings.showPuttGuide) {
        const path = this.ball.predictPutt(t.from, t.aimYaw, range / PUTT_RANGE_M.medium);
        this.landing = path[path.length - 1] ?? t.from.clone().addScaledVector(f, range);
      } else {
        this.landing = t.from.clone().addScaledVector(f, range);
        this.landing.y = this.hole!.heightAt(this.landing.x, this.landing.z);
      }
    } else {
      this.landing = this.ball.predictLanding(t.from, t.club, t.aimYaw, 1);
    }
    this.scene.setAim(this.settings.showLandingMarker || t.club === 'PT' ? t.from : null, this.landing ?? undefined, t.club === 'PT');
    this.ui.minimap(this.hole, t.from, this.landing ?? undefined);
    if (this.mapView) this.setCameraForAim();
  }

  private updateHud(): void {
    const t = this.turn;
    const h = this.hole;
    if (!t || !h) return;
    const toPin = this.flatDist(t.from, h.pin);
    const r = this.round;
    const def = h.def;
    const tr = this.training;
    const best = tr ? this.stats.trainingBest[tr.mode] : undefined;
    this.ui.hud({
      visible: true,
      holeNumber: def.number,
      par: def.par,
      yards: Math.round(h.yards),
      stroke: r ? r.players[t.player].taken + 1 : (tr?.ball ?? 0) + 1,
      playerName: t.name,
      playerColor: t.look.color,
      scoreToPar: r ? r.toPar(t.player) : 0,
      toPinYds: toYards(toPin),
      lie: t.lie,
      club: t.club,
      clubs: this.allowedClubs(),
      clubCarryYds: t.club === 'PT' ? 0 : toYards(carryFrom(t.club, t.lie)),
      puttRange: t.club === 'PT' ? t.puttRange : null,
      wind: this.wind,
      viewYaw: t.aimYaw,
      elevationYds: toYards(h.pin.y - t.from.y),
      trainingLine: tr ? tr.line(best) : '',
      units: this.settings.units,
    });
  }

  private allowedClubs(): ClubId[] {
    const t = this.turn!;
    if (this.training?.mode === 'training-putt') return ['PT'];
    return clubsFor(t.lie, this.flatDist(t.from, this.hole!.pin));
  }

  // ─────────────────────────────────────── controls ───────────────────────────────────────
  private onGameButton(b: ControllerButton): void {
    if (b === 'pause') return this.pause();
    if (this.phase === 'intro' && (b === 'a' || b === 'b' || b === 'swing')) return this.skipIntro();
    if (this.phase !== 'aim' || !this.turn) return;
    const t = this.turn;
    const step = t.club === 'PT' ? PUTT_AIM_STEP : AIM_STEP;
    switch (b) {
      case 'left':
        t.aimYaw += step;
        break;
      case 'right':
        t.aimYaw -= step;
        break;
      case 'minus':
      case 'plus': {
        const clubs = this.allowedClubs();
        // Bag order runs longest → shortest; "+" picks a longer club like a Wii remote's plus.
        const i = clubs.indexOf(t.club);
        const j = Math.max(0, Math.min(clubs.length - 1, i + (b === 'plus' ? -1 : 1)));
        if (clubs[j] !== t.club) {
          t.club = clubs[j];
          this.audio.play('click');
          this.applyClub();
        }
        return;
      }
      case 'up':
      case 'down':
        if (t.club === 'PT') {
          t.puttRange = b === 'up' ? (t.puttRange === 'long' ? 'short' : nextPuttRange(t.puttRange, 1)) : nextPuttRange(t.puttRange, -1);
          this.audio.play('click');
          this.ui.toast(`Putter range: ${t.puttRange} (${this.fmtDist(PUTT_RANGE_M[t.puttRange])})`);
          this.refreshAim();
          this.updateHud();
        }
        return;
      case 'map':
        this.mapView = !this.mapView;
        this.audio.play('click');
        this.setCameraForAim();
        this.ui.toast(this.mapView ? 'Map view' : 'Back to the ball');
        return;
      case 'b':
        if (this.mapView) {
          this.mapView = false;
          this.setCameraForAim();
        }
        return;
      case 'recenter':
        this.input.recenter();
        this.ui.toast('Club recentered');
        return;
      default:
        return;
    }
    // Aim changed.
    this.scene.setGolfer(t.from, t.aimYaw, t.look, t.club);
    if (!this.mapView) this.setCameraForAim(true);
    this.refreshAim();
    this.updateHud();
  }

  private skipIntro(): void {
    if (this.phase !== 'intro') return;
    (this.scene as GolfScene & { skipFlyover?: () => void }).skipFlyover?.();
    this.nextTurn();
  }

  private onSwing(e: SwingEvent): void {
    if (this.phase !== 'aim' || !this.turn || this.paused || this.ui.screen !== 'none' || this.mapView) return;
    const t = this.turn;
    const putt = t.club === 'PT';
    if (e.practice) {
      this.scene.setGolferPose('swing');
      this.ui.toast(this.settings.holdToSwing ? 'Practice swing — hold SWING to hit' : 'Practice swing');
      this.later(1.3, () => this.phase === 'aim' && this.scene.setGolferPose(putt ? 'putt' : 'address'));
      return;
    }
    let curve = e.curve;
    let power = e.power;
    if (!putt && power > 1) curve += (Math.random() - 0.5) * 2 * (power - 1) * 5;
    if (putt) power = (e.power * PUTT_RANGE_M[t.puttRange]) / PUTT_RANGE_M.medium;
    const input: ShotInput = { club: t.club, power, aimYaw: t.aimYaw, curve: Math.max(-1, Math.min(1, curve)), quality: e.quality, lie: t.lie };
    this.shot = { input, maxHeight: 0, holed: false, hazard: null, land: null, full: !putt && e.power > 0.6 };
    this.round?.stroke(t.player, t.from, t.lie);
    this.scene.setGolferPose(putt ? 'putt' : 'swing');
    this.scene.setAim(null);
    this.scene.setGreenGrid(false);
    this.ui.marker('landing', null);
    this.ui.power({ backswing: e.backswing, armed: true, putt, result: { power: e.power, curve: input.curve } });
    this.setPhase('swinging');
    this.phoneScreen('watch');
    this.later(putt ? 0.05 : IMPACT_DELAY, () => this.strike());
  }

  private strike(): void {
    const t = this.turn!;
    const s = this.shot!;
    const club = clubById(t.club);
    this.ball.strike(s.input);
    const bad = s.input.quality < 0.4;
    if (club.kind === 'putter') this.audio.play('hitPutt', { volume: 0.5 + Math.min(0.5, s.input.power) });
    else this.audio.play(bad ? 'hitBad' : club.kind === 'wood' ? 'hitWood' : 'hitIron', { volume: 0.6 + Math.min(0.4, s.input.power * 0.4) });
    if (this.settings.haptics) this.input.vibrate(club.kind === 'putter' ? 25 : bad ? [60, 30, 60] : 45);
    if (t.lie === 'sand') this.scene.fx('sand', t.from);
    else if (club.kind !== 'wood' && club.kind !== 'putter' && t.lie !== 'tee' && t.lie !== 'green') this.scene.fx('divot', t.from);
    if (club.kind !== 'putter') {
      this.scene.setBallFlying(true);
      this.scene.setCamera('follow', { ball: t.from, yaw: t.aimYaw });
    }
    this.setPhase('flight');
  }

  // ─────────────────────────────────────── ball flight ────────────────────────────────────
  private stepFlight(dt: number): void {
    const events = this.ball.step(dt);
    const pos = this.ball.state.pos;
    this.scene.setBall(pos, this.ball.state.phase !== 'holed');
    const s = this.shot!;
    s.maxHeight = Math.max(s.maxHeight, pos.y - this.turn!.from.y);
    for (const e of events) this.onBallEvent(e);
  }

  private onBallEvent(e: BallEvent): void {
    const t = this.turn!;
    const s = this.shot!;
    switch (e.type) {
      case 'apex':
        if (this.flatDist(t.from, e.pos) > 25 && this.landing) {
          // Swap to a landing-zone camera for longer shots once the ball starts to fall.
          const predicted = this.ball.predictLanding(t.from, t.club, s.input.aimYaw, Math.min(1.1, s.input.power));
          if (this.flatDist(t.from, predicted) > 90) this.scene.setCamera('landing', { target: predicted, ball: e.pos });
        }
        break;
      case 'land':
        s.land = e.pos.clone();
        this.scene.setBallFlying(false);
        if (e.surface === 'sand') {
          this.scene.fx('sand', e.pos);
          this.audio.play('sand');
        } else if (e.surface !== 'water') {
          this.scene.fx('dust', e.pos);
          this.audio.play('land', { volume: Math.min(1, e.speed / 25) });
        }
        if (s.full && (e.surface === 'fairway' || e.surface === 'green' || e.surface === 'fringe') && s.input.quality > 0.6 && Math.abs(s.input.curve) < 0.35) {
          this.ui.banner('Nice Shot!', 'good', 1300);
          this.audio.play('applause', { volume: 0.35 });
        }
        break;
      case 'bounce':
        if (e.speed > 2) this.audio.play(e.surface === 'sand' ? 'sand' : 'land', { volume: Math.min(0.6, e.speed / 30) });
        break;
      case 'tree':
        this.scene.fx('leaves', e.pos);
        this.audio.play('tree');
        break;
      case 'pin':
        this.audio.play('pin');
        break;
      case 'lip':
        this.audio.play('lip');
        this.audio.play('aww', { volume: 0.6 });
        break;
      case 'holed':
        s.holed = true;
        this.audio.play('cup');
        this.scene.fx('cupDrop', this.hole!.pin);
        this.settle();
        break;
      case 'water':
        s.hazard = 'water';
        this.scene.fx('splash', e.pos);
        this.audio.play('splash');
        this.audio.play('aww', { volume: 0.5 });
        this.settle(e.pos);
        break;
      case 'ob':
        s.hazard = 'ob';
        this.audio.play('aww', { volume: 0.5 });
        this.settle(e.pos);
        break;
      case 'rest':
        this.settle(e.pos, e.surface);
        break;
      default:
        break;
    }
  }

  /** The ball has finished moving: score it and schedule the next turn. */
  private settle(pos = this.ball.state.pos, surface?: Surface): void {
    if (this.phase !== 'flight') return;
    this.setPhase('settle');
    const t = this.turn!;
    const s = this.shot!;
    const h = this.hole!;
    const rest = pos.clone();
    const lie = surface ?? h.surfaceAt(rest.x, rest.z);
    const club = clubById(t.club);
    if (!s.holed && club.kind !== 'putter' && !s.hazard) this.scene.setCamera('landing', { target: rest, ball: rest });

    if (this.training) return this.settleTraining(rest, lie);
    const r = this.round!;
    const i = t.player;
    const name = r.players[i].setup.name;

    if (s.holed) {
      const strokes = r.finishPlayer(i, 'holed');
      const label = scoreName(strokes, h.def.par);
      const d = strokes - h.def.par;
      const great = d < 0 || strokes === 1;
      this.ui.banner(label, great ? 'great' : d === 0 ? 'good' : 'bad', 2600, r.players.length > 1 ? name : undefined);
      this.scene.setCamera('celebrate', { target: h.pin });
      this.scene.setGolferPose(d <= 0 ? 'celebrate' : 'disappointed');
      if (great) {
        this.scene.fx('confetti', h.pin);
        this.audio.play('cheer');
      } else this.audio.play('applause', { volume: d === 0 ? 0.7 : 0.35 });
      if (this.settings.haptics) this.input.vibrate(great ? [80, 60, 80, 60, 160] : [60, 40, 60]);
      this.recordHoleStats(strokes, h.def.par, t, rest);
      this.later(3.2, () => this.nextTurn());
      return;
    }

    if (s.hazard === 'water') {
      r.penalty(i);
      const drop = h.waterDrop(rest, t.from);
      const dropLie = h.surfaceAt(drop.x, drop.z);
      r.placeBall(i, drop, dropLie === 'water' ? 'rough' : dropLie);
      this.ui.banner('Water Hazard', 'bad', 2000, '1 stroke penalty · drop');
      this.later(2.4, () => this.nextTurn());
      return;
    }
    if (s.hazard === 'ob') {
      r.penalty(i);
      r.placeBall(i, t.from, t.lie === 'tee' ? 'tee' : t.lie);
      // Re-teeing keeps the tee lie; otherwise replay from the same spot.
      if (t.lie === 'tee') r.players[i].ball = h.tee.clone();
      this.ui.banner('Out of Bounds', 'bad', 2000, '1 stroke penalty · replay');
      this.later(2.4, () => this.nextTurn());
      return;
    }

    r.placeBall(i, rest, lie);
    const toPin = this.flatDist(rest, h.pin);
    if (club.kind === 'putter') {
      this.scene.setGolferPose(toPin < 1 ? 'idle' : 'disappointed');
      this.ui.toast(`${this.fmtDist(toPin)} left`);
    } else {
      const carry = s.land ? this.flatDist(t.from, s.land) : this.flatDist(t.from, rest);
      const total = this.flatDist(t.from, rest);
      this.ui.toast(`${SURFACES[lie].label} · ${this.fmtDist(total)}${s.land ? ` (carry ${this.fmtDist(carry)})` : ''}`);
      if (lie === 'sand') this.ui.banner('Bunker', 'bad', 1200);
      if (t.lie === 'tee' && t.club === '1W' && (lie === 'fairway' || lie === 'fringe')) {
        this.stats.longestDriveYds = Math.max(this.stats.longestDriveYds, Math.round(toYards(total)));
      }
      this.scene.setGolferPose('idle');
    }
    this.later(club.kind === 'putter' ? 1.4 : 2.2, () => this.nextTurn());
  }

  private recordHoleStats(strokes: number, par: number, t: Turn, rest: Vector3): void {
    if (strokes === 1) this.stats.holesInOne++;
    else if (strokes - par === -2) this.stats.eagles++;
    else if (strokes - par === -1) this.stats.birdies++;
    if (t.club === 'PT') this.stats.longestPuttYds = Math.max(this.stats.longestPuttYds, Math.round(toYards(this.flatDist(t.from, rest)) * 10) / 10);
    saveStats(this.stats);
    this.ui.setStats(this.stats);
  }

  private settleTraining(rest: Vector3, lie: Surface): void {
    const tr = this.training!;
    const t = this.turn!;
    const s = this.shot!;
    const label = tr.record(this.hole!, t.attempt!, { holed: s.holed, pos: rest, surface: lie, hazard: s.hazard !== null });
    const good = s.holed || (tr.mode === 'training-drive' && tr.results[tr.results.length - 1] > 0) || (tr.mode === 'training-approach' && tr.results[tr.results.length - 1] < 10);
    this.ui.banner(label, s.holed ? 'great' : good ? 'good' : 'bad', 1800);
    if (s.holed) {
      this.scene.fx('confetti', this.hole!.pin);
      this.audio.play('cheer', { volume: 0.7 });
      this.scene.setCamera('celebrate', { target: this.hole!.pin });
    }
    this.updateHud();
    this.later(2.4, () => this.nextTurn());
  }

  private finishTraining(): void {
    const tr = this.training!;
    const p = this.setup!.players[0];
    const best = this.stats.trainingBest[tr.mode];
    const data = tr.resultsData(p.name, p.look.color, best);
    if (tr.isBetter(tr.score(), best)) {
      this.stats.trainingBest[tr.mode] = tr.score();
      saveStats(this.stats);
      this.ui.setStats(this.stats);
    }
    this.showResults(data);
  }

  private holeComplete(): void {
    const r = this.round!;
    this.setPhase('between');
    this.ui.hud({ visible: false });
    this.ui.power(null);
    this.ui.marker('landing', null);
    const card = r.scorecard(COURSE.name, this.yardages(), false);
    this.ui.setScorecard(card);
    this.ui.showScreen('scorecard', card);
    this.phoneScreen('scorecard');
    this.audio.play('chime');
  }

  private onNext(): void {
    if (this.phase !== 'between' || !this.round) {
      if (this.ui.screen === 'results') this.quitToTitle();
      return;
    }
    const r = this.round;
    if (r.finished) return this.quitToTitle();
    this.ui.showScreen('none');
    if (r.advance()) {
      this.startHole();
    } else {
      this.finishRound();
    }
  }

  private finishRound(): void {
    const r = this.round!;
    const order = r.ranking();
    this.stats.roundsPlayed++;
    const set = this.setup!.holes;
    const leader = r.toPar(order[0]);
    if (this.stats.bestRound[set] === undefined || leader < this.stats.bestRound[set]!) this.stats.bestRound[set] = leader;
    saveStats(this.stats);
    this.ui.setStats(this.stats);
    const notes: string[] = [];
    const birdies = r.players.reduce((n, p) => n + p.strokes.filter((s, h) => s !== null && s < r.holes[h].par).length, 0);
    if (birdies) notes.push(`Birdies or better: ${birdies}`);
    notes.push(`${COURSE.name} · ${this.setupLabel()}`);
    this.showResults({
      title: r.players.length > 1 ? `${r.players[order[0]].setup.name} wins!` : 'Round Complete',
      rows: order.map((i, k) => ({
        name: r.players[i].setup.name,
        color: r.players[i].setup.look.color,
        value: formatToPar(r.toPar(i)),
        sub: `${r.total(i)} strokes`,
        best: k === 0,
      })),
      notes,
    });
  }

  private showResults(data: Parameters<GameUI['showScreen']>[1]): void {
    this.setPhase('between');
    this.ui.hud({ visible: false });
    this.ui.power(null);
    this.ui.marker('landing', null);
    this.audio.music('results');
    this.audio.play('cheer', { volume: 0.6 });
    this.scene.setCamera('celebrate', { target: this.hole!.pin });
    this.ui.showScreen('results', data);
    this.phoneScreen('menu');
  }

  private setupLabel(): string {
    return { beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert', front9: '9 Holes' }[this.setup!.holes];
  }

  private yardages(): number[] {
    return this.holeDefs.map((d) => courseSummary().find((c) => c.number === d.number)?.yards ?? 0);
  }

  private pause(): void {
    if (this.phase === 'menu' || this.phase === 'between' || this.paused) return;
    this.paused = true;
    this.ui.showScreen('pause');
    this.phoneScreen('paused');
    this.audio.play('select');
  }

  private resume(): void {
    if (!this.paused) {
      this.ui.showScreen(this.phase === 'menu' ? 'title' : 'none');
      return;
    }
    this.paused = false;
    this.ui.showScreen('none');
    this.syncPhone();
  }

  private quitToTitle(): void {
    this.paused = false;
    this.pending = [];
    this.round = null;
    this.training = null;
    this.turn = null;
    this.audio.music('menu');
    this.showMenuBackdrop();
    this.ui.showScreen('title');
  }

  // ───────────────────────────────────────── frame ────────────────────────────────────────
  private tick(dt: number): void {
    this.input.update(dt);
    if (!this.paused) {
      this.clock += dt;
      this.phaseT += dt;
      this.runPending();
      this.updatePhase(dt);
      this.scene.update(dt);
    } else {
      this.scene.update(0);
    }
    this.scene.render();
  }

  private updatePhase(dt: number): void {
    const pose = this.input.pose;
    switch (this.phase) {
      case 'intro':
        if (this.phaseT > 0.8 && !this.scene.cameraBusy) this.nextTurn();
        break;
      case 'aim': {
        const putt = this.turn!.club === 'PT';
        this.scene.setGolferPose(putt ? 'putt' : 'address', pose);
        this.ui.power({ backswing: pose.backswing, armed: pose.armed || !this.settings.holdToSwing, putt });
        this.audio.setSwingWhoosh(pose.speed);
        if (this.landing && this.settings.showLandingMarker && !putt) {
          const sp = this.scene.worldToScreen(this.landing);
          this.ui.marker('landing', sp, this.fmtDist(this.flatDist(this.turn!.from, this.landing)));
        } else this.ui.marker('landing', null);
        break;
      }
      case 'swinging':
        this.audio.setSwingWhoosh(0);
        break;
      case 'flight':
        this.stepFlight(dt);
        break;
      default:
        break;
    }
  }

  private setPhase(p: Phase): void {
    this.phase = p;
    this.phaseT = 0;
    if (p !== 'aim') {
      this.audio.setSwingWhoosh(0);
      this.ui.marker('landing', null);
      if (p !== 'swinging') this.input.setMode(p === 'menu' ? 'menu' : 'watch');
    }
    this.syncPhone();
  }

  private later(sec: number, fn: () => void): void {
    this.pending.push({ at: this.clock + sec, fn });
  }

  private runPending(): void {
    if (!this.pending.length) return;
    const due = this.pending.filter((p) => p.at <= this.clock);
    if (!due.length) return;
    this.pending = this.pending.filter((p) => p.at > this.clock);
    for (const p of due) p.fn();
  }

  // ───────────────────────────────────────── phone ────────────────────────────────────────
  private syncPhone(): void {
    if (this.link.status !== 'connected') return;
    const t = this.turn;
    if (this.phase === 'aim' && t) {
      this.phoneScreen(t.club === 'PT' ? 'putt' : 'aim');
      const h = this.hole!;
      this.link.send({
        t: 'hud',
        hole: h.def.number,
        par: h.def.par,
        stroke: this.round ? this.round.players[t.player].taken + 1 : (this.training?.ball ?? 0) + 1,
        club: clubById(t.club).name,
        toPinYds: Math.round(toYards(this.flatDist(t.from, h.pin))),
        player: t.name,
        color: t.look.color,
      });
    } else if (this.phase === 'menu') this.phoneScreen('menu');
    else if (this.phase === 'between') this.phoneScreen(this.ui.screen === 'scorecard' ? 'scorecard' : 'menu');
    else this.phoneScreen('watch');
  }

  private phoneScreen(screen: PhoneScreen, label?: string): void {
    const key = `${screen}|${label ?? ''}`;
    if (key === this.lastPhoneScreen || this.link.status !== 'connected') return;
    this.lastPhoneScreen = key;
    this.link.send({ t: 'screen', screen, label });
  }

  // ───────────────────────────────────────── utils ────────────────────────────────────────
  private flatDist(a: Vector3, b: Vector3): number {
    return Math.hypot(a.x - b.x, a.z - b.z);
  }

  private fmtDist(m: number): string {
    if (this.settings.units === 'meters') return m < 10 ? `${m.toFixed(1)} m` : `${Math.round(m)} m`;
    const y = toYards(m);
    return y < 10 ? `${y.toFixed(1)} yd` : `${Math.round(y)} yd`;
  }
}

