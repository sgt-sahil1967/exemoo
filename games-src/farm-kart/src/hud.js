// 2D canvas HUD drawn over the 3D viewports.
import { ITEMS, ITEM_KEYS } from './items.js';
import { PLAYER_COLORS } from './phones.js';

const ORD = ['st', 'nd', 'rd'];
export const ordinal = n => n + (n % 100 > 10 && n % 100 < 14 ? 'th' : ORD[(n % 10) - 1] || 'th');
const FONT = '"Lilita One", "Baloo 2", "Arial Black", sans-serif';
export const fmtTime = t => {
  if (!isFinite(t)) return '--:--.--';
  const m = Math.floor(t / 60), s = t - m * 60;
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(2)}`;
};

export class HUD {
  constructor(canvas) {
    this.c = canvas; this.g = canvas.getContext('2d');
    this.resize();
    addEventListener('resize', () => this.resize());
  }
  resize() {
    const d = Math.min(devicePixelRatio || 1, 2);
    this.c.width = innerWidth * d; this.c.height = innerHeight * d;
    this.g.setTransform(d, 0, 0, d, 0, 0);
    this.W = innerWidth; this.H = innerHeight;
  }
  clear() { this.g.clearRect(0, 0, this.W, this.H); }

  text(s, x, y, size, fill = '#fff', align = 'left', stroke = '#1b1b3a', lw) {
    const g = this.g;
    g.font = `${size}px ${FONT}`; g.textAlign = align; g.textBaseline = 'alphabetic';
    g.lineJoin = 'round'; g.lineWidth = lw ?? Math.max(3, size * .16); g.strokeStyle = stroke;
    g.strokeText(s, x, y); g.fillStyle = fill; g.fillText(s, x, y);
  }

  drawView(game, v, k, pi) {
    const g = this.g;
    const s = Math.min(1.25, Math.max(.6, Math.min(v.w / 900, v.h / 520)));
    g.save();
    g.beginPath(); g.rect(v.x, v.y, v.w, v.h); g.clip();
    const pad = 14 * s;

    // player tag
    if (game.humans.length > 1) {
      g.fillStyle = PLAYER_COLORS[pi]; g.fillRect(v.x, v.y, v.w, 4);
      this.text('P' + (pi + 1), v.x + v.w - pad, v.y + 30 * s, 24 * s, PLAYER_COLORS[pi], 'right');
    }

    // lap + time
    const lapShown = Math.min(Math.max(k.lap, 1), game.laps);
    this.text('LAP', v.x + pad, v.y + 34 * s, 22 * s, '#f2c14e');
    this.text(`${lapShown}/${game.laps}`, v.x + pad + 50 * s, v.y + 36 * s, 34 * s);
    this.text(fmtTime(k.finished ? k.finishTime : game.raceTime), v.x + pad, v.y + 64 * s, 20 * s, '#fff6e3');

    // item slot
    const bx = v.x + pad, by = v.y + 76 * s, bs = 70 * s;
    g.fillStyle = 'rgba(255,255,255,.9)'; g.strokeStyle = '#1b1b3a'; g.lineWidth = 5 * s;
    roundRect(g, bx, by, bs, bs, 14 * s); g.fill(); g.stroke();
    let icon = null;
    if (k.rollT > 0) icon = ITEM_KEYS[Math.floor(game.time * 14) % ITEM_KEYS.length];
    else if (k.item) icon = k.item;
    if (icon) {
      const img = game.portraits?.items[icon]?.canvas;
      if (img) g.drawImage(img, bx + 4 * s, by + 4 * s, bs - 8 * s, bs - 8 * s);
      if (k.item && k.itemCount > 1) this.text('x' + k.itemCount, bx + bs - 4 * s, by + bs - 6 * s, 20 * s, '#fff', 'right');
      if (k.item && k.rollT <= 0) {
        g.textBaseline = 'alphabetic';
        this.text(ITEMS[k.item].name, bx + bs + 8 * s, by + bs / 2 + 6 * s, 16 * s, '#fff6e3');
      }
    }
    g.textBaseline = 'alphabetic';

    // position
    if (game.state !== 'countdown') {
      const r = k.rank + 1;
      const col = r === 1 ? '#ffd23a' : r === 2 ? '#e3e8ee' : r === 3 ? '#e59a5a' : '#fff6e3';
      const num = String(r), sx = v.x + v.w - pad - 40 * s, sy = game.humans.length >= 3 ? v.y + 150 * s : v.y + v.h - pad - 4 * s;
      this.text(num, sx, sy, 96 * s, col, 'right', '#1b1b3a', 10 * s);
      this.text(ordinal(r).slice(num.length), sx + 2 * s, sy - 50 * s, 36 * s, col, 'left');
    }

    // speedo
    const mph = game.S?.units === 'mph';
    const sp = Math.max(0, k.speed) * (mph ? 2 : 3.2);
    const spx = v.x + pad, spy = v.y + v.h - pad;
    this.text(Math.round(sp) + '', spx, spy - 14 * s, 34 * s, k.boostT > 0 ? '#ff9a1a' : '#fff');
    this.text(mph ? 'mph' : 'km/h', spx + 64 * s, spy - 14 * s, 16 * s, '#ffd21f');
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(spx, spy - 8 * s, 150 * s, 8 * s);
    g.fillStyle = k.boostT > 0 ? '#ff8a1a' : '#f2c14e'; g.fillRect(spx, spy - 8 * s, 150 * s * Math.min(1, sp / (mph ? 112 : 180)), 8 * s);
    if (k.drifting) {
      const c = k.charge >= 2.2 ? '#ff8a1a' : k.charge >= 1 ? '#4fc3ff' : '#ddd';
      this.text(k.charge >= 2.2 ? 'SUPER DRIFT!' : k.charge >= 1 ? 'DRIFT!' : 'drift…', spx, spy - 56 * s, 20 * s, c);
    }

    // phone status
    if (game.controls[pi] === 'phone') {
      const ph = game.phones.bySlot(pi);
      const gx = v.x + v.w - pad - 26 * s, gy = v.y + (game.humans.length > 1 ? 62 : 34) * s;
      g.save(); g.translate(gx, gy); g.rotate((ph ? ph.inp.steer : 0) * 1.4);
      g.strokeStyle = ph ? '#fff' : '#ff6b5b'; g.lineWidth = 5 * s;
      g.beginPath(); g.arc(0, 0, 18 * s, 0, 7); g.moveTo(-18 * s, 0); g.lineTo(18 * s, 0); g.moveTo(0, 0); g.lineTo(0, 18 * s); g.stroke();
      g.restore();
      if (!ph) this.text('phone disconnected', gx, gy + 40 * s, 14 * s, '#ffb3a8', 'right');
    }

    // centre messages
    const cx = v.x + v.w / 2, cy = v.y + v.h * .38;
    if (game.state === 'countdown') {
      const n = Math.ceil(game.countT);
      if (n <= 3 && n >= 1) {
        const f = game.countT - Math.floor(game.countT);
        this.text(String(n), cx, cy + 40 * s, (120 + f * 60) * s, ['#ffd23a', '#ff9a1a', '#e8483b'][3 - n], 'center', '#1b1b3a', 12 * s);
      }
    } else if (game.raceTime < 1.2 && game.state === 'race') {
      this.text('GO!', cx, cy + 40 * s, 150 * s, '#5fe36b', 'center', '#1b1b3a', 14 * s);
    }
    if (k.msg && k.msgT > 0) {
      g.globalAlpha = Math.min(1, k.msgT * 2);
      this.text(k.msg, cx, cy + (k.finished ? 0 : -10 * s), (k.finished ? 64 : 52) * s, k.msgCol || '#ffd23a', 'center', '#1b1b3a', 9 * s);
      if (k.finished) this.text(ordinal(k.rank + 1) + ' place!', cx, cy + 60 * s, 44 * s, '#fff6e3', 'center');
      g.globalAlpha = 1;
    }
    if (k.wrongT > 1 && !k.finished && Math.floor(game.time * 3) % 2 === 0) this.text('WRONG WAY!', cx, cy + 90 * s, 44 * s, '#ff5a4a', 'center');
    g.restore();
  }

  minimap(game, r, big = false) {
    const g = this.g, tr = game.track;
    if (!this.mm) {
      let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
      for (let i = 0; i < tr.N; i++) { x0 = Math.min(x0, tr.px[i]); x1 = Math.max(x1, tr.px[i]); z0 = Math.min(z0, tr.pz[i]); z1 = Math.max(z1, tr.pz[i]); }
      this.mm = { x0, x1, z0, z1 };
    }
    const { x0, x1, z0, z1 } = this.mm;
    const sc = Math.min(r.w / (x1 - x0), r.h / (z1 - z0)) * .86;
    const ox = r.x + r.w / 2 - (x0 + x1) / 2 * sc, oy = r.y + r.h / 2 - (z0 + z1) / 2 * sc;
    const P = (x, z) => [ox + x * sc, oy + z * sc]; // top-down view: +x right, +z down
    g.save();
    if (big) { g.fillStyle = 'rgba(43,29,20,.75)'; roundRect(g, r.x, r.y, r.w, r.h, 16); g.fill(); }
    g.lineJoin = 'round'; g.lineCap = 'round';
    for (const [w, c] of [[10, 'rgba(43,29,20,.8)'], [6, '#e9d2a6']]) {
      g.strokeStyle = c; g.lineWidth = w * (big ? 1.5 : 1);
      g.beginPath();
      for (let i = 0; i <= tr.N; i += 6) { const [x, y] = P(tr.px[i % tr.N], tr.pz[i % tr.N]); i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.closePath(); g.stroke();
    }
    const [sx, sy] = P(tr.px[0], tr.pz[0]);
    g.fillStyle = '#fff'; g.fillRect(sx - 4, sy - 4, 8, 8);
    const order = [...game.karts].sort((a, b) => (a.isHuman ? 1 : 0) - (b.isHuman ? 1 : 0));
    for (const k of order) {
      const [x, y] = P(k.x, k.z);
      const rr = (k.isHuman ? 7 : 5) * (big ? 1.3 : 1);
      g.fillStyle = k.isHuman ? PLAYER_COLORS[k.player] : '#' + k.ch.kart.toString(16).padStart(6, '0');
      g.strokeStyle = k.isHuman ? '#fff' : '#1b1b3a'; g.lineWidth = 2;
      g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); g.stroke();
    }
    g.restore();
  }
}

function roundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
