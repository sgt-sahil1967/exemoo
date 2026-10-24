// SVG artwork for the stadium, rasterised into textures at high resolution.
// Same design language as the Exemoo home page: chunky ink outlines, Lilita One, bright flat colours.
import * as THREE from 'three';

const INK = '#1b1b3a';
const FONT = `font-family="Lilita One, Baloo 2, Arial Black, sans-serif"`;

/** Rasterise an SVG string into a CanvasTexture (fills in when the image has loaded). */
/** `bg`: colour painted under the SVG (for art that doesn't cover the whole canvas). */
export function svgTexture(svg, w, h, { repeat = [1, 1], anisotropy = 8, bg = null } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...repeat);
  const img = new Image();
  img.onload = () => { const g = c.getContext('2d'); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } g.drawImage(img, 0, 0, w, h); tex.needsUpdate = true; };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return tex;
}

// ─────────────────────────────── sponsor boards ───────────────────────────────
const cow = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="6" stroke-linejoin="round">
  <path d="M-34 -30 L-46 -52 L-22 -40Z M34 -30 L46 -52 L22 -40Z" fill="#f3e3b5"/>
  <ellipse cx="0" cy="0" rx="44" ry="42" fill="#fff"/><path d="M-30 -24 q14 -8 22 6 q-4 16 -20 12 q-8 -8 -2 -18z" fill="${INK}"/>
  <ellipse cx="0" cy="22" rx="32" ry="20" fill="#ffa8b8"/><ellipse cx="-11" cy="22" rx="4" ry="6" fill="${INK}"/><ellipse cx="11" cy="22" rx="4" ry="6" fill="${INK}"/>
  <circle cx="-15" cy="-6" r="6" fill="${INK}" stroke="none"/><circle cx="15" cy="-6" r="6" fill="${INK}" stroke="none"/></g>`;

export const BOARDS = [
  { bg: ['#3d8bff', '#1f5fd6'], text: 'EXEMOO', sub: 'MOVE TO PLAY', fg: '#ffd21f', art: cow(110, 64, 0.95) },
  { bg: ['#ffffff', '#e8eef7'], text: 'MOO MOO MILK', sub: 'FRESH FROM THE FARM', fg: '#2f7cff', art: `<g transform="translate(100 64)" stroke="${INK}" stroke-width="6" stroke-linejoin="round"><path d="M-24 -46 h48 v14 l14 22 v66 h-76 v-66 l14 -22z" fill="#fff"/><rect x="-38" y="0" width="76" height="34" fill="#2f7cff"/><circle cx="0" cy="17" r="10" fill="#ffd21f"/></g>` },
  { bg: ['#2fc65a', '#16883a'], text: 'FRUIT SLICE', sub: 'SWING TO SLICE', fg: '#ffffff', art: `<g transform="translate(104 66) rotate(-18)" stroke="${INK}" stroke-width="6"><path d="M-52 0 A52 52 0 0 0 52 0Z" fill="#2fb34a"/><path d="M-40 0 A40 40 0 0 0 40 0Z" fill="#ff4d5e"/><circle cx="-14" cy="14" r="4" fill="${INK}" stroke="none"/><circle cx="8" cy="22" r="4" fill="${INK}" stroke="none"/></g>` },
  { bg: ['#ff3b30', '#c41e12'], text: 'SPINSHOT', sub: 'TABLE TENNIS', fg: '#ffd21f', art: `<g transform="translate(104 64) rotate(-28)" stroke="${INK}" stroke-width="6"><rect x="-9" y="24" width="18" height="44" rx="7" fill="#c98a4a"/><ellipse rx="36" ry="40" fill="#fff"/><circle cx="48" cy="-36" r="12" fill="#ffd21f"/></g>` },
  { bg: ['#ffd21f', '#e8b400'], text: 'BIRDIE GOLF', sub: 'SINK THE PUTT', fg: INK, art: `<g transform="translate(104 70)" stroke="${INK}" stroke-width="6"><ellipse cx="0" cy="34" rx="56" ry="14" fill="#8ff06a"/><path d="M8 34 V-46" fill="none"/><path d="M10 -46 L52 -32 L10 -18Z" fill="#ff3b30"/><circle cx="-26" cy="20" r="11" fill="#fff"/></g>` },
];

export function boardSvg(b) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="128" viewBox="0 0 1024 128">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b.bg[0]}"/><stop offset="1" stop-color="${b.bg[1]}"/></linearGradient>
  <linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  <rect width="1024" height="128" fill="url(#g)"/><rect width="1024" height="64" fill="url(#gl)"/>
  <rect x="3" y="3" width="1018" height="122" fill="none" stroke="${INK}" stroke-width="6"/>
  ${b.art}
  <text x="600" y="74" ${FONT} font-size="76" text-anchor="middle" fill="${b.fg}" stroke="${INK}" stroke-width="8" paint-order="stroke">${b.text}</text>
  <text x="600" y="112" ${FONT} font-size="26" text-anchor="middle" fill="${b.fg}" opacity=".9" letter-spacing="6">${b.sub}</text>
</svg>`;
}

