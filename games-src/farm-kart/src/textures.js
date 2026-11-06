// All textures are painted procedurally on canvases — no image assets.
import * as THREE from 'three';

let rng = 12345;
export function rand() { rng = (rng * 16807) % 2147483647; return (rng - 1) / 2147483646; }
export function seed(s) { rng = s; }

export function canvasTex(w, h, draw, { repeat = [1, 1], srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function speckle(g, w, h, n, colors, rMin, rMax) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = colors[(rand() * colors.length) | 0];
    const r = rMin + rand() * (rMax - rMin);
    g.beginPath(); g.arc(rand() * w, rand() * h, r, 0, Math.PI * 2); g.fill();
  }
}

/** checkered ground like a freshly mown field */
export function groundTex(a, b, speck = ['#ffffff10', '#00000010']) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = a; g.fillRect(0, 0, w, h);
    g.fillStyle = b; g.fillRect(0, 0, w / 2, h / 2); g.fillRect(w / 2, h / 2, w / 2, h / 2);
    for (let i = 0; i < 900; i++) { g.fillStyle = speck[i % speck.length]; g.fillRect(rand() * w, rand() * h, 2, 4); }
  });
}

/** packed road surface; u across the road, v along it */
export function roadTex({ base, dark, light, pebble = ['#8a8076', '#e8e0d4'] }) {
  return canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 1800, [dark + '55', light + '66'], .8, 2.6);
    for (const cx of [.3, .7]) {
      const grd = g.createLinearGradient(cx * w - 20, 0, cx * w + 20, 0);
      grd.addColorStop(0, dark + '00'); grd.addColorStop(.5, dark + '66'); grd.addColorStop(1, dark + '00');
      g.fillStyle = grd; g.fillRect(cx * w - 20, 0, 40, h);
    }
    speckle(g, w, h, 120, pebble, 1.5, 3);
    const e = g.createLinearGradient(0, 0, w, 0);
    e.addColorStop(0, dark + '88'); e.addColorStop(.06, dark + '00'); e.addColorStop(.94, dark + '00'); e.addColorStop(1, dark + '88');
    g.fillStyle = e; g.fillRect(0, 0, w, h);
  });
}

/** slow/slippery patches on the road */
export function patchTex(type) {
  const P = {
    mud: { body: '#6b4423', spots: ['#4a2e16', '#7e5530'], shine: .35 },
    sand: { body: '#ecc98a', spots: ['#d9b06a', '#f6dca8'], shine: .1 },
    ice: { body: '#bfe8ff', spots: ['#e8f8ff', '#9fd6f5'], shine: .55 },
    leaves: { body: null, spots: ['#ff8a00', '#e8483b', '#ffd21f', '#c4612f'], shine: 0 },
  }[type];
  return canvasTex(256, 256, (g, w, h) => {
    const cx = w / 2, cy = h / 2;
    if (P.body) {
      g.fillStyle = P.body; g.beginPath();
      for (let i = 0; i <= 28; i++) {
        const a = i / 28 * Math.PI * 2, r = w * (.38 + rand() * .09);
        i ? g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      g.closePath(); g.fill();
      g.save(); g.clip();
      speckle(g, w, h, 140, P.spots, 2, 8);
      if (type === 'ice') { g.strokeStyle = '#ffffffaa'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(rand() * w, rand() * h); g.lineTo(rand() * w, rand() * h); g.stroke(); } }
      g.restore();
    } else {
      for (let i = 0; i < 260; i++) {
        const a = rand() * Math.PI * 2, r = rand() ** .6 * w * .44;
        const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        g.fillStyle = P.spots[i % P.spots.length];
        g.save(); g.translate(x, y); g.rotate(rand() * 6);
        g.beginPath(); g.ellipse(0, 0, 9, 5, 0, 0, Math.PI * 2); g.fill();
        g.restore();
      }
    }
    if (P.shine) {
      const sh = g.createRadialGradient(cx - 30, cy - 30, 4, cx - 30, cy - 30, 70);
      sh.addColorStop(0, `rgba(255,255,255,${P.shine})`); sh.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sh; g.fillRect(0, 0, w, h);
    }
  });
}

