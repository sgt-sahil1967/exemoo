// Back2Back menus and HUD (DOM over the canvas). Every control is a real <button>, so the phone's
// d-pad and Action can click them (see Phones.nav).
import type { Upgrade } from './sim';
import { SPECS, crosshairSvg, display, type Settings, type Key } from './settings';

export interface CardInfo {
  label: string;
  sub: string;
  connected: boolean;
  pin: string;
  qrSrc: string;
  color: string;
}

export interface HudData {
  hull: number;
  maxHull: number;
  speed: number;
  gear: number;
  dist: number;
  score: number;
  level: number;
  kills: number;
  upg: Record<'engine' | 'armor' | 'rapid' | 'spread', number>;
  mult: number;
  comboFrac: number;
  shield: number;
  boss: number | null;
  bossName: string;
  zone: string;
  heat: number;
  overheated: boolean;
  drift: number;
  driftTier: number;
  air: boolean;
  storm: number;
  stormV: number;
  nitroReady: boolean;
  nitroOn: boolean;
  ready: number;
  driverIn: 'phone' | 'keys';
  shooterIn: 'phone' | 'keys';
  driverOn: boolean;
  shooterOn: boolean;
}

const UPG_NAME: Record<Upgrade, string> = { engine: 'Engine', armor: 'Armor', rapid: 'Rapid', spread: 'Spread', shield: 'Shield', repair: 'Repair' };
const UPG_COLOR: Record<Upgrade, string> = { engine: '#ff8a00', armor: '#2f7cff', rapid: '#ffd21f', spread: '#2fc65a', shield: '#9b4dff', repair: '#ff3b30' };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function upgradeName(u: Upgrade): string {
  return UPG_NAME[u];
}