// ─────────────────────────────── stands ───────────────────────────────
/** One tier riser: a row of seat backs over the concrete step face. Tiles horizontally. */
export function seatRowSvg(color) {
  const seats = Array.from({ length: 8 }, (_, i) => {
    const x = 8 + i * 64;
    return `<rect x="${x}" y="14" width="48" height="52" rx="12" fill="${color}" stroke="${INK}" stroke-width="3"/>
      <rect x="${x + 6}" y="20" width="36" height="14" rx="6" fill="#fff" opacity=".28"/>
      <rect x="${x - 2}" y="62" width="52" height="16" rx="5" fill="${shade(color, -0.18)}" stroke="${INK}" stroke-width="3"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="128" viewBox="0 0 512 128">
  <defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f4f8"/><stop offset="1" stop-color="#c9d2dd"/></linearGradient></defs>
  <rect width="512" height="128" fill="url(#c)"/><rect y="80" width="512" height="48" fill="#dfe5ec"/><path d="M0 80 H512" stroke="#aab5c3" stroke-width="3"/>
  ${seats}</svg>`;
}

/** Stand front fascia: club colours, a stripe and the stand name. */
export function fasciaSvg(name, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="128" viewBox="0 0 2048 128">
  <rect width="2048" height="128" fill="${color}"/><rect y="0" width="2048" height="22" fill="#fff" opacity=".25"/>
  <rect y="96" width="2048" height="32" fill="${INK}"/>
  ${Array.from({ length: 2 }, (_, i) => `<text x="${512 + i * 1024}" y="76" ${FONT} font-size="56" text-anchor="middle" fill="#fff" stroke="${INK}" stroke-width="7" paint-order="stroke">${name}</text>`).join('')}
  ${Array.from({ length: 32 }, (_, i) => `<circle cx="${32 + i * 64}" cy="112" r="6" fill="#ffd21f"/>`).join('')}
</svg>`;
}

/** Roof underside: steel trusses. */
export function roofSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="256" viewBox="0 0 512 256">
  <rect width="512" height="256" fill="#f4f6f9"/>
  <g stroke="#9aa7b8" stroke-width="8" fill="none">${Array.from({ length: 4 }, (_, i) => `<path d="M${i * 128} 0 V256"/><path d="M${i * 128} 0 L${i * 128 + 128} 256 M${i * 128 + 128} 0 L${i * 128} 256"/>`).join('')}</g>
  <path d="M0 6 H512 M0 250 H512" stroke="#6f7d90" stroke-width="12"/></svg>`;
}

/** Sightscreen: white panels with a soft frame. */
export function sightscreenSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="512" viewBox="0 0 1024 512">
  <rect width="1024" height="512" fill="#fbfcfe"/>
  ${Array.from({ length: 7 }, (_, i) => `<rect x="${12 + i * 144}" y="12" width="136" height="488" rx="10" fill="#ffffff" stroke="#e1e6ee" stroke-width="6"/>`).join('')}
  <rect x="4" y="4" width="1016" height="504" fill="none" stroke="#c9d1dc" stroke-width="8"/></svg>`;
}

export function flagSvg(colors) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="80" viewBox="0 0 128 80">
  ${colors.map((c, i) => `<rect x="0" y="${(i * 80) / colors.length}" width="128" height="${80 / colors.length + 1}" fill="${c}"/>`).join('')}
  <circle cx="64" cy="40" r="16" fill="#fff" stroke="${INK}" stroke-width="4"/><rect width="128" height="80" fill="none" stroke="${INK}" stroke-width="6"/></svg>`;
}

/** Big screen: drawn live on a canvas (runs/balls/last call), framed by SVG artwork. */
export function scoreboard() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const frame = new Image();
  frame.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="512" viewBox="0 0 1024 512">
    <rect x="6" y="6" width="1012" height="500" rx="36" fill="#1b1b3a" stroke="#ffd21f" stroke-width="12"/>
    <rect x="40" y="110" width="944" height="360" rx="22" fill="#0d1330"/>
    ${cow(92, 58, 0.62)}
    <text x="512" y="80" ${FONT} font-size="64" text-anchor="middle" fill="#ffd21f" stroke="#000" stroke-width="6" paint-order="stroke">EXEMOO CRICKET</text></svg>`);
  let data = { runs: 0, balls: 0, best: 0, call: '' };
  function draw() {
    g.clearRect(0, 0, 1024, 512);
    if (frame.complete) g.drawImage(frame, 0, 0);
    g.textAlign = 'center';
    g.font = '900 54px "Lilita One", sans-serif';
    g.fillStyle = '#9fb4ff';
    g.fillText('RUNS', 230, 190); g.fillText('BALLS', 512, 190); g.fillText('BEST', 794, 190);
    g.font = '900 150px "Lilita One", sans-serif';
    g.fillStyle = '#ffffff';
    g.fillText(String(data.runs), 230, 340); g.fillText(String(data.balls), 512, 340); g.fillStyle = '#ffd21f'; g.fillText(String(data.best), 794, 340);
    if (data.call) { g.font = '900 64px "Lilita One", sans-serif'; g.fillStyle = '#2fc65a'; g.fillText(data.call, 512, 440); }
    tex.needsUpdate = true;
  }
  frame.onload = draw;
  draw();
  return { tex, set(d) { data = { ...data, ...d }; draw(); } };
}

function shade(hex, k) {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, k);
  return '#' + c.getHexString();
}

// ─────────────────────────────── painted crowd ───────────────────────────────
// The crowd is artwork on the stand risers instead of thousands of 3D figures: free to render.
const SHIRTS = ['#ff3b30', '#ffd21f', '#2f7cff', '#ffffff', '#9b4dff', '#2fc65a', '#ff8a00', '#ff5fa8', '#1fb5c9'];
const SKINS = ['#ffd9b0', '#e8b48a', '#c68a5e', '#8d5a3b', '#f2c7a1'];
const HAIRS = ['#3a2516', '#1b1b1b', '#7a4a20', '#d8b25a', '#5a3a28'];
function seeded(seed) { let a = seed; return () => ((a = (a * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** One riser tile (8 seats) with seated fans. `cheer` = arms up and mouths open. */
export function crowdRowSvg(standColor, variant = 0, cheer = false) {
  const r = seeded(17 + variant * 101);
  let fans = '';
  for (let i = 0; i < 8; i++) {
    const x = 32 + i * 64;
    const seat = `<rect x="${x - 24}" y="96" width="48" height="40" rx="10" fill="${standColor}" stroke="${INK}" stroke-width="3"/>`;
    if (r() < 0.12) { fans += seat; continue; }
    const shirt = r() < 0.5 ? standColor : SHIRTS[Math.floor(r() * SHIRTS.length)];
    const skin = SKINS[Math.floor(r() * SKINS.length)], hair = HAIRS[Math.floor(r() * HAIRS.length)];
    const hat = r() < 0.25, scarf = r() < 0.25;
    const bob = cheer ? -8 - r() * 8 : r() * 3;
    const arms = cheer
      ? `<path d="M${x - 16} ${66 + bob} L${x - 26} ${30 + bob}" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M${x - 16} ${66 + bob} L${x - 26} ${30 + bob}" stroke="${shirt}" stroke-width="6" stroke-linecap="round"/>
         <path d="M${x + 16} ${66 + bob} L${x + 26} ${30 + bob}" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M${x + 16} ${66 + bob} L${x + 26} ${30 + bob}" stroke="${shirt}" stroke-width="6" stroke-linecap="round"/>
         <circle cx="${x - 26}" cy="${28 + bob}" r="5" fill="${skin}" stroke="${INK}" stroke-width="2.5"/><circle cx="${x + 26}" cy="${28 + bob}" r="5" fill="${skin}" stroke="${INK}" stroke-width="2.5"/>`
      : '';
    fans += `${seat}
      <path d="M${x - 20} ${120 + bob} q0 -42 20 -42 q20 0 20 42 z" fill="${shirt}" stroke="${INK}" stroke-width="3"/>
      ${scarf ? `<rect x="${x - 14}" y="${78 + bob}" width="28" height="8" rx="3" fill="${standColor === '#ffffff' ? '#ff3b30' : '#ffffff'}" stroke="${INK}" stroke-width="2"/>` : ''}
      ${arms}
      <circle cx="${x}" cy="${62 + bob}" r="15" fill="${skin}" stroke="${INK}" stroke-width="3"/>
      ${hat ? `<path d="M${x - 15} ${58 + bob} a15 13 0 0 1 30 0 z" fill="${SHIRTS[(i + variant) % SHIRTS.length]}" stroke="${INK}" stroke-width="2.5"/>` : `<path d="M${x - 15} ${60 + bob} q2 -16 15 -16 q13 0 15 14 q-9 -5 -18 -3 q-7 1 -12 5z" fill="${hair}"/>`}
      <circle cx="${x - 5}" cy="${62 + bob}" r="2.2" fill="${INK}"/><circle cx="${x + 5}" cy="${62 + bob}" r="2.2" fill="${INK}"/>
      ${cheer ? `<ellipse cx="${x}" cy="${70 + bob}" rx="4" ry="4.5" fill="${INK}"/>` : `<path d="M${x - 4} ${69 + bob} q4 3 8 0" stroke="${INK}" stroke-width="2" fill="none"/>`}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="160" viewBox="0 0 512 160">
  <defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9e0ea"/><stop offset="1" stop-color="#b9c4d2"/></linearGradient></defs>
  <rect width="512" height="160" fill="url(#c)"/>${fans}
  <rect y="136" width="512" height="24" fill="#e6ebf1"/><path d="M0 136 H512" stroke="#9aa7b8" stroke-width="3"/></svg>`;
}

// ─────────────────────────────── player kit ───────────────────────────────
/** Shirt wrapped round the lathe torso: u=0/1 is the chest, u=0.5 the back; v=1 (top) is the collar. */
export function shirtSvg({ color, accent, number = '', name = '', logo = true }) {
  const chest = (x) => `<g transform="translate(${x} 0)">
    <path d="M-70 0 L0 70 L70 0" fill="none" stroke="${accent}" stroke-width="16"/>
    <path d="M-62 0 L0 58 L62 0" fill="none" stroke="#ffffff" stroke-width="5"/>
    ${logo ? `<g transform="translate(-58 128)"><circle r="24" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="-7" cy="-3" r="3.5" fill="${INK}"/><circle cx="7" cy="-3" r="3.5" fill="${INK}"/><ellipse cy="9" rx="11" ry="6" fill="#ffa8b8" stroke="${INK}" stroke-width="2.5"/></g>
    <text x="52" y="138" ${FONT} font-size="34" text-anchor="middle" fill="#fff" stroke="${INK}" stroke-width="5" paint-order="stroke">EXM</text>` : ''}
  </g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="512" viewBox="0 0 1024 512">
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient></defs>
  <rect width="1024" height="512" fill="${color}"/>
  <!-- side panels under the arms -->
  <rect x="200" y="0" width="60" height="512" fill="${accent}" opacity=".85"/><rect x="764" y="0" width="60" height="512" fill="${accent}" opacity=".85"/>
  <path d="M230 0 V512 M794 0 V512" stroke="#fff" stroke-width="4" opacity=".6"/>
  ${chest(0)}${chest(1024)}
  <!-- back: name and number -->
  <text x="512" y="150" ${FONT} font-size="64" text-anchor="middle" fill="#fff" stroke="${INK}" stroke-width="7" paint-order="stroke" letter-spacing="4">${name}</text>
  <text x="512" y="340" ${FONT} font-size="190" text-anchor="middle" fill="#fff" stroke="${INK}" stroke-width="12" paint-order="stroke">${number}</text>
  <!-- hem and fabric shading -->
  <rect y="470" width="1024" height="42" fill="${accent}"/><rect width="1024" height="512" fill="url(#s)"/>
  ${Array.from({ length: 40 }, (_, i) => `<path d="M${i * 26} 0 V512" stroke="#000" stroke-width="1" opacity=".04"/>`).join('')}
</svg>`;
}

/** Cartoon face on the head sphere: u=0.25 faces forward, v=0.5 is the equator. */
export function faceSvg({ skin = '#ffd9b0', hair = '#3a2516', beard = false, brows = '#3a2516' }) {
  // 1024 × 512 equirect; the face centre is at x = 256.
  const cx = 256, cy = 236;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="512" viewBox="0 0 1024 512">
  <rect width="1024" height="512" fill="${skin}"/>
  <!-- hair: back and top of the head -->
  <path d="M0 0 H1024 V150 Q768 230 512 220 Q420 190 400 150 Q300 120 256 120 Q212 120 112 150 Q92 190 0 220Z" fill="${hair}"/>
  <!-- cheeks, eyes, brows, nose, mouth -->
  <ellipse cx="${cx - 70}" cy="${cy + 40}" rx="22" ry="14" fill="#ff8a9a" opacity=".45"/><ellipse cx="${cx + 70}" cy="${cy + 40}" rx="22" ry="14" fill="#ff8a9a" opacity=".45"/>
  ${[-1, 1].map((s) => `<ellipse cx="${cx + s * 42}" cy="${cy}" rx="17" ry="22" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="${cx + s * 42 + 3}" cy="${cy + 3}" r="9" fill="${INK}"/><circle cx="${cx + s * 42 + 6}" cy="${cy - 2}" r="3" fill="#fff"/>
    <path d="M${cx + s * 22} ${cy - 34} q${s * 20} -10 ${s * 40} -2" stroke="${brows}" stroke-width="9" stroke-linecap="round" fill="none"/>`).join('')}
  <path d="M${cx - 4} ${cy + 18} q8 14 0 22" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>
  <path d="M${cx - 30} ${cy + 58} q30 24 60 0" stroke="${INK}" stroke-width="6" fill="#c8384a" stroke-linecap="round"/>
  ${beard ? `<path d="M${cx - 90} ${cy + 30} Q${cx} ${cy + 150} ${cx + 90} ${cy + 30} Q${cx + 40} ${cy + 90} ${cx} ${cy + 92} Q${cx - 40} ${cy + 90} ${cx - 90} ${cy + 30}Z" fill="${hair}" opacity=".85"/>` : ''}
  <!-- ears -->
  <ellipse cx="0" cy="${cy}" rx="22" ry="34" fill="${skin}" stroke="${INK}" stroke-width="3" opacity=".6"/><ellipse cx="512" cy="${cy}" rx="22" ry="34" fill="${skin}" stroke="${INK}" stroke-width="3" opacity=".6"/>
</svg>`;
}