export function bannerTex(text, bg = '#ff3b30') {
  return canvasTex(1024, 128, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    const s = 16;
    for (let x = 0; x < w / s; x++) for (let y = 0; y < 2; y++) {
      g.fillStyle = (x + y) % 2 ? '#1b1b3a' : '#fff'; g.fillRect(x * s, y * s, s, s); g.fillRect(x * s, h - (y + 1) * s, s, s);
    }
    g.font = '64px "Lilita One", "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineJoin = 'round'; g.fillStyle = '#ffd21f'; g.strokeStyle = '#1b1b3a'; g.lineWidth = 12;
    g.strokeText(text.toUpperCase(), w / 2, h / 2 + 3); g.fillText(text.toUpperCase(), w / 2, h / 2 + 3);
  });
}

export function signTex(text, bg = '#ffd21f') {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#1b1b3a'; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#1b1b3a'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const lines = text.split('\n');
    g.font = `${lines.length > 1 ? 50 : 110}px "Lilita One", "Arial Black", sans-serif`;
    lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * 58));
  });
}

export function makeTextures() {
  const T = {};
  T.checker = canvasTex(128, 32, (g, w, h) => {
    const s = 16;
    for (let x = 0; x < w / s; x++) for (let y = 0; y < h / s; y++) { g.fillStyle = (x + y) % 2 ? '#1b1b3a' : '#fff'; g.fillRect(x * s, y * s, s, s); }
  });
  T.hay = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#f1c24b'; g.fillRect(0, 0, w, h);
    g.lineWidth = 1.3;
    for (let i = 0; i < 600; i++) {
      const x = rand() * w, y = rand() * h, a = (rand() - .5) * .8;
      g.strokeStyle = ['#f9d97a', '#d9a332', '#fbe6a6', '#c99428'][(rand() * 4) | 0];
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10); g.stroke();
    }
  });
  T.boost = canvasTex(128, 256, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#ff8a00'); grd.addColorStop(1, '#ffd21f');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fffbe6';
    for (let k = 0; k < 2; k++) {
      const y0 = k * h / 2 + 20;
      g.beginPath(); g.moveTo(w * .15, y0 + 70); g.lineTo(w * .5, y0); g.lineTo(w * .85, y0 + 70); g.lineTo(w * .85, y0 + 100); g.lineTo(w * .5, y0 + 30); g.lineTo(w * .15, y0 + 100); g.closePath(); g.fill();
    }
    g.strokeStyle = '#1b1b3a'; g.lineWidth = 10; g.strokeRect(0, 0, w, h);
  });
  T.itemBox = canvasTex(128, 128, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, w, h);
    ['#ff4d4d', '#ffd21f', '#3ddc6a', '#2f9bff', '#b56bff'].forEach((c, i) => grd.addColorStop(i / 4, c));
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#fff'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#fff'; g.font = 'bold 92px "Lilita One", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 8; g.strokeStyle = '#1b1b3a'; g.strokeText('?', w / 2, h / 2 + 5); g.fillText('?', w / 2, h / 2 + 5);
  });
  T.chevron = canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ff3b30';
    for (let i = 0; i < 3; i++) {
      const x = 30 + i * 75;
      g.beginPath(); g.moveTo(x, 14); g.lineTo(x + 45, h / 2); g.lineTo(x, h - 14); g.lineTo(x + 22, h - 14); g.lineTo(x + 67, h / 2); g.lineTo(x + 22, 14); g.closePath(); g.fill();
    }
    g.strokeStyle = '#1b1b3a'; g.lineWidth = 10; g.strokeRect(0, 0, w, h);
  });
  T.dot = canvasTex(64, 64, (g, w, h) => {
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(.4, 'rgba(255,255,255,.8)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  }, { srgb: false });
  T.shadow = canvasTex(64, 64, (g, w, h) => {
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(0,0,0,.4)'); grd.addColorStop(.6, 'rgba(0,0,0,.2)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  });
  T.bee = canvasTex(64, 32, (g, w, h) => {
    g.fillStyle = '#ffd21f'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1b1b3a'; for (let x = 6; x < w; x += 16) g.fillRect(x, 0, 7, h);
  });
  T.water = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#3aa8f0'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 3;
    for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(rand() * w, rand() * h, 6 + rand() * 10, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  });
  return T;
}

// ---------------------------------------------------------------- bridges, ramps, signs
/** wooden deck boards running across the road; v runs along the road */
export function plankTex(base = '#b07a45', dark = '#7a4e26') {
  return canvasTex(256, 256, (g, w, h) => {
    const n = 8, bh = h / n;
    for (let i = 0; i < n; i++) {
      const c = new THREE.Color(base).offsetHSL(0, 0, (rand() - .5) * .08);
      g.fillStyle = '#' + c.getHexString(); g.fillRect(0, i * bh, w, bh);
      g.strokeStyle = dark + '55'; g.lineWidth = 1;
      for (let k = 0; k < 6; k++) { const y = i * bh + 3 + rand() * (bh - 6); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * .3, y + 2, w * .6, y - 2, w, y + 1); g.stroke(); }
      g.fillStyle = dark; g.fillRect(0, i * bh, w, 3);
      for (const x of [18, w - 18]) { g.fillStyle = '#3a3a44'; g.beginPath(); g.arc(x, i * bh + bh / 2, 3, 0, 7); g.fill(); }
    }
  });
}
/** rounded cobble stones */
export function cobbleTex(base = '#b9b2a5', dark = '#7d766b') {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = dark; g.fillRect(0, 0, w, h);
    const s = 32;
    for (let y = 0; y < h / s; y++) for (let x = -1; x < w / s + 1; x++) {
      const c = new THREE.Color(base).offsetHSL(0, 0, (rand() - .5) * .12);
      g.fillStyle = '#' + c.getHexString();
      const cx = x * s + (y % 2) * s / 2 + s / 2, cy = y * s + s / 2;
      g.beginPath(); g.ellipse(cx, cy, s * .44, s * .4, rand() * .4, 0, 7); g.fill();
      g.fillStyle = '#ffffff22'; g.beginPath(); g.ellipse(cx - 4, cy - 5, s * .2, s * .12, 0, 0, 7); g.fill();
    }
  });
}
/** jump ramp top: bright planks with chevrons pointing along +v */
export function rampTex(a = '#ffd21f', b = '#ff3b30') {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = a; g.fillRect(0, 0, w, h);
    g.fillStyle = b;
    for (let k = 0; k < 2; k++) {
      const y0 = k * h / 2 + 100;
      g.beginPath(); g.moveTo(w * .1, y0); g.lineTo(w * .5, y0 - 70); g.lineTo(w * .9, y0); g.lineTo(w * .9, y0 + 26); g.lineTo(w * .5, y0 - 44); g.lineTo(w * .1, y0 + 26); g.closePath(); g.fill();
    }
    g.fillStyle = '#1b1b3a'; g.fillRect(0, 0, 10, h); g.fillRect(w - 10, 0, 10, h);
  });
}
/** diagonal hazard stripes */
export function stripeTex(a = '#ffd21f', b = '#1b1b3a', n = 4) {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = a; g.fillRect(0, 0, w, h);
    g.fillStyle = b;
    for (let i = -n; i < n * 2; i++) { const x = i * w / n; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w / n / 2, 0); g.lineTo(x + w / n / 2 + h, h); g.lineTo(x + h, h); g.closePath(); g.fill(); }
  });
}
/** billboard / shop sign with big rounded text */
export function boardTex(text, bg = '#ffd21f', fg = '#1b1b3a', w = 512, h = 256) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = fg; g.lineWidth = 16; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    const lines = text.split('\n'), fs = Math.min(h * .62 / lines.length, w * 1.5 / Math.max(...lines.map(l => l.length)));
    g.font = `${fs}px "Lilita One", "Arial Black", sans-serif`;
    lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * fs * 1.05 + fs * .04));
  });
}