export function createUI(root: HTMLElement, hud: HTMLElement) {
  hud.innerHTML = `
    <div id="stormFx"></div>
    <div class="hud-top">
      <div class="hcard drv"><b>DRIVER</b><span class="hull" id="hHull"></span><small id="hSpeed"></small><small id="hDrift"></small><div class="storm"><u id="hStormFill"></u></div><small id="hStorm"></small></div>
      <div class="hcard mid"><div id="hDist">0 m</div><div class="small" id="hScore">0</div><div class="lvl" id="hLevel">Level 1</div><div class="combo" id="hCombo"></div></div>
      <div class="hcard shot"><b>SHOOTER</b><span id="hKills">0</span><small id="hReady"></small><div class="heat"><u id="hHeat"></u></div></div>
    </div>
    <div class="bossbar" id="hBoss"><b id="hBossName">MEGA HARVESTER</b><i><u id="hBossFill"></u></i></div>
    <div class="hud-bot">
      <div class="chips" id="hUpg"></div>
      <div class="nitro" id="hNitro"></div>
      <div class="conn" id="hConn"></div>
    </div>`;
  const $ = (id: string) => document.getElementById(id) as HTMLElement;
  let lastKey = '';

  const show = (html: string) => {
    root.innerHTML = html;
    root.classList.add('on');
  };
  const on = (sel: string, fn: () => void) => root.querySelector<HTMLButtonElement>(sel)?.addEventListener('click', fn);

  return {
    hideOverlay(): void {
      root.classList.remove('on');
      root.innerHTML = '';
    },

    showTitle(o: { best: number; onPlay: () => void; onHow: () => void; onSettings: () => void; onExit?: () => void }): void {
      show(`
        <div class="menu">
          <div class="menu-main">
            <h1 class="logo">BACK<span>2</span>BACK</h1>
            <p class="tag">One drives. One shoots. Outrun the storm.</p>
            <div class="menu-btns">
              <button class="btn yellow big" id="bPlay">Play</button>
              <button class="btn blue" id="bHow">How to play</button>
              <button class="btn" id="bSet">Settings</button>
              ${o.onExit ? '<button class="btn ghost" id="bExit">Exit</button>' : ''}
            </div>
          </div>
          <div class="menu-side">
            <div class="role red"><b>Player 1 · Driver</b><span>Tilt to steer. Hold GAS: the storm is chasing you.</span></div>
            <div class="role blue"><b>Player 2 · Shooter</b><span>Aim with your phone, hold Action to fire.</span></div>
            <div class="best"><b>${o.best > 0 ? `${Math.round(o.best)} m` : '–'}</b><span>best run</span></div>
          </div>
        </div>`);
      on('#bPlay', o.onPlay);
      on('#bHow', o.onHow);
      on('#bSet', o.onSettings);
      if (o.onExit) on('#bExit', o.onExit);
      root.querySelector<HTMLButtonElement>('#bPlay')?.focus();
    },

    showHow(o: { onBack: () => void }): void {
      show(`
        <div class="panel how">
          <h2>How to play</h2>
          <div class="roles">
            <div class="role red"><b>Driver</b><span>Tilt the phone to steer. GAS keeps you moving, BRAKE slows, DRIFT through bends for a boost, ITEM fires nitro. Ramps and boost pads help you gain ground.</span></div>
            <div class="role blue"><b>Shooter</b><span>Point your phone at the screen to aim. Hold Action to fire. Headshots on vehicles crit; the gun overheats if you hold it too long.</span></div>
          </div>
          <ul class="tips">
            <li><b>The storm</b> starts behind you and gets faster all the time. Watch the purple bar on the driver card: stay ahead, or it catches you.</li>
            <li><b>Every zone ends in a boss.</b> A harvester, or a bandit village you drive through: shoot the gate open and fell the chief, or the guards get a free attack as you pass.</li>
            <li><b>Stay on the road.</b> The verge slows you down and the ditch hurts.</li>
          </ul>
          <p class="hint">No phone? Driver: ← → steer, ↑ gas, ↓ brake, Z drift, Shift nitro. Shooter: mouse aims, click or Space fires. P / Esc pauses.</p>
          <div class="row"><button class="btn yellow big" id="bBack">Back</button></div>
        </div>`);
      on('#bBack', o.onBack);
      root.querySelector<HTMLButtonElement>('#bBack')?.focus();
    },

    showSettings(o: { s: Settings; onStep: (key: Key, dir: 1 | -1) => void; onReset: () => void; onBack: () => void; focus?: string }): void {
      const groups = ['Shooter', 'Driver', 'Game'] as const;
      const rows = groups
        .map(
          (g) => `<div class="sgroup"><h3>${g}</h3>${SPECS.filter((sp) => sp.group === g)
            .map(
              (sp) => `<div class="srow"><span class="slabel">${sp.label}</span>
                <button class="btn step" data-k="${sp.key}" data-d="-1" aria-label="${sp.label} down">‹</button>
                <span class="sval" id="v_${sp.key}">${display(o.s, sp)}</span>
                <button class="btn step" data-k="${sp.key}" data-d="1" aria-label="${sp.label} up">›</button></div>`,
            )
            .join('')}</div>`,
        )
        .join('');
      show(`
        <div class="panel settings">
          <h2>Settings</h2>
          <div class="sbody">
            <div class="scols">${rows}</div>
            <div class="spreview"><div class="xprev" style="--xh:${Math.round(44 * o.s.crosshairSize)}px">${crosshairSvg(o.s.crosshairStyle, o.s.crosshairColor)}</div><span>Crosshair preview</span></div>
          </div>
          <div class="row">
            <button class="btn ghost" id="bReset">Reset</button>
            <button class="btn yellow big" id="bBack">Done</button>
          </div>
        </div>`);
      root.querySelectorAll<HTMLButtonElement>('button.step').forEach((b) =>
        b.addEventListener('click', () => o.onStep(b.dataset.k as Key, Number(b.dataset.d) as 1 | -1)),
      );
      on('#bReset', o.onReset);
      on('#bBack', o.onBack);
      const f = o.focus ? root.querySelector<HTMLButtonElement>(o.focus) : null;
      (f ?? root.querySelector<HTMLButtonElement>('button.step'))?.focus();
    },

    showPairing(o: { driver: CardInfo; shooter: CardInfo; onStart: () => void; onBack: () => void }): void {
      const card = (c: CardInfo) => `
        <div class="pcard" style="--c:${c.color}">
          <div class="ptitle">${esc(c.label)}</div>
          ${c.connected ? '<div class="pok">Phone connected ✓</div>' : c.qrSrc ? `<img class="qr" alt="QR code" src="${esc(c.qrSrc)}" />` : '<div class="qrwait">…</div>'}
          ${c.pin && !c.connected ? `<div class="pin">PIN ${esc(c.pin)}</div>` : ''}
          <div class="psub">${esc(c.sub)}</div>
        </div>`;
      show(`
        <div class="panel pairing">
          <h2>Pair your phones</h2>
          <div class="cards">${card(o.driver)}${card(o.shooter)}</div>
          <div class="row">
            <button class="btn ghost" id="bBack">Back</button>
            <button class="btn yellow big" id="bGo">Start run</button>
          </div>
          <p class="hint">Phones are optional: the keyboard and mouse can play either seat.</p>
        </div>`);
      on('#bGo', o.onStart);
      on('#bBack', o.onBack);
    },

    showCountdown(n: number): void {
      show(`<div class="count">${n > 0 ? n : 'GO!'}</div>`);
      root.querySelector('.count')?.classList.add('pop');
    },

    showPause(o: { onResume: () => void; onRestart: () => void; onQuit: () => void; onSettings: () => void }): void {
      show(`
        <div class="panel">
          <h2>Paused</h2>
          <div class="col">
            <button class="btn yellow big" id="bResume">Resume</button>
            <button class="btn blue" id="bRestart">Restart</button>
            <button class="btn" id="bSet">Settings</button>
            <button class="btn ghost" id="bQuit">Quit</button>
          </div>
        </div>`);
      on('#bResume', o.onResume);
      on('#bRestart', o.onRestart);
      on('#bSet', o.onSettings);
      on('#bQuit', o.onQuit);
    },

    showResults(o: { dist: number; score: number; kills: number; accuracy: number; level: number; best: number; isBest: boolean; storm?: boolean; onAgain: () => void; onQuit: () => void }): void {
      show(`
        <div class="panel results">
          <h2>${o.isBest ? 'New best!' : o.storm ? 'Swallowed by the storm' : 'Wrecked'}</h2>
          <div class="stats">
            <div><b>${Math.round(o.dist)} m</b><span>distance</span></div>
            <div><b>${Math.round(o.score)}</b><span>score</span></div>
            <div><b>${o.kills}</b><span>kills</span></div>
            <div><b>${o.accuracy}%</b><span>accuracy</span></div>
            <div><b>${o.level}</b><span>level</span></div>
            <div><b>${Math.round(o.best)} m</b><span>best</span></div>
          </div>
          <div class="row">
            <button class="btn ghost" id="bQuit">Menu</button>
            <button class="btn yellow big" id="bAgain">Run again</button>
          </div>
        </div>`);
      on('#bAgain', o.onAgain);
      on('#bQuit', o.onQuit);
    },

    hudShow(on: boolean): void {
      hud.classList.toggle('hidden', !on);
    },

    hudUpdate(d: HudData): void {
      const hearts = Array.from({ length: d.maxHull }, (_, i) => (i < d.hull ? '♥' : '·')).join(' ');
      const upg =
        (Object.keys(d.upg) as ('engine' | 'armor' | 'rapid' | 'spread')[])
          .filter((u) => d.upg[u] > 0)
          .map((u) => `<i style="background:${UPG_COLOR[u]}">${UPG_NAME[u]} ×${d.upg[u]}</i>`)
          .join('') + (d.shield > 0 ? `<i style="background:${UPG_COLOR.shield}">Shield ${Math.ceil(d.shield)}s</i>` : '');
      const key = [hearts, d.speed | 0, d.gear, d.dist | 0, d.score | 0, d.level, d.kills, upg, d.nitroReady, d.nitroOn, Math.round(d.storm / 2), d.speed > d.stormV, d.mult, d.heat.toFixed(2), d.overheated, d.drift.toFixed(1), d.driftTier, d.air, d.comboFrac.toFixed(1), d.boss === null ? -1 : d.boss.toFixed(2), d.bossName, d.zone, d.ready.toFixed(2), d.driverIn, d.shooterIn, d.driverOn, d.shooterOn].join('|');
      if (key === lastKey) return;
      lastKey = key;
      $('hHull').textContent = hearts;
      $('hSpeed').textContent = `${Math.round(d.speed * 3.6)} km/h · G${d.gear}`;
      $('hDist').textContent = `${Math.round(d.dist)} m`;
      $('hScore').textContent = `${Math.round(d.score)} pts`;
      $('hLevel').textContent = `${d.zone} · Lv ${d.level}`;
      $('hCombo').textContent = d.mult > 1 ? `COMBO ×${d.mult}` : '';
      $('hBossName').textContent = d.bossName;
      $('hBoss').classList.toggle('on', d.boss !== null);
      ($('hBossFill') as HTMLElement).style.width = `${Math.max(0, (d.boss ?? 0) * 100)}%`;
      $('hKills').textContent = `${d.kills} down`;
      $('hReady').textContent = d.overheated ? 'OVERHEAT!' : d.ready >= 1 ? 'Ready' : 'Reloading';
      const heatEl = $('hHeat') as HTMLElement;
      heatEl.style.width = `${Math.round(d.heat * 100)}%`;
      heatEl.parentElement?.classList.toggle('hot', d.overheated || d.heat > 0.75);
      const gap = Math.max(0, d.storm);
      const close = Math.max(0, Math.min(1, 1 - gap / 260));
      const fill = $('hStormFill') as HTMLElement;
      fill.style.width = `${Math.round(close * 100)}%`;
      fill.parentElement?.classList.toggle('hot', gap < 90);
      $('hStorm').textContent = `STORM ${Math.round(gap)} m ${d.speed > d.stormV ? '▲ pulling away' : '▼ closing in'}`;
      $('hStorm').classList.toggle('hot', gap < 90);
      hud.style.setProperty('--storm', String(Math.max(0, Math.min(1, 1 - gap / 140)).toFixed(2)));
      $('hDrift').textContent = d.air ? 'AIRBORNE' : d.driftTier > 0 ? `DRIFT ${'★'.repeat(d.driftTier)}` : d.drift > 0 ? 'drifting…' : '';
      $('hUpg').innerHTML = upg;
      $('hNitro').textContent = d.nitroOn ? 'NITRO!' : d.nitroReady ? 'Nitro ready (ITEM)' : 'Nitro recharging';
      $('hNitro').classList.toggle('on', d.nitroOn);
      $('hConn').innerHTML = `<span class="${d.driverOn ? 'dot on' : 'dot'}"></span>Driver · ${d.driverIn === 'phone' ? 'phone' : 'keys'}
        <span class="${d.shooterOn ? 'dot on' : 'dot'}"></span>Shooter · ${d.shooterIn === 'phone' ? 'phone' : 'mouse'}`;
    },

    toast(text: string, color = '#ffd21f'): void {
      const t = document.getElementById('toast');
      if (!t) return;
      t.textContent = text;
      t.style.setProperty('--c', color);
      t.classList.remove('show');
      void t.offsetWidth;
      t.classList.add('show');
    },

    /** The phone's d-pad: focus the first button when nothing is focused, so Action can click it. */
    focusFirst(): void {
      (root.querySelector<HTMLButtonElement>('.btn.yellow') ?? root.querySelector<HTMLButtonElement>('button'))?.focus();
    },
  };
}

export type UI = ReturnType<typeof createUI>;
