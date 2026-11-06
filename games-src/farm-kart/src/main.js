import * as THREE from 'three';
import { makeTextures } from './textures.js';
import { setModelTextures, CHARACTERS } from './models.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Track, terrainH } from './track.js';
import { MAPS } from './maps.js';
import { Effects } from './effects.js';
import { buildPortraits, mapThumb } from './portraits.js';
import { loadSettings, saveSettings, renderSettings, DEFAULTS } from './settings.js';
import { Kart } from './kart.js';
import { AIDriver } from './ai.js';
import { Items } from './items.js';
import { Particles } from './particles.js';
import { Audio } from './audio.js';
import { Phones, PLAYER_COLORS, STEER_MODES } from './phones.js';
import { ITEMS } from './items.js';
import { Input, CONTROL_OPTIONS } from './input.js';
import { HUD, ordinal, fmtTime } from './hud.js';

const $ = id => document.getElementById(id);
const DIFF = { easy: { mult: .86, skill: .45 }, normal: { mult: .95, skill: .7 }, hard: { mult: 1.03, skill: .95 } };
const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));

const CAM = { near: [.8, .85], normal: [1, 1], far: [1.3, 1.25] };
const SHADOW = { low: 0, medium: 1024, high: 2048 };
const cleanName = n => String(n || '').replace(/[^\p{L}\p{N} ._'-]/gu, '').trim().slice(0, 12);

class Game {
  constructor() {
    this.S = loadSettings();
    this.renderer = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
    this.scene.environmentIntensity = .35;
    pm.dispose();

    this.T = makeTextures();
    setModelTextures(this.T);
    this.portraits = buildPortraits();
    this.mapThumbs = MAPS.map(d => mapThumb(d));
    this.particles = new Particles(this.scene, this.T.dot);
    this.items = new Items(this);
    this.fx = new Effects(this);
    this.audio = new Audio();
    this.phones = new Phones(this);
    this.input = new Input(this.phones);
    this.hud = new HUD($('hud'));
    this.cams = [0, 1, 2, 3].map(() => new THREE.PerspectiveCamera(68, 1, .5, 2000));
    this.camState = this.cams.map(() => ({ h: 0, init: false, fov: 68 }));

    this.cfg = {
      players: 1, cpus: 7, laps: 3, diff: 'normal', music: true,
      pl: [{ char: 0, ctrl: 'phone' }, { char: 1, ctrl: 'phone' }, { char: 2, ctrl: 'phone' }, { char: 3, ctrl: 'phone' }],
    };
    try { Object.assign(this.cfg, JSON.parse(localStorage.getItem('farmkart.cfg') || '{}')); } catch {}
    for (const p of this.cfg.pl) if (!CONTROL_OPTIONS.some(([v]) => v === p.ctrl)) p.ctrl = 'phone';
    if (!(this.cfg.map >= 0 && this.cfg.map < MAPS.length)) this.cfg.map = 0;
    this.room = localStorage.getItem('farmkart.room') || this.makeRoom();
    this.loadMap(this.cfg.map);
    this.applySettings();

    this.karts = []; this.humans = []; this.ais = new Map();
    this.time = 0; this.raceTime = 0; this.state = 'attract';
    this.paused = false;
    this.controls = [];
    this.acc = 0; this.last = performance.now();

    addEventListener('resize', () => this.renderer.setSize(innerWidth, innerHeight));
    this.buildMenus();
    this.startAttract();
    requestAnimationFrame(t => this.frame(t));
  }

  // ------------------------------------------------------------------ menus
  show(id) {
    for (const s of ['title', 'setup', 'pause', 'results', 'settings']) $(s).classList.toggle('hidden', s !== id);
    this.syncPhones();
  }

  // ------------------------------------------------------------------ phones
  phoneState() {
    if (this.paused) return 'paused';
    if (this.state === 'countdown' || this.state === 'race') return 'race';
    if (this.state === 'results') return 'results';
    return 'menu';
  }
  syncPhones() {
    if (!this.phones) return;
    const state = this.phoneState(), players = this.seatInfo();
    for (const p of this.phones.list.values()) {
      if (!p.connected || !p.ready) continue;
      this.phones.send(p.id, {
        t: 'you', slot: p.slot, full: p.slot < 0 && this.inRace(), state, char: p.slot >= 0 ? this.cfg.pl[p.slot].char : 0,
        color: PLAYER_COLORS[p.slot] || '#8a8aa0', map: this.cfg.map, name: p.name, room: this.room, seats: this.cfg.players, players,
      });
    }
    this.phones.saveSeats();
  }
  onHostReplaced() {
    // another tab/screen opened the game and took the phones; offer to take them back
    let el = $('fk-replaced');
    if (!el) {
      el = document.createElement('div'); el.id = 'fk-replaced';
      el.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;gap:16px;align-items:center;justify-content:center;background:#1b1b3ae6;color:#fff;font:700 24px "Baloo 2",system-ui,sans-serif;text-align:center;padding:20px';
      el.innerHTML = '<div style="font-family:\'Lilita One\',sans-serif;font-size:40px">Phones moved to another screen</div><div>Farm Kart was opened in another tab or window, so the controllers follow that one.</div>';
      const b = document.createElement('button'); b.className = 'btn'; b.textContent = 'Use this screen';
      b.onclick = () => { el.remove(); this.phones.reclaim(); };
      el.appendChild(b); document.body.appendChild(el);
    }
  }

  // ------------------------------------------------------------------ pairing
  makeRoom() {
    const r = String(1000 + Math.floor(Math.random() * 9000));
    try { localStorage.setItem('farmkart.room', r); } catch {}
    return r;
  }
  newRoom() {
    this.room = this.makeRoom();
    for (const p of this.phones.list.values()) if (p.connected) this.phones.kick(p);
    this.toast(`New room code ${this.room}`);
    this.onPhonesChanged();
  }
  joinUrl(seat) {
    const base = this.phones.info?.urls?.[0];
    if (!base) return null;
    return `${base}?room=${this.room}${seat != null ? `&seat=${seat + 1}` : ''}`;
  }
  seatInfo() {
    const c = this.cfg, out = [];
    for (let i = 0; i < c.players; i++) {
      const h = this.phones.slotHolder(i);
      out.push({ slot: i, name: h?.name || null, color: PLAYER_COLORS[i], char: c.pl[i].char, connected: !!h?.connected, phone: c.pl[i].ctrl === 'phone' });
    }
    return out;
  }
  claimSeat(p, s) {
    const c = this.cfg;
    if (!(s >= 0 && s < 4)) return false;
    if (s >= c.players) {
      if (this.inRace()) return false;
      for (let i = c.players; i <= s; i++) c.pl[i].ctrl = 'phone';
      c.players = s + 1; c.cpus = Math.min(c.cpus, 8 - c.players);
    }
    if (this.inRace() && !this.humans[s]) return false;
    const h = this.phones.slotHolder(s);
    if (h && h !== p) { if (h.connected) return false; h.slot = -1; }
    c.pl[s].ctrl = 'phone';
    p.slot = s; p.spectate = false;
    this.saveCfg();
    return true;
  }
  onPhoneHello(p, m) {
    if (!p.assets) { this.sendAssets(p); p.assets = true; }
    if (this.S.requireCode && String(m.room ?? '') !== this.room) { p.ready = false; this.phones.send(p.id, { t: 'denied', reason: 'code' }); this.onPhonesChanged(); return; }
    const back = p.ready === false && p.slot >= 0, prevSlot = p.slot;
    p.ready = true; p.leftAt = 0;
    p.name = cleanName(m.name) || p.name || `Phone ${p.order + 1}`;
    const seat = Number.isInteger(m.seat) ? m.seat - 1 : -1; // URL seat is 1-based
    if (p.slot < 0 && seat >= 0 && !this.claimSeat(p, seat)) this.toast(`Player ${seat + 1}'s seat is taken`);
    this.assignPhones();
    if (p.slot < 0 && !this.inRace() && !p.spectate) this.phones.send(p.id, { t: 'denied', reason: 'full' });
    // a re-hello from a phone that never left (hub blip, duplicate hello) is silent
    if (back) { if (p.slot === prevSlot && !p.restored && p.dropToasted) this.toast(`${p.name} is back`); else if (p.restored || p.slot !== prevSlot) this.toast(`${p.name} reconnected as Player ${p.slot + 1}`); }
    else if (p.slot >= 0 && p.slot !== prevSlot) this.toast(`${p.name} joined as Player ${p.slot + 1}`);
    p.dropToasted = false;
    if (!$('title').classList.contains('hidden') && p.slot >= 0) this.show('setup');
    this.onPhonesChanged();
  }
  onPhoneLeft(p) {
    p.ready = false;
    // grace period: a phone that reconnects within a moment (Wi-Fi blip, page reload)
    // neither pauses the race nor gets announced
    const at = p.leftAt = performance.now();
    setTimeout(() => {
      if (p.leftAt !== at || (p.connected && p.ready)) return;
      if (p.slot >= 0 && this.inRace() && this.humans[p.slot] && this.controls[p.slot] === 'phone') {
        this.toast(`${p.name || 'A phone'} (Player ${p.slot + 1}) disconnected`); p.dropToasted = true;
        if (this.S.pauseOnDrop && !this.paused) this.setPaused(true);
      }
    }, 2500);
    this.onPhonesChanged();
  }
  onPhoneName(p, n) { const v = cleanName(n); if (v) { p.name = v; this.onPhonesChanged(); } }
  onPhoneSeat(p, s) {
    if (this.inRace()) return;
    if (!this.claimSeat(p, s)) this.toast(`Player ${s + 1}'s seat is taken`);
    this.onPhonesChanged();
  }
  onPhoneUnseat(p) {
    if (this.inRace()) return;
    p.slot = -1; p.spectate = true;
    this.onPhonesChanged();
  }
  toast(msg) {
    const t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(this._toastT); this._toastT = setTimeout(() => t.classList.remove('show'), 2600);
  }

  // ------------------------------------------------------------------ settings
  applySettings() {
    const S = this.S;
    this.audio.setVolumes(S.master, S.music, S.sfx);
    if (S.music > 0 && this.audio.ctx && $('title').classList.contains('hidden')) this.audio.startMusic();
    const pr = { low: .75, medium: 1, high: 1.5 }[S.quality];
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, pr));
    this.renderer.setSize(innerWidth, innerHeight);
    if (this.track) {
      const sz = SHADOW[S.quality], sun = this.track.sun;
      sun.castShadow = sz > 0;
      if (sz && sun.shadow.mapSize.x !== sz) { sun.shadow.mapSize.set(sz, sz); sun.shadow.map?.dispose(); sun.shadow.map = null; }
    }
    $('fps').classList.toggle('hidden', !S.fps);
  }
  openSettings() {
    this.settingsFrom = ['title', 'setup', 'pause'].find(s => !$(s).classList.contains('hidden')) || null;
    const body = $('settings-body');
    const draw = () => renderSettings(body, this.S, (k, v) => { this.S[k] = v; saveSettings(this.S); this.applySettings(); if (k === 'requireCode') this.onPhonesChanged(); });
    draw();
    this._redrawSettings = draw;
    this.show('settings');
  }
  sendAssets(p) {
    if (!this._assets) this._assets = {
      t: 'assets',
      chars: CHARACTERS.map(c => ({ name: c.name, img: this.portraits.chars[c.id].url })),
      items: Object.fromEntries(Object.entries(this.portraits.items).map(([k, v]) => [k, v.url])),
      maps: MAPS.map((d, i) => ({ name: d.name, blurb: d.blurb, color: d.theme.ui, thumb: this.mapThumbs[i].url })),
    };
    this.phones.send(p.id, this._assets);
  }
  setMap(i) {
    if (i < 0 || i >= MAPS.length || this.inRace() || this.cfg.map === i) return;
    this.cfg.map = i; this.saveCfg();
    if (this.state === 'attract') this.startAttract();
    this.onPhonesChanged();
  }
  loadMap(i) {
    const def = MAPS[i];
    if (this.track?.def === def) return;
    if (this.track) this.track.dispose();
    this.track = new Track(this.scene, this.T, def);
    if (this.S) { const sz = SHADOW[this.S.quality]; this.track.sun.castShadow = sz > 0; if (sz) this.track.sun.shadow.mapSize.set(sz, sz); }
    this.items.setTrack(this.track);
    this.fx.setTrack(this.track);
    this.hud.mm = null;
    this.renderer.shadowMap.needsUpdate = true;
  }
  inRace() { return this.state === 'countdown' || this.state === 'race'; }
  assignPhones() {
    const c = this.cfg, ph = [...this.phones.list.values()];
    for (const p of ph) if (p.slot >= c.players || (p.slot >= 0 && c.pl[p.slot].ctrl !== 'phone')) p.slot = -1;
    const waiting = ph.filter(p => p.connected && p.ready && p.slot < 0 && !p.spectate).sort((a, b) => a.order - b.order);
    for (const p of waiting) {
      let s = -1;
      for (let i = 0; i < c.players && s < 0; i++) if (c.pl[i].ctrl === 'phone' && !this.phones.slotHolder(i)) s = i;
      // reclaim a slot whose phone has gone away
      for (let i = 0; i < c.players && s < 0; i++) if (c.pl[i].ctrl === 'phone' && !this.phones.slotHolder(i).connected) { this.phones.slotHolder(i).slot = -1; s = i; }
      if (s < 0 && c.players < 4 && !this.inRace()) { c.players++; c.pl[c.players - 1].ctrl = 'phone'; s = c.players - 1; c.cpus = Math.min(c.cpus, 8 - c.players); }
      p.slot = s;
    }
  }
  onPhonesChanged() {
    if (!$('setup').classList.contains('hidden')) this.renderSetup(); else this.renderPhonePanel();
    this.syncPhones();
  }
  setChar(slot, c) {
    if (c < 0 || c >= CHARACTERS.length || this.inRace()) return;
    this.cfg.pl[slot].char = c; this.saveCfg();
    this.onPhonesChanged();
  }
  phoneCommand(cmd, p) {
    if (p.slot < 0) return;
    if (cmd === 'pause' && this.inRace()) this.setPaused(!this.paused);
    else if (cmd === 'menu') { this.setPaused(false); this.quitToMenu(); this.show('setup'); this.renderSetup(); }
    else if ((cmd === 'start' || cmd === 'again') && !this.inRace()) { this.audio.init(); this.startRace(); }
  }
  renderPhonePanel() {
    const url = this.joinUrl(null);
    $('join-url').textContent = url ? url.replace(/^https:\/\//, '') : (this.phones.info ? 'phone server not running (start with npm run dev)' : '...');
    $('room-code').textContent = this.S.requireCode ? this.room : 'open';
    this.phones.drawQR($('qr'), url);
    const st = $('phone-status'); st.innerHTML = '';
    for (const p of [...this.phones.list.values()].filter(p => p.connected).sort((a, b) => a.order - b.order)) {
      const sp = document.createElement('span');
      sp.style.background = p.slot >= 0 ? PLAYER_COLORS[p.slot] : '#8a7a6a';
      sp.textContent = (p.slot >= 0 ? `P${p.slot + 1} ${p.name}` : p.ready ? `${p.name} (watching)` : 'needs code / tap join') + (p.ready && STEER_MODES[p.mode] ? ` · ${STEER_MODES[p.mode]}` : '');
      st.appendChild(sp);
    }
  }
  hudToPhones() {
    for (const k of this.humans) {
      const p = this.phones.bySlot(k.player);
      if (!p) continue;
      this.phones.send(p.id, { t: 'hud', pos: k.rank + 1, lap: k.lap, laps: this.laps, item: k.item, count: k.itemCount, rolling: k.rollT > 0, itemName: k.item ? ITEMS[k.item].name : 'ITEM' });
    }
  }

  buildMenus() {
    $('cast').innerHTML = CHARACTERS.map((c, i) => `<img class="cimg" alt="${c.name}" style="animation-delay:${i * .12}s" src="${this.portraits.chars[c.id].url}">`).join('');
    const click = (id, fn) => $(id).addEventListener('click', () => { this.audio.init(); this.audio.click(); fn(); });
    click('btn-play', () => { this.show('setup'); this.renderSetup(); if (this.S.music > 0) this.audio.startMusic(); });
    click('btn-back', () => this.show('title'));
    click('btn-go', () => this.startRace());
    click('btn-newcode', () => this.newRoom());
    for (const id of ['btn-settings-title', 'btn-settings-setup', 'btn-settings-pause']) click(id, () => this.openSettings());
    click('btn-settings-done', () => { this.show(this.settingsFrom); if (this.settingsFrom === 'setup') this.renderSetup(); });
    click('btn-settings-reset', () => { this.S = { ...DEFAULTS }; saveSettings(this.S); this.applySettings(); this._redrawSettings(); });
    addEventListener('pointerdown', () => this.audio.init(), { once: true });
    click('btn-resume', () => this.setPaused(false));
    click('btn-restart', () => { this.setPaused(false); this.startRace(); });
    click('btn-quit', () => { this.setPaused(false); this.quitToMenu(); });
    click('btn-again', () => this.startRace());
    click('btn-menu', () => this.quitToMenu());
    addEventListener('keydown', e => {
      if ((e.code === 'Escape' || e.code === 'KeyP') && (this.state === 'race' || this.state === 'countdown')) this.setPaused(!this.paused);
      if (e.code === 'Enter' && !$('title').classList.contains('hidden')) $('btn-play').click();
    });
  }

  seg(el, opts, get, set) {
    el.innerHTML = '';
    for (const [v, label] of opts) {
      const b = document.createElement('button');
      b.textContent = label; b.className = get() === v ? 'on' : '';
      b.onclick = () => { this.audio.click(); set(v); this.renderSetup(); };
      el.appendChild(b);
    }
  }

  renderSetup() {
    const c = this.cfg;
    c.cpus = Math.min(c.cpus, 8 - c.players);
    this.seg($('seg-players'), [[1, '1'], [2, '2'], [3, '3'], [4, '4']], () => c.players, v => { c.players = v; this.assignPhones(); this.syncPhones(); });
    this.seg($('seg-cpu'), Array.from({ length: 9 - c.players }, (_, i) => [i, String(i)]), () => c.cpus, v => c.cpus = v);
    this.seg($('seg-laps'), [[1, '1'], [2, '2'], [3, '3'], [5, '5']], () => c.laps, v => c.laps = v);
    this.seg($('seg-diff'), [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']], () => c.diff, v => c.diff = v);
    const mc = $('map-cards');
    if (mc) {
      mc.innerHTML = '';
      MAPS.forEach((d, i) => {
        const b = document.createElement('button');
        b.className = 'mcard' + (i === c.map ? ' on' : '');
        b.style.setProperty('--mc', d.theme.ui);
        b.innerHTML = `<span class="mname">${d.name}</span><small class="mblurb">${d.blurb}</small>`;
        const cv = this.mapThumbs[i].canvas.cloneNode(); cv.className = 'mthumb'; cv.getContext('2d').drawImage(this.mapThumbs[i].canvas, 0, 0);
        b.prepend(cv);
        b.onclick = () => { this.audio.click(); this.setMap(i); };
        mc.appendChild(b);
      });
    }
    const box = $('player-cards'); box.innerHTML = '';
    for (let p = 0; p < c.players; p++) {
      const pc = c.pl[p], ch = CHARACTERS[pc.char];
      const card = document.createElement('div'); card.className = 'pcard';
      card.style.setProperty('--pc', PLAYER_COLORS[p]);
      card.innerHTML = `<h3><span class="ptag">Player ${p + 1}</span><img class="pimg" alt="" src="${this.portraits.chars[ch.id].url}"></h3>
        <div class="chars">${CHARACTERS.map((x, i) => `<button data-i="${i}" class="${i === pc.char ? 'on' : ''}" title="${x.name}"><img alt="${x.name}" src="${this.portraits.chars[x.id].url}"></button>`).join('')}</div>
        <div class="cname">${ch.name}</div>
        <div class="stats">${[['Speed', ch.speed, .93, 1.07], ['Accel', ch.accel, .88, 1.18], ['Handling', ch.handling, .9, 1.14], ['Weight', ch.weight, .7, 1.4]]
          .map(([n, v, a, b]) => `<span>${n}</span><div class="bar"><i style="width:${Math.round(15 + 85 * (v - a) / (b - a))}%"></i></div>`).join('')}</div>
        <select>${CONTROL_OPTIONS.map(([v, l]) => `<option value="${v}" ${v === pc.ctrl ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
      card.querySelectorAll('.chars button').forEach(b => b.onclick = () => { this.audio.click(); pc.char = +b.dataset.i; this.renderSetup(); });
      card.querySelector('select').onchange = e => { pc.ctrl = e.target.value; this.saveCfg(); this.assignPhones(); this.onPhonesChanged(); };
      if (pc.ctrl === 'phone') {
        const h = this.phones.slotHolder(p);
        if (h) {
          const d = document.createElement('div'); d.className = 'pphone';
          d.innerHTML = `<i class="dot ${h.connected ? '' : 'off'}"></i><span class="pname"></span>`;
          d.querySelector('.pname').textContent = h.name + (h.connected ? '' : ' (reconnecting)');
          if (STEER_MODES[h.mode]) {
            const md = document.createElement('small'); md.className = 'pmode'; md.textContent = STEER_MODES[h.mode];
            md.title = 'Steering mode chosen on the phone';
            md.style.cssText = 'font-size:11px;line-height:1;padding:2px 6px;border-radius:999px;background:#fff;color:#1b1b3a;border:2px solid #1b1b3a;white-space:nowrap;flex:none';
            d.appendChild(md);
          }
          const kick = document.createElement('button'); kick.className = 'btn small'; kick.textContent = 'Remove';
          kick.onclick = () => { this.audio.click(); this.phones.kick(h); this.toast(`${h.name} removed`); this.onPhonesChanged(); };
          d.appendChild(kick);
          card.appendChild(d);
        } else {
          const d = document.createElement('div'); d.className = 'seat-qr';
          const cv = document.createElement('canvas'); d.appendChild(cv);
          d.insertAdjacentHTML('beforeend', `<span>Scan to play as Player ${p + 1}</span>`);
          this.phones.drawQR(cv, this.joinUrl(p), 110);
          card.appendChild(d);
        }
      }
      box.appendChild(card);
    }
    this.saveCfg();
    this.renderPhonePanel();
  }
  saveCfg() { try { localStorage.setItem('farmkart.cfg', JSON.stringify(this.cfg)); } catch {} }

  quitToMenu() {
    this.show('title');
    this.startAttract();
    this.assignPhones(); this.onPhonesChanged();
  }

  setPaused(p) {
    this.paused = p;
    this.show(p ? 'pause' : null);
    this.syncPhones();
    for (let i = 0; i < this.humans.length; i++) this.audio.engine(i, 0, false, !p);
  }

  // ------------------------------------------------------------------ race setup
  clearKarts() {
    for (const k of this.karts) { this.scene.remove(k.model.root); this.track.group.remove(k.shadow); }
    this.karts = []; this.humans = []; this.ais.clear();
    this.items.reset(); this.particles.clear();
  }

  spawn(list) {
    // list: [{ch, player, name}] in grid order (front first)
    const tr = this.track;
    list.forEach((e, k) => {
      const kart = new Kart(this, e.ch, { player: e.player, tint: e.tint || 0, name: e.name });
      const row = Math.floor(k / 2), back = 7 + row * 6.5 + (k % 2) * 3;
      kart.place(tr.wrap(-Math.round(back / tr.seg)), k % 2 ? 4.2 : -4.2);
      this.karts.push(kart);
      this.ais.set(kart, new AIDriver(kart, kart.isHuman ? .8 : DIFF[this.cfg.diff].skill));
      if (kart.isHuman) this.humans[e.player] = kart;
    });
  }

  startAttract() {
    this.clearKarts();
    this.loadMap(this.cfg.map);
    this.fx.clear();
    this.state = 'attract'; this.paused = false;
    this.laps = 99;
    const chars = [...CHARACTERS].sort(() => Math.random() - .5);
    this.spawn(chars.map(ch => ({ ch, player: -1 })));
    for (const k of this.karts) k.speedMult = .9 + Math.random() * .12;
    this.raceTime = 0; this.raceOn = true;
    this.attractCam = { k: 0, t: 0 };
    this.audio.setEngines(0);
  }

  startRace() {
    const c = this.cfg;
    this.clearKarts();
    this.loadMap(c.map);
    this.fx.clear();
    this.show(null);
    this.laps = c.laps;
    this.controls = c.pl.slice(0, c.players).map(p => p.ctrl);
    const used = new Set(c.pl.slice(0, c.players).map(p => p.char));
    const free = CHARACTERS.filter((_, i) => !used.has(i));
    const cpuList = [];
    for (let i = 0; i < c.cpus; i++) {
      const ch = free.length ? free[i % free.length] : CHARACTERS[i % CHARACTERS.length];
      cpuList.push({ ch, player: -1, tint: i >= free.length ? .15 : 0 });
    }
    const humanList = c.pl.slice(0, c.players).map((p, i) => {
      const dup = c.pl.slice(0, i).some(q => q.char === p.char);
      const h = p.ctrl === 'phone' ? this.phones.slotHolder(i) : null;
      return { ch: CHARACTERS[p.char], player: i, name: h?.name ? `${h.name} (${CHARACTERS[p.char].name})` : `P${i + 1} ${CHARACTERS[p.char].name}`, tint: dup ? .3 * i : 0 };
    });
    this.spawn([...cpuList, ...humanList]);
    for (const k of this.karts) if (!k.isHuman) k.speedMult = DIFF[c.diff].mult;
    this.state = 'countdown'; this.countT = 3.99; this.lastCount = 4;
    this.raceTime = 0; this.raceOn = false; this.firstFinish = null; this.endT = null;
    this.camState.forEach(s => s.init = false);
    this.audio.init();
    this.audio.setEngines(c.players);
    if (c.music) this.audio.startMusic();
    this.gasHeldSince = this.humans.map(() => null);
    this.syncPhones();
  }

  // ------------------------------------------------------------------ events
  onLap(k) {
    if (this.state === 'attract') return;
    const now = this.raceTime;
    if (k.lap > 1) { k.lapTimes.push(now - k.lapStart); }
    k.lapStart = now;
    if (k.lap > this.laps && !k.finished) {
      k.finished = true; k.finishTime = now;
      if (this.firstFinish == null) this.firstFinish = now;
      if (k.isHuman) { this.msg(k, 'FINISH!', '#ffd21f', 5); this.audio.finish(k.rank < 3); this.fx.onFinish(k); this.phones.buzz(k.player, [60, 40, 60, 40, 200]); }
    } else if (k.isHuman && k.lap === this.laps && this.laps > 1) { this.msg(k, 'FINAL LAP!', '#ff5a4a', 2.5); this.audio.finalLap(); }
    else if (k.isHuman && k.lap > 1) { this.msg(k, `LAP ${k.lap}`, '#fff6e3', 1.5); this.audio.lap(); }
  }
  onHit(victim, attacker, type) {
    if (attacker?.isHuman && attacker !== victim) { this.msg(attacker, 'HIT!', '#5fe36b', 1); this.phones.buzz(attacker.player, 25); }
  }
  msg(k, text, col, t) { k.msg = text; k.msgCol = col; k.msgT = t; }

  // ------------------------------------------------------------------ simulation
  step(dt) {
    this.time += dt;
    const racing = this.state === 'race' || this.state === 'attract' || this.state === 'results';
    if (this.state === 'countdown') {
      this.countT -= dt;
      const n = Math.ceil(this.countT);
      if (n < this.lastCount) { this.lastCount = n; this.audio.count(n); }
      // rocket start: hold gas from roughly "2" until GO
      this.humans.forEach((k, i) => {
        const inp = this.readHuman(k, i);
        if (inp.gas) { if (this.gasHeldSince[i] == null) this.gasHeldSince[i] = this.countT; } else this.gasHeldSince[i] = null;
      });
      if (this.countT <= 0) {
        this.state = 'race'; this.raceOn = true;
        this.humans.forEach((k, i) => { const s = this.gasHeldSince[i]; if (s != null && s < 1.6 && s > .2) { k.boostT = 1.2; this.audio.boost(true); this.msg(k, 'ROCKET START!', '#ff9a1a', 1.2); } });
      }
    }
    if (racing && this.state !== 'attract') this.raceTime += dt;

    // inputs
    for (const k of this.karts) {
      if (k.isHuman && !k.finished && this.state !== 'results') this.readHuman(k, k.player);
      else this.ais.get(k).think(dt, this);
    }
    // rubber-banding for CPUs relative to best human
    if (this.state === 'race') {
      const best = Math.max(...this.humans.filter(h => !h.finished).map(h => h.progress), -1);
      if (best > -1) for (const k of this.karts) {
        if (k.isHuman) continue;
        const base = DIFF[this.cfg.diff].mult, d = k.progress - best;
        const tgt = this.S.catchup ? base * (d > .12 ? .9 : d < -.15 ? 1.08 : 1) : base;
        k.speedMult += (tgt - k.speedMult) * Math.min(1, dt * .5);
      }
    }
    const raceOn = this.state !== 'countdown';
    for (const k of this.karts) k.update(dt, raceOn);
    this.collide(dt);
    this.items.update(dt, this.time);
    this.fx.update(dt);
    // ranking
    const sorted = [...this.karts].sort((a, b) => {
      if (a.finished && b.finished) return a.finishTime - b.finishTime;
      if (a.finished !== b.finished) return a.finished ? -1 : 1;
      return b.progress - a.progress;
    });
    sorted.forEach((k, i) => k.rank = i);
    for (const k of this.karts) if (k.msgT > 0 && !(k.finished && k.msg === 'FINISH!')) k.msgT -= dt;

    // wrong-way beep for humans
    for (const k of this.humans) if (k.wrongT > 1 && Math.floor(this.time * 3) !== Math.floor((this.time - dt) * 3) && Math.floor(this.time * 3) % 2 === 0) this.audio.wrong();

    const listeners = this.state === 'attract' ? [this.cams[0].position] : this.humans;
    this.track.update(dt, this.time, this.audio, listeners);
    this.particles.update(dt);

    // end of race
    if (this.state === 'race') {
      const allDone = this.humans.every(h => h.finished);
      const timeout = this.firstFinish != null && this.raceTime - this.firstFinish > 75;
      if ((allDone || timeout) && this.endT == null) this.endT = allDone ? 3.5 : .1;
      if (this.endT != null) { this.endT -= dt; if (this.endT <= 0) this.showResults(); }
    }
  }

  readHuman(k, i) {
    const alsoKeys = this.humans.length === 1 && this.controls[i] !== 'keysAll';
    return this.input.read(this.controls[i], i, k.input, alsoKeys);
  }

  collide(dt) {
    const ks = this.karts, tr = this.track;
    for (let a = 0; a < ks.length; a++) for (let b = a + 1; b < ks.length; b++) {
      const A = ks[a], Bk = ks[b];
      const dx = Bk.x - A.x, dz = Bk.z - A.z, d2 = dx * dx + dz * dz;
      if (d2 > 2.5 * 2.5 || d2 < 1e-6) continue;
      const d = Math.sqrt(d2), nx = dx / d, nz = dz / d, ov = 2.5 - d;
      const wa = A.ch.weight, wb = Bk.ch.weight, s = wa + wb;
      A.x -= nx * ov * wb / s; A.z -= nz * ov * wb / s;
      Bk.x += nx * ov * wa / s; Bk.z += nz * ov * wa / s;
      const push = 7;
      A.bvx -= nx * push * wb / s; A.bvz -= nz * push * wb / s;
      Bk.bvx += nx * push * wa / s; Bk.bvz += nz * push * wa / s;
      if (A.starT > 0 && Bk.starT <= 0) Bk.hit('egg');
      else if (Bk.starT > 0 && A.starT <= 0) A.hit('egg');
      else if ((A.isHuman || Bk.isHuman) && (A.bumpCd <= 0)) { this.audio.bump(true); A.bumpCd = .3; }
    }
    for (const k of ks) {
      for (const c of tr.colliders) {
        const dx = k.x - c.x, dz = k.z - c.z, d = Math.hypot(dx, dz), R = c.r + 1.2;
        if (d < R && d > 1e-4) {
          k.x = c.x + dx / d * R; k.z = c.z + dz / d * R;
          if (k.speed > 10) { k.speed *= .5; this.audio.bump(k.isHuman); this.particles.burst(c.x, k.y + 1.5, c.z, 10, 0xf2c14e, 6); }
          k.bvx += dx / d * 4; k.bvz += dz / d * 4;
        }
      }
      for (const c of tr.crossers) {
        const dx = k.x - c.x, dz = k.z - c.z, d = Math.hypot(dx, dz), R = c.r + 1.1;
        if (d < R && d > 1e-4) {
          k.x = c.x + dx / d * R; k.z = c.z + dz / d * R;
          if (Math.abs(k.speed) > 6 && k.hit('cow')) { c.hit = 1.2; this.audio.moo(c, [k]); }
          k.speed *= .6;
        }
      }
    }
  }

  showResults() {
    this.state = 'results';
    this.assignPhones(); this.syncPhones();
    const rows = [...this.karts].sort((a, b) => a.rank - b.rank);
    // estimate times for unfinished
    const tbl = $('results-table');
    tbl.innerHTML = '<tr><th>#</th><th>Racer</th><th>Time</th><th>Best lap</th></tr>' + rows.map(k => {
      const best = k.lapTimes.length ? Math.min(...k.lapTimes) : NaN;
      return `<tr class="${k.isHuman ? 'human' : ''}"><td>${ordinal(k.rank + 1)}</td><td><img class="rimg" alt="" src="${this.portraits.chars[k.ch.id].url}"> ${k.name}</td><td>${k.finished ? fmtTime(k.finishTime) : 'DNF'}</td><td>${fmtTime(best)}</td></tr>`;
    }).join('');
    this.show('results');
    for (let i = 0; i < this.humans.length; i++) this.audio.engine(i, 0, false, false);
  }

  // ------------------------------------------------------------------ rendering
  views() {
    const W = innerWidth, H = innerHeight;
    if (this.state === 'attract') return [{ x: 0, y: 0, w: W, h: H, cam: 0 }];
    const n = this.humans.length;
    if (n === 1) return [{ x: 0, y: 0, w: W, h: H, cam: 0, k: this.humans[0], p: 0 }];
    if (n === 2) return this.S.split2 === 'vertical'
      ? [0, 1].map(i => ({ x: i * W / 2, y: 0, w: W / 2, h: H, cam: i, k: this.humans[i], p: i }))
      : [0, 1].map(i => ({ x: 0, y: i * H / 2, w: W, h: H / 2, cam: i, k: this.humans[i], p: i }));
    return this.humans.map((k, i) => ({ x: (i % 2) * W / 2, y: Math.floor(i / 2) * H / 2, w: W / 2, h: H / 2, cam: i, k, p: i }));
  }

  updateCamera(cam, st, k, dt, v) {
    const target = k.heading + k.driftVis * .45;
    if (!st.init) { st.h = target; st.init = true; st.pos = null; }
    st.h += wrapA(target - st.h) * Math.min(1, dt * 6);
    let h = st.h;
    const cm = CAM[this.S.camera] || CAM.normal;
    let back = 9.5 * cm[0], up = 4.2 * cm[1];
    if (this.state === 'countdown') {
      const f = Math.max(0, Math.min(1, (this.countT - .6) / 3.2));
      h += f * f * Math.PI * .9; back += f * 6; up += f * 3;
    }
    if (this.state === 'results' || k.finished) { h += this.time * .3; back = 13; up = 5.5; }
    const fx = Math.sin(h), fz = Math.cos(h);
    const want = new THREE.Vector3(k.x - fx * back, k.y + up, k.z - fz * back);
    want.y = Math.max(want.y, terrainH(want.x, want.z) + 1.8);
    if (!st.pos) st.pos = want.clone();
    // follow position tightly (heading is already smoothed); smooth only height
    st.pos.x = want.x; st.pos.z = want.z;
    st.pos.y += (want.y - st.pos.y) * (1 - Math.exp(-dt * 8));
    cam.position.copy(st.pos);
    cam.lookAt(k.x + Math.sin(k.heading) * 4, k.y + 1.6, k.z + Math.cos(k.heading) * 4);
    const sh = k.isHuman && this.S.shake ? this.fx.shakeOffset(k.player) : null;
    if (sh) cam.position.add(sh);
    const wide = v.w / v.h > 2;
    const fov = (wide ? 52 : 64) + (k.boostT > 0 ? 9 : 0) + Math.min(6, Math.max(0, k.speed) / 8);
    st.fov += (fov - st.fov) * Math.min(1, dt * 4);
    cam.fov = st.fov;
  }

  attractCamera(dt) {
    const a = this.attractCam, cam = this.cams[0];
    a.t -= dt;
    if (a.t <= 0) { a.t = 7; a.k = (a.k + 1 + Math.floor(Math.random() * 3)) % this.karts.length; a.mode = Math.floor(Math.random() * 3); a.ang = Math.random() * 6; }
    const k = this.karts[a.k];
    let x, y, z;
    if (a.mode === 0) { const h = k.heading + Math.PI + Math.sin(this.time * .2) * .9; x = k.x + Math.sin(h) * 11; z = k.z + Math.cos(h) * 11; y = k.y + 3.5; }
    else if (a.mode === 1) { a.ang += dt * .25; x = k.x + Math.sin(a.ang) * 16; z = k.z + Math.cos(a.ang) * 16; y = k.y + 7; }
    else { const h = k.heading - .6; x = k.x + Math.sin(h) * -9; z = k.z + Math.cos(h) * -9; y = k.y + 2.2; }
    y = Math.max(y, terrainH(x, z) + 2);
    if (!a.pos || a.snap !== a.k) { a.pos = new THREE.Vector3(x, y, z); a.snap = a.k; }
    a.pos.lerp(new THREE.Vector3(x, y, z), 1 - Math.exp(-dt * 5));
    cam.position.copy(a.pos);
    cam.lookAt(k.x, k.y + 1.2, k.z);
    cam.fov = 60;
  }

  render(dt) {
    const r = this.renderer, W = innerWidth, H = innerHeight;
    const views = this.views();
    r.setScissorTest(true);
    r.setClearColor(0x2b1d14);
    r.setViewport(0, 0, W, H); r.setScissor(0, 0, W, H); r.clear();
    for (const v of views) {
      const cam = this.cams[v.cam];
      if (this.state === 'attract') this.attractCamera(dt);
      else this.updateCamera(cam, this.camState[v.cam], v.k, dt, v);
      cam.aspect = v.w / v.h; cam.updateProjectionMatrix();
      const gy = H - v.y - v.h;
      r.setViewport(v.x, gy, v.w, v.h); r.setScissor(v.x, gy, v.w, v.h);
      this.particles.points.material.uniforms.scale.value = v.h * r.getPixelRatio() * .5 / Math.tan(cam.fov * Math.PI / 360);
      const fk = v.k || this.karts[this.attractCam?.k] || null;
      if (fk) { const f = 40; this.track.focusShadow(fk.x + Math.sin(fk.heading) * f, fk.y, fk.z + Math.cos(fk.heading) * f); }
      r.shadowMap.needsUpdate = true;
      if (this.fx.weather) this.fx.weather.visible = this.S.weather && this.S.quality !== 'low';
      this.fx.beforeRender(cam);
      r.render(this.scene, cam);
    }
    r.setScissorTest(false);

    // HUD
    const hud = this.hud; hud.clear();
    if (this.state === 'attract') return;
    if (this.state !== 'results') views.forEach(v => { hud.drawView(this, v, v.k, v.p); if (this.S.screenFx) this.fx.drawHUD(hud.g, v, v.k); });
    const n = this.humans.length;
    if (this.state === 'results' || !this.S.minimap) return;
    if (n === 3) hud.minimap(this, { x: W / 2 + 10, y: H / 2 + 10, w: W / 2 - 20, h: H / 2 - 20 }, true);
    else if (n === 4) hud.minimap(this, { x: W / 2 - 80, y: H / 2 - 80, w: 160, h: 160 });
    else if (n === 2) hud.minimap(this, { x: W / 2 - 75, y: H / 2 - 75, w: 150, h: 150 });
    else hud.minimap(this, { x: W - 230, y: H / 2 - 110, w: 210, h: 210 });
  }

  frame(now) {
    requestAnimationFrame(t => this.frame(t));
    let dt = Math.min(.1, (now - this.last) / 1000); this.last = now;
    if (this.input.startPressed() && (this.state === 'race' || this.state === 'countdown')) this.setPaused(!this.paused);
    if (!this.paused) {
      this.acc += dt;
      const h = 1 / 60;
      let n = 0;
      while (this.acc >= h && n < 6) { this.step(h); this.acc -= h; n++; }
      if (n === 6) this.acc = 0;
    } else dt = 0;
    this.render(dt);
    if (this.S.fps) { this._fc = (this._fc || 0) + 1; if (now - (this._fpsT || 0) > 500) { $('fps').textContent = `${Math.round(this._fc * 1000 / (now - (this._fpsT || now - 500)))} fps`; this._fc = 0; this._fpsT = now; } }
    // engine sounds
    this.humans.forEach((k, i) => this.audio.engine(i, Math.min(1, Math.abs(k.speed) / 55), k.boostT > 0, !this.paused && this.state !== 'results'));
    // phone HUD + periodic lobby sync
    if (now - (this._hudT || 0) > 150) { this._hudT = now; if (this.inRace() || this.state === 'results') this.hudToPhones(); }
    if (now - (this._syncT || 0) > 2000) { this._syncT = now; this.syncPhones(); }
    this.input.endFrame();
  }
}

window.game = new Game();