export function padSvg(accent = '#2f7cff') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="512" viewBox="0 0 256 512">
  <rect width="256" height="512" fill="#fbfbf8"/>
  ${[40, 88, 136, 184, 232].map((x) => `<rect x="${x - 16}" y="20" width="32" height="472" rx="16" fill="#ffffff" stroke="#c9ccd4" stroke-width="4"/>`).join('')}
  ${[110, 300, 440].map((y) => `<rect x="0" y="${y}" width="256" height="26" fill="${accent}"/><rect x="104" y="${y - 6}" width="48" height="38" rx="6" fill="#c9ccd4" stroke="${INK}" stroke-width="3"/>`).join('')}
  <path d="M0 6 H256 M0 506 H256" stroke="#c9ccd4" stroke-width="10"/></svg>`;
}

export function gloveSvg(accent = '#2f7cff') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="#ffffff"/>
  ${[0, 1, 2, 3].map((i) => `<rect x="${20 + i * 56}" y="10" width="44" height="150" rx="20" fill="#f4f5f8" stroke="#c9ccd4" stroke-width="4"/>`).join('')}
  <rect y="170" width="256" height="86" fill="${accent}"/><path d="M0 170 H256" stroke="${INK}" stroke-width="5"/>
  <path d="M0 214 H256" stroke="#fff" stroke-width="4" stroke-dasharray="10 8"/></svg>`;
}

/** Helmet / cap shell: u=0.25 front (badge), with a stripe over the top. */
export function helmetSvg(color, accent = '#ffd21f') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="512" viewBox="0 0 1024 512">
  <defs><linearGradient id="h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  <rect width="1024" height="512" fill="${color}"/>
  <rect x="226" y="0" width="60" height="512" fill="${accent}"/><rect x="738" y="0" width="60" height="512" fill="${accent}"/>
  <g transform="translate(256 300)"><path d="M-46 -40 h92 v40 q0 46 -46 62 q-46 -16 -46 -62z" fill="#fff" stroke="${INK}" stroke-width="6"/>
  <circle cx="-14" cy="-6" r="6" fill="${INK}"/><circle cx="14" cy="-6" r="6" fill="${INK}"/><ellipse cy="14" rx="18" ry="10" fill="#ffa8b8" stroke="${INK}" stroke-width="4"/></g>
  <rect width="1024" height="512" fill="url(#h)"/></svg>`;
}
