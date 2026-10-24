// Plays the synthesized sounds in public/sounds (see scripts/gen-sounds.mjs) and speaks
// announcer callouts with the browser's speech synthesis. Missing sounds are simply silent.

const LINES: Record<string, string> = {
  v_title: 'Pose Portal!', v_ready: 'Get in position!', v_3: 'Three!', v_2: 'Two!', v_1: 'One!', v_go: 'Go!',
  v_pass: 'Pass!', v_nice: 'Nice one!', v_perfect: 'Perfect!', v_splat: 'Splat!', v_ouch: 'Ooh, that hurt!',
  v_gameover: 'Game over!', v_newbest: 'New high score!',
  v_armsup: 'Arms up!', v_armsdown: 'Arms down!', v_leftup: 'Left arm up!', v_rightup: 'Right arm up!',
  v_wide: 'Go wide!', v_tpose: 'Arms out!', v_duck: 'Duck!', v_jump: 'Jump!',
};

export class Audio {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicGain!: GainNode;
  private buffers = new Map<string, AudioBuffer>();
  private music: AudioBufferSourceNode | null = null;
  private speechVoice: SpeechSynthesisVoice | null = null;
  private loading: Promise<void> | null = null;
  muted = false;

  constructor() {
    try { this.muted = localStorage.getItem('pp-muted') === '1'; } catch { /* storage blocked */ }
    if ('speechSynthesis' in window) {
      const pick = () => {
        const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en'));
        // Prefer lively, high-quality English voices when the platform has them.
        const pref = ['Samantha', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Karen', 'Daniel'];
        this.speechVoice = pref.map((n) => voices.find((v) => v.name.includes(n))).find(Boolean)
          ?? voices.find((v) => v.lang === 'en-US') ?? voices[0] ?? null;
      };
      pick();
      speechSynthesis.addEventListener?.('voiceschanged', pick);
    }
  }

  /** Call from a user gesture. */
  unlock() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.32;
      this.musicGain.connect(this.master);
      this.loading = this.load();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.loading!;
  }

  private async load() {
    const base = `${import.meta.env.BASE_URL}sounds/`;
    let names: string[] = [];
    try { names = await (await fetch(`${base}manifest.json`)).json(); } catch { return; }
    await Promise.all(names.map(async (n) => {
      try {
        const data = await (await fetch(`${base}${n}.wav`)).arrayBuffer();
        this.buffers.set(n, await this.ctx!.decodeAudioData(data));
      } catch { /* skip broken file */ }
    }));
  }

  has(name: string) { return this.buffers.has(name); }

  play(name: string, vol = 1, rate = 1) {
    const buf = this.buffers.get(name);
    if (!this.ctx || !buf) return null;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    src.connect(g).connect(this.master);
    src.start();
    return src;
  }

  /**
   * Announcer callout via speech synthesis: a `v_*` key from LINES or any literal phrase.
   * A new line cuts off the previous one so callouts never pile up.
   */
  say(arg: string, vol = 1) {
    if (this.muted || !('speechSynthesis' in window)) return;
    const text = arg.startsWith('v_') ? LINES[arg] : arg;
    if (!text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (this.speechVoice) u.voice = this.speechVoice;
    u.lang = this.speechVoice?.lang ?? 'en-US';
    u.rate = 1.1;
    u.pitch = 1.2;
    u.volume = Math.max(0, Math.min(1, vol));
    speechSynthesis.speak(u);
  }

  startMusic() {
    const buf = this.buffers.get('music');
    if (!this.ctx || !buf || this.music) return;
    this.music = this.ctx.createBufferSource();
    this.music.buffer = buf;
    this.music.loop = true;
    this.music.connect(this.musicGain);
    this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.musicGain.gain.setValueAtTime(0.32, this.ctx.currentTime);
    this.music.start();
  }

  stopMusic(fade = 0.6) {
    if (!this.ctx || !this.music) return;
    const m = this.music;
    this.music = null;
    const t = this.ctx.currentTime;
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, t);
    this.musicGain.gain.linearRampToValueAtTime(0, t + fade);
    m.stop(t + fade + 0.05);
  }

  /** Speed the soundtrack up as the game gets faster (1 = normal). */
  setMusicRate(rate: number) {
    if (!this.ctx || !this.music) return;
    this.music.playbackRate.setTargetAtTime(rate, this.ctx.currentTime, 0.4);
  }

  toggleMute() {
    this.muted = !this.muted;
    try { localStorage.setItem('pp-muted', this.muted ? '1' : '0'); } catch { /* storage blocked */ }
    if (this.ctx) this.master.gain.value = this.muted ? 0 : 0.9;
    if (this.muted && 'speechSynthesis' in window) speechSynthesis.cancel();
    return this.muted;
  }
}
