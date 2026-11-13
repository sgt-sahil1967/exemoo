// Cover art for each game card (inline SVG, 400×220). Moo Moo Farm style: chunky ink outlines,
// bright shaded colours, soft drop shadows and highlights.
import { rapidsRowCover } from '/play/rapids-row/js/cover.js';

const INK = '#1b1b3a';
const S = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
const S3 = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;

/** Shared defs: sky, checker grass, drop shadow, glossy sheen. `id` keeps ids unique per cover. */
const defs = (id, top, bottom, extra = '') => `<defs>
  <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
  <pattern id="${id}c" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="#5fd03a"/><rect width="18" height="18" fill="#4fbd2e"/><rect x="18" y="18" width="18" height="18" fill="#4fbd2e"/></pattern>
  <linearGradient id="${id}gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset="1" stop-color="#1b5e12" stop-opacity=".35"/></linearGradient>
  <radialGradient id="${id}sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff8c4"/><stop offset=".6" stop-color="#ffe066" stop-opacity=".6"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>
  <filter id="${id}d" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="3" flood-color="#000" flood-opacity=".28"/></filter>
  <linearGradient id="${id}gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
  ${extra}
</defs>`;
const sky = (id) => `<rect width="400" height="220" fill="url(#${id}s)"/>
  <circle cx="330" cy="46" r="60" fill="url(#${id}sun)"/>
  <g fill="#fff" opacity=".18">${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M330 46 L${330 + Math.cos(i) * 400} ${46 + Math.sin(i) * 400} L${330 + Math.cos(i + 0.25) * 400} ${46 + Math.sin(i + 0.25) * 400}Z"/>`).join('')}</g>`;
const cloud = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><g fill="#d6eeff" transform="translate(0 4)"><ellipse rx="34" ry="13"/><circle cx="-12" cy="-8" r="13"/><circle cx="12" cy="-10" r="16"/></g><g fill="#fff"><ellipse rx="34" ry="13"/><circle cx="-12" cy="-8" r="13"/><circle cx="12" cy="-10" r="16"/></g></g>`;
const hills = (id, y = 0) => `<g transform="translate(0 ${y})">
  <path d="M0 132 Q70 96 150 122 T300 112 T400 118 V220 H0Z" fill="#8fe86a"/>
  <path d="M0 132 Q70 96 150 122 T300 112 T400 118" fill="none" stroke="#b8f59a" stroke-width="4" opacity=".8"/>
  <path d="M0 168 Q110 140 220 164 T400 158 V220 H0Z" fill="url(#${id}c)" ${S}/>
  <path d="M0 168 Q110 140 220 164 T400 158 V220 H0Z" fill="url(#${id}gs)"/></g>`;
const fence = (y) => `<g ${S3} fill="#fff">${[20, 60, 100].map((x) => `<rect x="${x}" y="${y}" width="8" height="26" rx="2"/>`).join('')}<rect x="14" y="${y + 6}" width="100" height="6" rx="2"/><rect x="14" y="${y + 16}" width="100" height="6" rx="2"/></g>`;
const sparkle = (x, y, c = '#fff', s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -12L3.5 -3.5L12 0L3.5 3.5L0 12L-3.5 3.5L-12 0L-3.5 -3.5Z" fill="${c}" stroke="${INK}" stroke-width="1.5"/>`;
const shadow = (x, y, rx, ry = 6) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#000" opacity=".22"/>`;
const svg = (body) => `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

// A friendly cartoon player. Arms/legs are [x1,y1,x2,y2] segments.
function player({ x, y, shirt, skin = '#ffd9b0', hair = '#5a3a1a', cap, arms, legs, face = 'happy' }) {
  const limb = (seg, c, w) => seg.map(([a, b, c2, d]) => `<path d="M${a} ${b}L${c2} ${d}" stroke="${INK}" stroke-width="${w + 7}"/><path d="M${a} ${b}L${c2} ${d}" stroke="${c}" stroke-width="${w}"/>`).join('');
  return `<g transform="translate(${x} ${y})" stroke-linecap="round" fill="none">
    ${limb(legs, '#2f3e8f', 9)}
    ${limb(arms, skin, 8)}
    <rect x="-17" y="-6" width="34" height="44" rx="14" fill="${shirt}" ${S}/>
    <rect x="-13" y="-2" width="10" height="34" rx="5" fill="#fff" opacity=".25"/>
    <circle cx="0" cy="-24" r="17" fill="${skin}" ${S}/>
    ${cap ? `<path d="M-17 -27 a17 15 0 0 1 34 0 z" fill="${cap}" ${S3}/><path d="M12 -28 h14" stroke="${INK}" stroke-width="7"/><path d="M12 -28 h12" stroke="${cap}" stroke-width="4"/>` : `<path d="M-17 -26 q2 -16 17 -16 q15 0 17 14 q-10 -6 -20 -4 q-8 1 -14 6z" fill="${hair}" ${S3}/>`}
    <circle cx="-6" cy="-24" r="2.6" fill="${INK}"/><circle cx="6" cy="-24" r="2.6" fill="${INK}"/>
    ${face === 'happy' ? `<path d="M-6 -16 q6 6 12 0" stroke="${INK}" stroke-width="3"/>` : `<ellipse cx="0" cy="-15" rx="4" ry="3" fill="${INK}"/>`}
    <circle cx="-11" cy="-18" r="3" fill="#ff8a9a" opacity=".6"/><circle cx="11" cy="-18" r="3" fill="#ff8a9a" opacity=".6"/>
  </g>`;
}

/** A bowling pin for the Moo Bowl cover: base centre at (x, y), s = scale, rot in degrees. */
const bowlPin = (x, y, s = 1, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <path d="M-7 0 C-15 -14 -15 -30 -8 -44 C-5 -51 -5 -55 -7 -61 C-10 -71 -5 -80 0 -80 C5 -80 10 -71 7 -61 C5 -55 5 -51 8 -44 C15 -30 15 -14 7 0Z" fill="#fff" ${S3}/>
  <path d="M-7.6 -49 C-3 -47 3 -47 7.6 -49 M-6.2 -56 C-2 -54.5 2 -54.5 6.2 -56" fill="none" stroke="#ff3b30" stroke-width="3.6" stroke-linecap="round"/>
  <path d="M-8 -34 C-10 -24 -9 -14 -6 -6" fill="none" stroke="#c9d3ea" stroke-width="3.5" stroke-linecap="round"/></g>`;

export const covers = {
  // ───────────── Fruit Slice ─────────────
  fruit: svg(`${defs('f', '#ff7a3c', '#ffd65c', `
    <radialGradient id="fw" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ff7a86"/><stop offset="1" stop-color="#e8243c"/></radialGradient>
    <radialGradient id="fo" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ffd36b"/><stop offset="1" stop-color="#ff8a00"/></radialGradient>
    <radialGradient id="fa" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ff6b5e"/><stop offset="1" stop-color="#c8102e"/></radialGradient>
    <linearGradient id="fb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#bfe8ff" stop-opacity="0"/></linearGradient>`)}
    ${sky('f')}${cloud(70, 38)}${cloud(250, 26, 0.7)}
    <path d="M0 150 L400 150 L400 220 L0 220Z" fill="#a8643a" ${S}/>
    <g stroke="#7a4524" stroke-width="3">${[40, 120, 200, 280, 360].map((x) => `<path d="M${x} 150 L${x - 30} 220"/>`).join('')}</g>
    <path d="M0 156 H400" stroke="#d48a55" stroke-width="4"/>
    ${shadow(150, 168, 70, 8)}${shadow(300, 162, 34)}
    <g filter="url(#fd)">
      <g transform="translate(140 118) rotate(-24)">
        <path d="M-62 0 A62 62 0 0 0 62 0Z" fill="#2fb34a" ${S}/><path d="M-53 0 A53 53 0 0 0 53 0Z" fill="#c8f2b0"/><path d="M-47 0 A47 47 0 0 0 47 0Z" fill="url(#fw)"/>
        <g fill="${INK}">${[[-24, 14], [-6, 26], [14, 22], [28, 10], [2, 10]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="3.5" ry="5.5" transform="rotate(${a} ${a} ${b})"/>`).join('')}</g>
      </g>
      <g transform="translate(176 88) rotate(-24)">
        <path d="M-62 0 A62 62 0 0 1 62 0Z" fill="#2fb34a" ${S}/>
        <g stroke="#1d8a36" stroke-width="5" fill="none"><path d="M-40 -28 Q-34 -12 -40 0"/><path d="M-12 -46 Q-4 -22 -12 0"/><path d="M18 -45 Q26 -22 18 0"/><path d="M44 -24 Q50 -10 44 0"/></g>
        <path d="M-50 -24 Q0 -56 50 -24" fill="none" stroke="#fff" stroke-width="5" opacity=".35"/>
        <path d="M-53 0 H53" stroke="#c8f2b0" stroke-width="5"/>
      </g>
      <circle cx="300" cy="118" r="36" fill="url(#fo)" ${S}/>
      <ellipse cx="288" cy="102" rx="12" ry="8" fill="#fff" opacity=".55"/>
      <path d="M300 82 q4 -14 22 -14 q-6 12 -22 14z" fill="#3fae2e" ${S3}/>
      <circle cx="62" cy="130" r="22" fill="url(#fa)" ${S}/><ellipse cx="54" cy="122" rx="7" ry="5" fill="#fff" opacity=".55"/>
      <path d="M62 108 q-2 -10 8 -16" fill="none" ${S3}/><path d="M66 100 q10 -8 16 2 q-10 4 -16 -2z" fill="#3fae2e" ${S3}/>
    </g>
    <path d="M40 30 L380 170" stroke="url(#fb)" stroke-width="16" stroke-linecap="round" opacity=".85"/>
    <path d="M40 30 L380 170" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    <g fill="#ff4d5e" ${S3}><circle cx="226" cy="64" r="5"/><circle cx="244" cy="80" r="4"/><circle cx="210" cy="54" r="3"/></g>
    ${sparkle(250, 50, '#fff')}${sparkle(110, 186, '#ffe14d', 0.8)}${sparkle(352, 140, '#fff', 0.7)}`),

  // ───────────── Table Tennis ─────────────
  tt: svg(`${defs('t', '#2f8cff', '#aee6ff', `
    <linearGradient id="tt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b86ff"/><stop offset="1" stop-color="#1456c4"/></linearGradient>
    <radialGradient id="tr" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff7a6b"/><stop offset="1" stop-color="#d81f12"/></radialGradient>
    <radialGradient id="tg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#6ff08f"/><stop offset="1" stop-color="#169a3e"/></radialGradient>
    <radialGradient id="tb" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ffd9a0"/></radialGradient>`)}
    ${sky('t')}${cloud(60, 34)}${cloud(220, 22, 0.6)}
    ${hills('t', 10)}${fence(156)}
    ${shadow(200, 200, 160, 8)}
    <g filter="url(#td)">
      <path d="M70 140 L330 140 L368 186 L32 186Z" fill="url(#tt)" ${S}/>
      <path d="M32 186 L368 186 L368 196 L32 196Z" fill="#0d3b8a" ${S3}/>
      <path d="M200 140 V186" stroke="#fff" stroke-width="3"/><path d="M52 163 H348" stroke="#fff" stroke-width="2" opacity=".5"/>
      <path d="M76 142 L324 142" stroke="#fff" stroke-width="3" opacity=".6"/>
      <rect x="44" y="118" width="312" height="24" rx="3" fill="#ffffff" fill-opacity=".55" ${S3}/>
      <g stroke="${INK}" stroke-width="1.2" opacity=".45">${Array.from({ length: 30 }, (_, i) => `<path d="M${54 + i * 10} 118 V142"/>`).join('')}<path d="M44 126 H356 M44 134 H356"/></g>
      <rect x="40" y="114" width="320" height="6" rx="3" fill="#fff" ${S3}/>
      <g transform="translate(104 84) rotate(-32)"><rect x="-9" y="24" width="18" height="46" rx="7" fill="#c98a4a" ${S}/><path d="M-5 30 V64" stroke="#e8b77a" stroke-width="4"/><ellipse rx="38" ry="42" fill="url(#tr)" ${S}/><ellipse cx="-12" cy="-16" rx="12" ry="8" fill="#fff" opacity=".35"/></g>
      <g transform="translate(306 76) rotate(30)"><rect x="-9" y="24" width="18" height="46" rx="7" fill="#c98a4a" ${S}/><path d="M-5 30 V64" stroke="#e8b77a" stroke-width="4"/><ellipse rx="38" ry="42" fill="url(#tg)" ${S}/><ellipse cx="-12" cy="-16" rx="12" ry="8" fill="#fff" opacity=".35"/></g>
    </g>
    <path d="M142 70 Q200 14 248 52" stroke="#fff" stroke-width="5" stroke-dasharray="3 11" fill="none"/>
    <g filter="url(#td)"><circle cx="252" cy="54" r="14" fill="url(#tb)" ${S}/></g>
    <path d="M232 46 l-14 -4 M234 56 l-16 2" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    ${sparkle(276, 34, '#ffd21f')}${sparkle(170, 40, '#fff', 0.6)}`),

  // ───────────── Pose Match ─────────────
  pose: svg(`${defs('p', '#7b3dff', '#ff8ad0', `
    <linearGradient id="pw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".35"/><stop offset="1" stop-color="#ffffff" stop-opacity=".1"/></linearGradient>
    <radialGradient id="pl" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`)}
    <rect width="400" height="220" fill="url(#ps)"/>
    <path d="M90 0 L40 220 L150 220Z" fill="url(#pl)"/><path d="M320 0 L250 220 L370 220Z" fill="url(#pl)"/>
    <path d="M0 170 H400 V220 H0Z" fill="#2a1460" ${S}/>
    <g stroke="#7dfcff" stroke-width="3" opacity=".7">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${200 + (i - 3.5) * 30} 170 L${200 + (i - 3.5) * 90} 220"/>`).join('')}</g>
    <path d="M0 172 H400" stroke="#ff3d8b" stroke-width="4"/>
    <g filter="url(#pd)">
      <rect x="232" y="22" width="140" height="150" rx="16" fill="url(#pw)" stroke="#fff" stroke-width="5"/>
      <rect x="232" y="22" width="140" height="150" rx="16" fill="none" stroke="#7dfcff" stroke-width="3" stroke-dasharray="14 10"/>
      <g fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".9"><circle cx="302" cy="56" r="13"/><path d="M302 72 V118 M302 84 L264 54 M302 84 L340 54 M302 118 L278 160 M302 118 L326 160"/></g>
    </g>
    ${shadow(120, 176, 46)}
    <g filter="url(#pd)">${player({ x: 120, y: 102, shirt: '#ff3b30', arms: [[-14, 2, -48, -34], [14, 2, 48, -34]], legs: [[-8, 36, -26, 72], [8, 36, 26, 72]] })}</g>
    <path d="M176 96 h32 m-12 -12 l12 12 l-12 12" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <g fill="#ffd21f" ${S3} font-family="Lilita One, sans-serif" font-size="22"><text x="246" y="200" stroke-width="5" paint-order="stroke">PERFECT!</text></g>
    ${sparkle(196, 40, '#ffd21f')}${sparkle(60, 40, '#7dfcff', 0.8)}${sparkle(380, 196, '#fff', 0.6)}`),

  // ───────────── Tennis ─────────────
  tennis: svg(`${defs('n', '#ff8a00', '#ffd96b', `
    <linearGradient id="nc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3fd26a"/><stop offset="1" stop-color="#17913b"/></linearGradient>
    <radialGradient id="nb" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#f6ff9a"/><stop offset="1" stop-color="#b8e000"/></radialGradient>`)}
    ${sky('n')}${cloud(80, 36)}${cloud(220, 24, 0.6)}
    ${hills('n', 6)}
    ${shadow(200, 206, 170, 7)}
    <g filter="url(#nd)">
      <path d="M36 204 L118 122 L282 122 L364 204Z" fill="url(#nc)" ${S}/>
      <g stroke="#fff" stroke-width="3.5" fill="none"><path d="M60 196 L130 128 L270 128 L340 196Z"/><path d="M200 128 V196"/><path d="M95 162 H305"/></g>
      <path d="M66 162 V126 H334 V162" fill="none" ${S}/>
      <rect x="66" y="126" width="268" height="36" fill="#fff" fill-opacity=".25"/>
      <g stroke="${INK}" stroke-width="1.3" opacity=".55">${Array.from({ length: 26 }, (_, i) => `<path d="M${76 + i * 10} 126 V162"/>`).join('')}<path d="M66 136 H334 M66 146 H334 M66 154 H334"/></g>
      <rect x="62" y="122" width="276" height="7" rx="3" fill="#fff" ${S3}/>
    </g>
    <g filter="url(#nd)" transform="translate(278 74) rotate(32)">
      <rect x="-9" y="40" width="18" height="56" rx="7" fill="#ff3b30" ${S}/><path d="M-9 70 H9 M-9 80 H9" stroke="${INK}" stroke-width="2"/>
      <ellipse rx="36" ry="46" fill="#fff" fill-opacity=".3" ${S} stroke-width="10"/><ellipse rx="36" ry="46" fill="none" stroke="#ffd21f" stroke-width="5"/>
      <g stroke="#fff" stroke-width="1.8" opacity=".8"><path d="M-33 -18 H33 M-35 -6 H35 M-35 6 H35 M-33 18 H33 M-24 -36 V36 M-12 -43 V43 M0 -46 V46 M12 -43 V43 M24 -36 V36"/></g>
    </g>
    <g filter="url(#nd)"><circle cx="148" cy="64" r="23" fill="url(#nb)" ${S}/><path d="M127 54 Q148 68 169 50 M129 78 Q148 64 171 80" fill="none" stroke="#fff" stroke-width="4"/></g>
    <path d="M118 70 h-34 M122 86 h-46 M118 54 h-24" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    ${sparkle(186, 40, '#fff')}${sparkle(352, 56, '#fff', 0.6)}`),

  // ───────────── Farm Dash ─────────────
  runner: svg(`${defs('r', '#2f9bff', '#c8efff', `
    <linearGradient id="rt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98a4a"/><stop offset="1" stop-color="#e2a866"/></linearGradient>
    <linearGradient id="rbarn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a4a"/><stop offset="1" stop-color="#c41e12"/></linearGradient>
    <radialGradient id="rcoin" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff3a0"/><stop offset="1" stop-color="#f0b400"/></radialGradient>`)}
    ${sky('r')}${cloud(320, 32)}${cloud(70, 46, 0.7)}
    <path d="M0 118 Q90 86 180 108 T400 100 V220 H0Z" fill="#8fe86a"/>
    <g filter="url(#rd)">
      <path d="M40 112 h46 v-28 l-23 -18 l-23 18z" fill="url(#rbarn)" ${S3}/><rect x="54" y="92" width="18" height="20" fill="#fff" ${S3}/>
      <rect x="342" y="74" width="20" height="40" rx="4" fill="#fff" ${S3}/><path d="M340 76 a12 12 0 0 1 24 0z" fill="#ff3b30" ${S3}/>
    </g>
    <path d="M170 104 L230 104 L400 220 L0 220Z" fill="url(#rt)" ${S}/>
    <g stroke="#8a5a2b" stroke-width="7" stroke-linecap="round"><path d="M188 106 L96 220"/><path d="M212 106 L304 220"/></g>
    <g stroke="#5e3a1a" stroke-width="5">${[118, 134, 154, 180, 212].map((y, i) => `<path d="M${200 - 20 - i * 22} ${y} H${200 + 20 + i * 22}"/>`).join('')}</g>
    <g filter="url(#rd)">
      <rect x="262" y="70" width="84" height="66" rx="10" fill="url(#rbarn)" ${S}/>
      <rect x="262" y="70" width="84" height="14" rx="6" fill="#fff" opacity=".3"/>
      <rect x="274" y="90" width="24" height="20" rx="4" fill="#bfe8ff" ${S3}/><rect x="310" y="90" width="24" height="20" rx="4" fill="#bfe8ff" ${S3}/>
      <rect x="284" y="116" width="40" height="10" rx="3" fill="#ffd21f" ${S3}/>
      <circle cx="282" cy="140" r="9" fill="${INK}"/><circle cx="326" cy="140" r="9" fill="${INK}"/>
    </g>
    ${shadow(190, 182, 30)}
    <g filter="url(#rd)">${player({ x: 190, y: 112, shirt: '#ffd21f', cap: '#2f7cff', arms: [[-12, 4, -40, 22], [12, 4, 34, -18]], legs: [[-6, 36, -30, 64], [6, 36, 28, 58]] })}</g>
    <g filter="url(#rd)">${[[110, 128], [92, 150], [74, 176]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="url(#rcoin)" ${S3}/><path d="M${x} ${y - 5} v10" stroke="#c48a00" stroke-width="3"/>`).join('')}</g>
    <path d="M150 116 h-26 M154 132 h-34" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    ${sparkle(130, 104, '#fff', 0.8)}${sparkle(240, 52, '#ffd21f', 0.7)}`),

  // ───────────── Golf ─────────────
  golf: svg(`${defs('g', '#4fb8ff', '#e6f7ff', `
    <radialGradient id="gg" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#a6f57f"/><stop offset="1" stop-color="#5fd03a"/></radialGradient>
    <linearGradient id="gf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff6b5e"/><stop offset="1" stop-color="#d81f12"/></linearGradient>
    <radialGradient id="gb" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#cfd6e6"/></radialGradient>
    <linearGradient id="gs2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef2f8"/><stop offset="1" stop-color="#8a94a8"/></linearGradient>`)}
    ${sky('g')}${cloud(90, 36)}${cloud(220, 26, 0.7)}
    <path d="M0 118 Q90 84 190 106 T400 96 V220 H0Z" fill="#8fe86a"/>
    <g filter="url(#gd)">${[[30, 104, 14], [56, 98, 18], [372, 92, 16]].map(([x, y, r]) => `<rect x="${x - 3}" y="${y}" width="6" height="14" fill="#8a5a2b"/><circle cx="${x}" cy="${y - r * 0.6}" r="${r}" fill="#3fae2e" ${S3}/>`).join('')}</g>
    <path d="M0 140 Q120 110 220 132 T400 124 V220 H0Z" fill="url(#gc)" ${S}/>
    <ellipse cx="96" cy="186" rx="46" ry="11" fill="#f3e3b5" ${S3}/>
    <g filter="url(#gd)"><ellipse cx="290" cy="150" rx="86" ry="24" fill="url(#gg)" ${S}/></g>
    <ellipse cx="300" cy="150" rx="15" ry="5.5" fill="${INK}"/>
    <path d="M300 150 V54" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M300 150 V54" stroke="#fff" stroke-width="3"/>
    <g filter="url(#gd)"><path d="M302 56 Q330 60 352 72 Q330 82 302 90Z" fill="url(#gf)" ${S}/></g>
    <path d="M150 110 Q222 40 296 142" stroke="#fff" stroke-width="5" stroke-dasharray="3 11" fill="none"/>
    ${shadow(146, 136, 16, 4)}
    <g filter="url(#gd)"><circle cx="146" cy="120" r="14" fill="url(#gb)" ${S}/><g fill="#b8c0d0">${[[141, 115], [150, 118], [145, 125], [152, 126]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2"/>`).join('')}</g></g>
    <g filter="url(#gd)">
      <path d="M66 50 L122 164" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M66 50 L122 164" stroke="url(#gs2)" stroke-width="6" stroke-linecap="round"/>
      <path d="M58 36 L72 62" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M58 36 L72 62" stroke="#2f2f45" stroke-width="10" stroke-linecap="round"/>
      <path d="M108 158 L146 168 L140 186 L102 176Z" fill="url(#gs2)" ${S}/>
    </g>
    ${sparkle(224, 58, '#ffd21f')}${sparkle(360, 40, '#fff', 0.6)}`),

  // ───────────── Cricket ─────────────
  cricket: svg(`${defs('k', '#16a085', '#8ff0cc', `
    <linearGradient id="kb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f7d98e"/><stop offset="1" stop-color="#c99a4a"/></linearGradient>
    <radialGradient id="kr" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ff6b5e"/><stop offset="1" stop-color="#a8140c"/></radialGradient>
    <linearGradient id="kp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dca0"/><stop offset="1" stop-color="#dcb56a"/></linearGradient>`)}
    ${sky('k')}${cloud(300, 32)}${cloud(80, 26, 0.6)}
    <g>${Array.from({ length: 22 }, (_, i) => `<rect x="${i * 19}" y="${96 + (i % 3) * 3}" width="16" height="${18 - (i % 3) * 3}" rx="3" fill="${['#ff3b30', '#ffd21f', '#2f7cff', '#fff', '#9b4dff'][i % 5]}" stroke="${INK}" stroke-width="2"/>`).join('')}</g>
    ${hills('k', 0)}
    <path d="M150 140 L250 140 L282 220 L118 220Z" fill="url(#kp)" ${S}/>
    <path d="M140 196 H260" stroke="#fff" stroke-width="4"/>
    ${shadow(300, 168, 34)}
    <g filter="url(#kd)" ${S3}>
      ${[284, 300, 316].map((x) => `<rect x="${x - 5}" y="80" width="10" height="86" rx="4" fill="#f3e3b5"/><rect x="${x - 3}" y="84" width="3" height="76" fill="#fff" stroke="none" opacity=".6"/>`).join('')}
      <rect x="276" y="72" width="22" height="8" rx="3" fill="#c98a4a"/><rect x="302" y="72" width="22" height="8" rx="3" fill="#c98a4a"/>
    </g>
    <g filter="url(#kd)" transform="translate(118 104) rotate(-42)">
      <rect x="-8" y="-84" width="16" height="44" rx="6" fill="#2f2f45" ${S}/><path d="M-8 -76 H8 M-8 -66 H8 M-8 -56 H8" stroke="#ff3b30" stroke-width="3"/>
      <path d="M-22 -42 H22 V58 Q0 72 -22 58Z" fill="url(#kb)" ${S}/>
      <path d="M0 -34 V58" stroke="#b88a3a" stroke-width="4"/><path d="M-14 -36 V50" stroke="#fff" stroke-width="4" opacity=".45"/>
    </g>
    <path d="M174 70 Q196 64 214 70" stroke="#fff" stroke-width="5" stroke-dasharray="3 10" fill="none"/>
    <g filter="url(#kd)"><circle cx="226" cy="66" r="17" fill="url(#kr)" ${S}/><path d="M212 58 Q226 70 240 58" stroke="#fff" stroke-width="2.5" fill="none" stroke-dasharray="3 3"/><ellipse cx="220" cy="58" rx="5" ry="3" fill="#fff" opacity=".5"/></g>
    <path d="M196 84 h-32 M200 100 h-42" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    <g font-family="Lilita One, sans-serif" font-size="30" fill="#ffd21f" stroke="${INK}" stroke-width="6" paint-order="stroke"><text x="300" y="54" transform="rotate(-8 300 54)">SIX!</text></g>
    ${sparkle(262, 34, '#ffd21f')}${sparkle(40, 60, '#fff', 0.6)}`),
  // ───────────── Farm Kart ─────────────
  kart: svg(`${defs('fk', '#ff9a3c', '#ffe08a', `
    <linearGradient id="fkt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98a4a"/><stop offset="1" stop-color="#e8b070"/></linearGradient>
    <linearGradient id="fkb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6a5a"/><stop offset="1" stop-color="#c41e12"/></linearGradient>
    <radialGradient id="fkq" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9fd0ff"/><stop offset="1" stop-color="#2f7cff"/></radialGradient>`)}
    ${sky('fk')}${cloud(80, 34, 0.8)}${cloud(230, 24, 0.6)}
    <path d="M0 112 Q100 82 200 102 T400 94 V220 H0Z" fill="#8fe86a"/>
    <g filter="url(#fkd)">
      <path d="M338 104 h52 v-32 l-26 -20 l-26 20z" fill="url(#fkb)" ${S3}/><path d="M354 104 v-16 h20 v16" fill="#fff" ${S3}/><path d="M346 74 l36 0" stroke="#fff" stroke-width="3" opacity=".6"/>
    </g>
    <path d="M0 150 Q120 118 240 128 T400 118 V220 H0Z" fill="url(#fkc)" ${S}/>
    <path d="M-10 214 Q90 150 210 156 T420 128 L420 160 Q300 168 230 188 T40 236Z" fill="url(#fkt)" ${S}/>
    <path d="M30 222 Q120 170 214 172 T410 144" stroke="#fff" stroke-width="5" stroke-dasharray="14 12" fill="none" opacity=".8"/>
    <g ${S3}>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${236 + i * 20}" y="${150 - i * 3.2}" width="20" height="8" fill="${i % 2 ? '#fff' : '#ff3b30'}"/>`).join('')}</g>
    <g filter="url(#fkd)">
      <path d="M288 140 V52" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      <g transform="translate(290 54)"><path d="M0 0 Q20 -6 44 2 V34 Q20 26 0 32Z" fill="#fff" ${S3}/>${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => ((r + c) % 2 ? '' : `<rect x="${3 + c * 13}" y="${2 + r * 7.5}" width="12" height="7" fill="${INK}"/>`)).join('')).join('')}</g>
    </g>
    <g filter="url(#fkd)" transform="translate(238 74) rotate(-8)">
      <rect x="-18" y="-18" width="36" height="36" rx="8" fill="url(#fkq)" ${S}/><rect x="-14" y="-14" width="28" height="10" rx="4" fill="#fff" opacity=".35"/>
      <text x="0" y="11" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="30" fill="#ffd21f" stroke="${INK}" stroke-width="5" paint-order="stroke">?</text>
    </g>
    <g fill="#fff" ${S3} opacity=".95">${[[58, 176, 13], [36, 168, 9], [76, 160, 8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
    ${shadow(158, 192, 66, 8)}
    <g filter="url(#fkd)">
      <circle cx="108" cy="178" r="17" fill="#2f2f45" ${S}/><circle cx="108" cy="178" r="6" fill="#ffd21f" ${S3}/>
      <path d="M86 170 Q88 140 118 136 L196 134 Q222 136 224 160 L222 176 L94 180Z" fill="url(#fkb)" ${S}/>
      <path d="M100 150 Q106 142 122 142 L190 141" stroke="#fff" stroke-width="5" opacity=".45" fill="none"/>
      <rect x="194" y="150" width="34" height="14" rx="5" fill="#ffd21f" ${S3}/>
      <circle cx="206" cy="180" r="17" fill="#2f2f45" ${S}/><circle cx="206" cy="180" r="6" fill="#ffd21f" ${S3}/>
      <rect x="84" y="126" width="14" height="22" rx="4" fill="#ff3b30" ${S3}/>
      <g transform="translate(150 106)">
        <path d="M-22 26 Q-22 4 0 2 Q22 4 22 26Z" fill="#2fc65a" ${S3}/>
        <ellipse cx="0" cy="-16" rx="22" ry="19" fill="#fff" ${S}/>
        <path d="M-14 -30 q8 2 8 12 q-10 2 -14 -6z" fill="${INK}"/><path d="M8 -10 q8 -4 12 4 q-6 8 -14 4z" fill="${INK}"/>
        <path d="M-20 -30 l-12 -8 M20 -30 l12 -8" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M-20 -30 l-12 -8 M20 -30 l12 -8" stroke="#f3e3b5" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="0" cy="-4" rx="16" ry="10" fill="#ffb3c0" ${S3}/><circle cx="-6" cy="-4" r="2.4" fill="${INK}"/><circle cx="6" cy="-4" r="2.4" fill="${INK}"/>
        <circle cx="-9" cy="-20" r="3" fill="${INK}"/><circle cx="9" cy="-20" r="3" fill="${INK}"/>
        <path d="M-20 -26 Q0 -44 20 -26" stroke="${INK}" stroke-width="7" fill="none"/><path d="M-20 -26 Q0 -44 20 -26" stroke="#2f7cff" stroke-width="3" fill="none"/>
      </g>
      <path d="M170 136 l14 -10" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><circle cx="186" cy="124" r="7" fill="none" stroke="${INK}" stroke-width="5"/>
    </g>
    <path d="M70 140 h-30 M78 124 h-44 M64 108 h-22" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    <g filter="url(#fkd)" transform="translate(60 62) rotate(30)"><path d="M0 -20 Q7 0 0 22 Q-7 0 0 -20Z" fill="#ff8a00" ${S3}/><path d="M0 -20 l-6 -10 M0 -20 l6 -10 M0 -20 v-12" stroke="#2fc65a" stroke-width="4" stroke-linecap="round"/></g>
    ${sparkle(204, 40, '#ffd21f')}${sparkle(390, 30, '#fff', 0.6)}${sparkle(112, 92, '#fff', 0.7)}`),
  // ───────────── Rapids Row (art lives with the game) ─────────────
  rapids: rapidsRowCover(),
  // ───────────── Shake & Freeze (party) ─────────────
  shake: svg(`${defs('sf', '#ff8fb1', '#ffe0ec', `
    <linearGradient id="sfm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb3cb"/><stop offset="1" stop-color="#ff6f9c"/></linearGradient>`)}
    ${sky('sf')}${cloud(80, 34, 0.8)}${hills('sf', 6)}
    <g filter="url(#sfd)">
      <path d="M118 30 h164 v26 h-164z" fill="#fff" ${S3}/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${118 + i * 20.5} 56 h20.5 v8 a10.25 10.25 0 0 1 -20.5 0z" fill="${i % 2 ? '#fff' : '#ff5c8a'}" ${S3}/>`).join('')}
      <rect x="34" y="64" width="12" height="104" rx="4" fill="#8a8fb0" ${S3}/>
      <rect x="20" y="40" width="40" height="66" rx="12" fill="#3a3d5c" ${S}/>
      <circle cx="40" cy="58" r="11" fill="#ff3b30" ${S3}/><circle cx="36" cy="54" r="3.5" fill="#fff" opacity=".7"/>
      <circle cx="40" cy="88" r="11" fill="#1d6b35" ${S3}/>
      <path d="M170 92 h62 l-10 104 h-42z" fill="#d9f1ff" ${S}/>
      <path d="M174 124 h54 l-7 72 h-40z" fill="url(#sfm)"/>
      <path d="M170 92 h62 l-10 104 h-42z" fill="none" ${S}/>
      <circle cx="184" cy="88" r="14" fill="#fff" ${S3}/><circle cx="218" cy="88" r="14" fill="#fff" ${S3}/><circle cx="201" cy="76" r="16" fill="#fff" ${S3}/>
      <circle cx="202" cy="56" r="9" fill="#ff3b30" ${S3}/><path d="M202 48 q4 -12 14 -14" fill="none" ${S3}/>
      <path d="M216 120 L244 48" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M216 120 L244 48" stroke="#ff3b30" stroke-width="5" stroke-linecap="round"/>
      <rect x="180" y="120" width="8" height="60" rx="4" fill="#fff" opacity=".5"/>
      <g transform="translate(316 118) rotate(14)">
        <path d="M-22 -40 h44 l-8 80 h-28z" fill="#d9f1ff" ${S}/>
        <rect x="-26" y="-54" width="52" height="16" rx="6" fill="#2f7cff" ${S3}/>
        <rect x="-14" y="-30" width="6" height="50" rx="3" fill="#fff" opacity=".6"/>
      </g>
      <g ${S3} fill="none"><path d="M266 92 l-14 -6 M264 120 l-16 0 M268 148 l-14 6 M370 86 l14 -6 M372 116 l16 0 M368 146 l14 8"/></g>
      <g fill="#ff8fb1" ${S3}><circle cx="290" cy="58" r="6"/><circle cx="350" cy="50" r="5"/><circle cx="330" cy="36" r="4"/></g>
    </g>
    ${sparkle(150, 70, '#fff')}${sparkle(258, 30, '#ffd21f', 0.8)}`),
  // ───────────── Wobble Tower (party) ─────────────
  wobble: svg(`${defs('wt', '#5ec2ff', '#c9f0ff')}
    ${sky('wt')}${cloud(300, 40, 0.9)}${cloud(70, 60, 0.6)}${hills('wt', 4)}
    <g stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".8"><path d="M20 60 h60 M10 96 h44 M330 120 h56 M340 84 h40"/></g>
    ${shadow(200, 202, 80, 8)}
    <g filter="url(#wtd)">
      <path d="M150 172 Q160 150 172 162 L190 196 h-34z" fill="#ffb3c4" ${S}/>
      <path d="M250 172 Q240 150 228 162 L210 196 h34z" fill="#ffb3c4" ${S}/>
      <g transform="rotate(-6 200 168)">
        <rect x="128" y="160" width="144" height="12" rx="6" fill="#c9d3e8" ${S3}/>
        ${[0, 1, 2, 3, 4].map((i) => {
          const x = 200 + i * i * 1.6 + i * 2, y = 140 - i * 24;
          return `<path d="M${x} ${y - 16} C${x + 15} ${y - 16} ${x + 14} ${y + 12} ${x} ${y + 12} C${x - 14} ${y + 12} ${x - 15} ${y - 16} ${x} ${y - 16}Z" fill="${i % 2 ? '#ffe9c4' : '#fff6e0'}" ${S3}/><ellipse cx="${x - 4}" cy="${y - 6}" rx="3" ry="4" fill="#fff"/>`;
        }).join('')}
      </g>
      <g transform="translate(228 14)">
        <ellipse cx="0" cy="12" rx="20" ry="14" fill="#fff" ${S3}/><circle cx="14" cy="-2" r="9" fill="#fff" ${S3}/>
        <circle cx="12" cy="-12" r="3.5" fill="#ff3b30"/><circle cx="17" cy="-12" r="3.5" fill="#ff3b30"/>
        <path d="M22 -4 l8 3 l-8 3z" fill="#ff9a1f" ${S3}/><circle cx="16" cy="-3" r="1.8" fill="${INK}"/>
      </g>
      <g transform="translate(330 172)"><path d="M-30 -24 h60 l-8 32 h-44z" fill="#d48a3a" ${S}/><ellipse cx="-10" cy="-30" rx="9" ry="11" fill="#fff6e0" ${S3}/><ellipse cx="8" cy="-32" rx="9" ry="11" fill="#fff6e0" ${S3}/></g>
    </g>
    <g fill="#ff3b30" stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="M96 70 l-16 10 l16 10z"/><path d="M300 30 l16 10 l-16 10z"/></g>
    ${sparkle(118, 120, '#ffd21f')}${sparkle(290, 96, '#fff', 0.7)}`),
  // ───────────── Flapjack Flip (party) ─────────────
  flapjack: svg(`<defs><filter id="fjd" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="3" flood-color="#000" flood-opacity=".28"/></filter>
    <pattern id="fjt" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#e6f6ff"/><rect width="20" height="20" fill="#bfe8ff"/><rect x="20" y="20" width="20" height="20" fill="#bfe8ff"/></pattern></defs>
    <rect width="400" height="220" fill="url(#fjt)"/>
    <rect x="-5" y="168" width="410" height="16" rx="6" fill="#fff" ${S}/><rect x="0" y="184" width="400" height="40" fill="#2f7cff"/>
    <path d="M0 184 H400" ${S}/>
    <g filter="url(#fjd)">
      <path d="M60 52 a90 90 0 0 1 150 -10" fill="none" stroke="${INK}" stroke-width="4" stroke-dasharray="10 9" stroke-linecap="round"/>
      <g transform="translate(150 54) rotate(-28)"><ellipse rx="40" ry="16" fill="#d98a2b" ${S3}/><ellipse cy="-4" rx="40" ry="12" fill="#ffc95c" ${S3}/></g>
      <g transform="translate(232 98) rotate(40)"><ellipse rx="34" ry="8" fill="#f2a640" ${S3}/></g>
      <path d="M212 46 l12 -4 l-4 12" fill="none" ${S3}/>
      <g transform="translate(110 158) rotate(-14)">
        <path d="M30 0 L104 6" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M30 0 L104 6" stroke="#3a3350" stroke-width="9" stroke-linecap="round"/>
        <ellipse cx="0" cy="0" rx="52" ry="15" fill="#3a3d5c" ${S}/><ellipse cx="0" cy="-3" rx="42" ry="9" fill="#55597a"/>
      </g>
      <g transform="translate(320 160)">
        <ellipse cx="0" cy="10" rx="48" ry="11" fill="#fff" ${S3}/>
        ${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="0" cy="${2 - i * 10}" rx="38" ry="9" fill="${i % 2 ? '#f2a640' : '#ffc95c'}" ${S3}/>`).join('')}
        <rect x="-12" y="-50" width="24" height="9" rx="3" fill="#fff3a0" ${S3}/>
        <path d="M-30 -40 q-6 18 0 28 q4 -12 8 -20z" fill="#a8541c" ${S3}/>
      </g>
      <g transform="translate(330 50)"><rect x="-58" y="-26" width="116" height="52" rx="8" fill="#fffbe8" ${S}/>
        <rect x="-44" y="-12" width="22" height="22" rx="5" fill="#ffd21f" ${S3}/><rect x="-12" y="-12" width="22" height="22" rx="5" fill="#ffd21f" ${S3}/><rect x="20" y="-12" width="22" height="22" rx="5" fill="#fff" ${S3}/></g>
    </g>
    <g stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".9"><path d="M96 132 q6 -10 0 -20 M112 128 q6 -10 0 -20"/></g>
    ${sparkle(70, 100, '#ffd21f')}${sparkle(258, 136, '#fff', 0.7)}`),
  // ───────────── Peek-a-Barn (party memory) ─────────────
  peek: svg(`${defs('pb', '#5ec2ff', '#c9f0ff')}
    ${sky('pb')}${cloud(64, 40, 0.8)}${cloud(338, 84, 0.55)}${hills('pb', 6)}
    ${shadow(200, 206, 124, 8)}
    <g filter="url(#pbd)">
      <path d="M84 206 V84 L200 24 L316 84 V206Z" fill="#ff3b30" ${S}/>
      <g stroke="#c8402f" stroke-width="3" opacity=".6">${[108, 132, 156, 180, 204, 228, 252, 276].map((x) => `<path d="M${x} ${x < 200 ? 84 - (x - 84) * 0.5 : 84 - (316 - x) * 0.5} V204"/>`).join('')}</g>
      <path d="M72 90 L200 18 L328 90" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M72 90 L200 18 L328 90" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="200" cy="60" r="13" fill="#ffd21f" ${S3}/><path d="M187 60 h26 M200 47 v26" stroke="${INK}" stroke-width="3"/>
      ${[0, 1, 2, 3].flatMap((c) => [0, 1].map((r) => {
        const x = 108 + c * 48, y = 88 + r * 58;
        const open = (c === 1 && r === 0) || (c === 3 && r === 1);
        const gold = c === 0 && r === 1;
        if (open || gold) {
          return `<rect x="${x}" y="${y}" width="40" height="52" rx="7" fill="${gold ? '#ffd21f' : '#fff6e0'}" ${S3}/>
            ${gold ? `<path d="M${x + 20} ${y + 12} q-12 2 -13 22 h26 q-1 -20 -13 -22z" fill="#ffe27a" ${S3}/><circle cx="${x + 20}" cy="${y + 38}" r="3.5" fill="#e0a800" ${S3}/>`
              : `<g transform="translate(${x + 20} ${y + 28}) scale(.36)"><path d="M0 -24 C22 -38 46 -18 40 10 C36 36 16 44 0 36 C-16 44 -36 36 -40 10 C-46 -18 -22 -38 0 -24Z" fill="#ff3b30" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/><path d="M0 -24 L5 -42" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><ellipse cx="16" cy="-38" rx="13" ry="6" transform="rotate(-28 16 -38)" fill="#2fc65a" stroke="${INK}" stroke-width="7"/><ellipse cx="-20" cy="-6" rx="7" ry="12" fill="#fff" opacity=".6"/></g>`}`;
        }
        return `<rect x="${x}" y="${y}" width="40" height="52" rx="7" fill="#ff3b30" ${S3}/>
          <rect x="${x + 5}" y="${y + 5}" width="30" height="42" rx="4" fill="none" stroke="#fff" stroke-width="3.5"/>
          <path d="M${x + 7} ${y + 7} L${x + 33} ${y + 45} M${x + 33} ${y + 7} L${x + 7} ${y + 45}" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`;
      }).join('')).join('')}
      <rect x="199" y="83" width="50" height="62" rx="10" fill="none" stroke="${INK}" stroke-width="9"/>
      <rect x="199" y="83" width="50" height="62" rx="10" fill="none" stroke="#2f7cff" stroke-width="4.5"/>
      <rect x="211" y="72" width="26" height="16" rx="6" fill="#2f7cff" ${S3}/>
      <g transform="translate(352 176)">
        <ellipse cx="0" cy="8" rx="24" ry="20" fill="#ffe45c" ${S}/>
        <circle cx="4" cy="-18" r="15" fill="#ffe45c" ${S}/>
        <circle cx="9" cy="-21" r="3" fill="${INK}"/><circle cx="10" cy="-22" r="1" fill="#fff"/>
        <path d="M17 -16 l10 3 l-10 4z" fill="#ff9a1f" ${S3}/>
        <path d="M-8 4 q-10 -2 -14 -12" fill="none" ${S3}/>
        <path d="M-16 24 q16 6 32 0" fill="none" stroke="#2fc65a" stroke-width="6" stroke-linecap="round"/>
      </g>
    </g>
    ${sparkle(146, 54, '#ffd21f', 0.8)}${sparkle(290, 136, '#fff', 0.7)}${sparkle(116, 138, '#fff', 0.6)}`),
  // ───────────── Straw Shot (party) ─────────────
  straw: svg(`${defs('ss', '#5ec2ff', '#c9f0ff', `
    <radialGradient id="ssb" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#e0a83c"/></radialGradient>`)}
    ${sky('ss')}${cloud(70, 40, 0.8)}${cloud(250, 30, 0.6)}${hills('ss', 6)}
    <g filter="url(#ssd)">
      <path d="M210 150 L196 196 M270 150 L284 196" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
      <path d="M210 150 L196 196 M270 150 L284 196" stroke="#c07a35" stroke-width="6" stroke-linecap="round"/>
      ${shadow(240, 198, 56, 7)}
      <circle cx="240" cy="108" r="66" fill="url(#ssb)" ${S}/>
      <g stroke="#d9a640" stroke-width="3">${Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return `<path d="M${240 + Math.cos(a) * 52} ${108 + Math.sin(a) * 52} L${240 + Math.cos(a + 0.08) * 63} ${108 + Math.sin(a + 0.08) * 63}"/>`; }).join('')}</g>
      <circle cx="240" cy="108" r="50" fill="#fff" ${S3}/>
      <circle cx="240" cy="108" r="40" fill="#2fc65a" ${S3}/>
      <circle cx="240" cy="108" r="30" fill="#2f7cff" ${S3}/>
      <circle cx="240" cy="108" r="20" fill="#ff3b30" ${S3}/>
      <circle cx="240" cy="108" r="10" fill="#ffd21f" ${S3}/>
      <ellipse cx="218" cy="80" rx="12" ry="6" fill="#fff" opacity=".5"/>
      ${[[244, 104, '#ff3b30', -0.5], [228, 124, '#2f7cff', -0.3], [262, 90, '#ffd21f', -0.6]].map(([x, y, c, r]) => `<g transform="translate(${x} ${y}) rotate(${r * 57})">
        <path d="M0 0 L0 30" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M0 0 L0 30" stroke="#a8642a" stroke-width="3"/>
        <path d="M0 26 l-8 10 l8 -3 l8 3z" fill="${c}" ${S3}/></g>`).join('')}
      <g transform="translate(92 150) rotate(-38)">
        <path d="M-58 8 L0 34 L58 8" fill="none" stroke="${INK}" stroke-width="3"/>
        <path d="M-58 8 Q-30 -26 0 -26 Q30 -26 58 8" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
        <path d="M-58 8 Q-30 -26 0 -26 Q30 -26 58 8" fill="none" stroke="#d48a3a" stroke-width="9" stroke-linecap="round"/>
        <rect x="-9" y="-33" width="18" height="14" rx="4" fill="#2fc65a" ${S3}/>
        <path d="M0 34 L0 -54" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M0 34 L0 -54" stroke="#c98a45" stroke-width="4"/>
        <path d="M0 -68 l-9 16 h18z" fill="#cfd6e6" ${S3}/>
        <path d="M0 30 l-10 8 v-14 l10 -8z M0 30 l10 8 v-14 l-10 -8z" fill="#ff3b30" ${S3}/>
      </g>
      <g fill="none" stroke-linecap="round">
        <circle cx="330" cy="150" r="17" stroke="${INK}" stroke-width="9"/><circle cx="330" cy="150" r="17" stroke="#2f7cff" stroke-width="4.5"/>
        <path d="M330 126 v12 M330 162 v12 M306 150 h12 M342 150 h12" stroke="${INK}" stroke-width="9"/><path d="M330 126 v12 M330 162 v12 M306 150 h12 M342 150 h12" stroke="#2f7cff" stroke-width="4.5"/>
      </g>
      <path d="M352 30 V96" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M354 34 L330 38 L326 52 L354 54z" fill="#ff3b30" ${S3}/>
      <path d="M330 38 L306 42 L304 50 L326 52z" fill="#fff" ${S3}/>
    </g>
    <g stroke="#ffe08a" stroke-width="4" stroke-linecap="round" opacity=".9"><path d="M30 70 h18 M96 52 h14 M150 30 h16 M300 70 h14"/></g>
    ${sparkle(240, 108, '#fff', 0.7)}${sparkle(160, 52, '#ffd21f', 0.9)}`),
  // ───────────── Barn Blink (party) ─────────────
  blink: svg(`${defs('bb', '#5ec2ff', '#c9f0ff', `
    <radialGradient id="bbg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#b6ff9a"/><stop offset=".55" stop-color="#2fc65a" stop-opacity=".55"/><stop offset="1" stop-color="#2fc65a" stop-opacity="0"/></radialGradient>
    <radialGradient id="bbl" cx=".38" cy=".32" r=".7"><stop offset="0" stop-color="#8dff7a"/><stop offset="1" stop-color="#1fa548"/></radialGradient>`)}
    ${sky('bb')}${cloud(44, 30, 0.7)}${cloud(330, 30, 0.6)}${hills('bb', 6)}
    <g filter="url(#bbd)">
      <path d="M322 150 v-56 l26 -24 l26 24 v56z" fill="#e8402f" ${S}/><path d="M314 98 l34 -34 l34 34" fill="none" ${S}/>
      <rect x="336" y="114" width="24" height="36" fill="#fff6e0" ${S3}/><path d="M336 114 l24 36 M360 114 l-24 36" ${S3}/>
      <rect x="174" y="120" width="12" height="70" rx="3" fill="#a8642a" ${S3}/><rect x="214" y="120" width="12" height="70" rx="3" fill="#a8642a" ${S3}/>
      <rect x="140" y="18" width="120" height="120" rx="18" fill="#d48a3a" ${S}/>
      <rect x="152" y="30" width="96" height="96" rx="12" fill="#fff6e0" ${S3}/>
      <circle cx="200" cy="78" r="62" fill="url(#bbg)"/>
      <circle cx="200" cy="78" r="34" fill="url(#bbl)" ${S}/>
      <ellipse cx="189" cy="65" rx="11" ry="7" fill="#fff" opacity=".7"/>
      <g transform="translate(70 196)">
        <rect x="-6" y="-46" width="12" height="46" fill="#8a8fb0" ${S3}/><rect x="-24" y="-8" width="48" height="12" rx="5" fill="#3a3d5c" ${S3}/>
        <rect x="-22" y="-52" width="44" height="9" rx="4" fill="#3a3d5c" ${S3}/><path d="M-19 -52 a19 12 0 0 1 38 0z" fill="#ff3b30" ${S3}/>
        <path d="M-64 -104 L-4 -66" stroke="${INK}" stroke-width="21" stroke-linecap="round"/><path d="M-64 -104 L-4 -66" stroke="#fbfbff" stroke-width="13" stroke-linecap="round"/>
        <ellipse cx="-2" cy="-62" rx="11" ry="8" fill="#3a3350" ${S3}/>
      </g>
      <g transform="translate(330 196)">
        <rect x="-6" y="-46" width="12" height="46" fill="#8a8fb0" ${S3}/><rect x="-24" y="-8" width="48" height="12" rx="5" fill="#3a3d5c" ${S3}/>
        <rect x="-22" y="-52" width="44" height="9" rx="4" fill="#3a3d5c" ${S3}/><path d="M-19 -52 a19 18 0 0 1 38 0z" fill="#2f7cff" ${S3}/>
      </g>
      <g transform="translate(96 60)"><rect x="-38" y="-17" width="76" height="34" rx="14" fill="#1b1b3a" opacity=".85"/><text x="0" y="8" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="22" fill="#ffd21f">187 ms</text></g>
      <g ${S3} fill="none"><path d="M104 50 l14 8 M100 78 h16 M104 106 l14 -8 M296 50 l-14 8 M300 78 h-16 M296 106 l-14 -8"/></g>
    </g>
    ${shadow(200, 196, 40, 6)}${sparkle(262, 26, '#ffd21f', 0.9)}${sparkle(132, 132, '#fff', 0.7)}`),
  // ───────────── Barn Raiser (camera stacking) ─────────────
  barnraiser: svg(`${defs('br', '#5ec2ff', '#ffe2b8')}
    ${sky('br')}${cloud(70, 52, 0.7)}${cloud(338, 112, 0.6)}${hills('br', 6)}
    <rect x="-5" y="10" width="410" height="16" rx="4" fill="#2f7cff" ${S}/>
    <path d="M0 13 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10 l14 10" fill="none" stroke="#1f5fd6" stroke-width="2.5"/>
    ${shadow(200, 206, 70, 7)}
    <g filter="url(#brd)">
      <rect x="146" y="150" width="108" height="56" rx="4" fill="#ff3b30" ${S}/>
      <rect x="180" y="168" width="40" height="38" rx="2" fill="#fff" ${S3}/>
      <path d="M184 172 L216 204 M216 172 L184 204" stroke="#ff3b30" stroke-width="4"/>
      <rect x="136" y="142" width="128" height="10" rx="3" fill="#a0602a" ${S3}/>
      <rect x="160" y="122" width="80" height="20" rx="6" fill="#f7c843" ${S3}/><path d="M180 122 v20 M220 122 v20" stroke="#ff3b30" stroke-width="3"/>
      <rect x="166" y="102" width="70" height="20" rx="4" fill="#e08a3c" ${S3}/><path d="M172 105 L230 119 M230 105 L172 119" stroke="#a2561e" stroke-width="3"/>
      <rect x="170" y="82" width="62" height="20" rx="6" fill="#f7c843" ${S3}/><path d="M186 82 v20 M216 82 v20" stroke="#ff3b30" stroke-width="3"/>
      <rect x="222" y="22" width="34" height="16" rx="4" fill="#ff3b30" ${S3}/>
      <circle cx="230" cy="22" r="4" fill="#fff" ${S3}/><circle cx="248" cy="22" r="4" fill="#fff" ${S3}/>
      <path d="M239 38 L246 54" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <g transform="rotate(10 248 64)">
        <rect x="216" y="56" width="62" height="20" rx="6" fill="#f7c843" ${S3}/><path d="M232 56 v20 M262 56 v20" stroke="#ff3b30" stroke-width="3"/>
      </g>
      <g transform="translate(64 116) rotate(-8)">
        <rect x="-20" y="-6" width="40" height="44" rx="12" fill="#ffd9b0" ${S3}/>
        <rect x="-19" y="-30" width="9" height="30" rx="4.5" fill="#ffd9b0" ${S3}/>
        <rect x="-9" y="-36" width="9" height="36" rx="4.5" fill="#ffd9b0" ${S3}/>
        <rect x="1" y="-34" width="9" height="34" rx="4.5" fill="#ffd9b0" ${S3}/>
        <rect x="11" y="-27" width="9" height="28" rx="4.5" fill="#ffd9b0" ${S3}/>
        <rect x="18" y="4" width="18" height="10" rx="5" transform="rotate(-35 18 9)" fill="#ffd9b0" ${S3}/>
      </g>
    </g>
    <g fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M22 66 v-12 h12 M106 66 v-12 h-12 M22 158 v12 h12 M106 158 v12 h-12"/></g>
    <path d="M247 80 v40" stroke="#fff" stroke-width="3" stroke-dasharray="5 6"/>
    <g fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"><path d="M126 112 l-14 -10 v20z" opacity=".55"/><path d="M148 112 l-14 -10 v20z"/></g>
    ${sparkle(292, 92, '#ffd21f')}${sparkle(150, 70, '#fff', 0.7)}`),
  // ───────────── Haystack Hideout ─────────────
  hideout: svg(`${defs('hh', '#5ec2ff', '#d8f2ff', `
    <radialGradient id="hhbeam" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6b0" stop-opacity=".85"/><stop offset="1" stop-color="#fff6b0" stop-opacity="0"/></radialGradient>
    <linearGradient id="hhhay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe066"/><stop offset="1" stop-color="#e8a820"/></linearGradient>`)}
    ${sky('hh')}${cloud(70, 34, 0.8)}${cloud(230, 24, 0.6)}${hills('hh', 4)}
    <g filter="url(#hhd)">
      <rect x="18" y="74" width="62" height="58" rx="3" fill="#e8352b" ${S}/>
      <path d="M12 76 L49 46 L86 76Z" fill="#b8241c" ${S}/>
      <rect x="34" y="100" width="30" height="32" fill="#fff" ${S3}/>
      <path d="M36 102 L62 130 M62 102 L36 130" stroke="#e8352b" stroke-width="4"/>
      ${shadow(110, 196, 40)}
      <path d="M78 196 q-6 -52 14 -64 h36 q20 12 14 64z" fill="#b8743a" ${S}/>
      <path d="M76 160 h68 M78 182 h64" stroke="${INK}" stroke-width="6"/><path d="M76 160 h68 M78 182 h64" stroke="#6c6f8c" stroke-width="3"/>
      <ellipse cx="110" cy="132" rx="18" ry="5" fill="#d48a4a" ${S3}/>
      ${shadow(318, 196, 44)}
      <g fill="#2fb04a" ${S}><circle cx="296" cy="174" r="24"/><circle cx="340" cy="174" r="24"/><circle cx="306" cy="148" r="22"/><circle cx="334" cy="146" r="24"/></g>
      <ellipse cx="318" cy="168" rx="38" ry="22" fill="#2fb04a"/>
      <g fill="#ff3b30" stroke="${INK}" stroke-width="2"><circle cx="300" cy="160" r="4"/><circle cx="334" cy="152" r="4"/><circle cx="322" cy="178" r="4"/></g>
      <g transform="translate(212 110)">
        <path d="M-14 -16 l-12 -14 l4 18z M14 -16 l12 -14 l-4 18z" fill="#ff9db3" ${S3}/>
        <ellipse cx="0" cy="0" rx="26" ry="23" fill="#ffb3c4" ${S}/>
        <ellipse cx="0" cy="9" rx="11" ry="8" fill="#ff7f9c" ${S3}/>
        <ellipse cx="-4" cy="9" rx="2" ry="3" fill="${INK}"/><ellipse cx="4" cy="9" rx="2" ry="3" fill="${INK}"/>
        <ellipse cx="-10" cy="-5" rx="5" ry="6.5" fill="#fff" ${S3}/><ellipse cx="10" cy="-5" rx="5" ry="6.5" fill="#fff" ${S3}/>
        <circle cx="-9" cy="-4" r="3" fill="${INK}"/><circle cx="11" cy="-4" r="3" fill="${INK}"/>
        <ellipse cx="-8" cy="-14" rx="5" ry="3" fill="#fff" opacity=".5"/>
      </g>
      ${shadow(212, 198, 66, 8)}
      <path d="M146 198 C142 140 178 118 212 118 C246 118 282 140 278 198Z" fill="url(#hhhay)" ${S}/>
      <path d="M150 166 h124" stroke="#d48a3a" stroke-width="10"/><path d="M150 166 h124" stroke="${INK}" stroke-width="3" opacity=".5"/>
      <g stroke="#c48a10" stroke-width="3.5" stroke-linecap="round"><path d="M172 150 l10 -8 M236 140 l12 6 M190 184 l12 -8 M246 182 l10 -10 M206 138 l6 10"/></g>
      <path d="M170 136 q14 -12 30 -12" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>
    </g>
    <circle cx="214" cy="150" r="58" fill="url(#hhbeam)"/>
    <g fill="none"><circle cx="214" cy="150" r="17" stroke="${INK}" stroke-width="11"/><circle cx="214" cy="150" r="17" stroke="#ff3b30" stroke-width="6"/><circle cx="214" cy="150" r="5" fill="#ff3b30" stroke="${INK}" stroke-width="3"/></g>
    <g fill="none"><circle cx="330" cy="120" r="14" stroke="${INK}" stroke-width="10"/><circle cx="330" cy="120" r="14" stroke="#2f7cff" stroke-width="5"/></g>
    <g fill="none"><circle cx="120" cy="114" r="14" stroke="${INK}" stroke-width="10"/><circle cx="120" cy="114" r="14" stroke="#2fc65a" stroke-width="5"/></g>
    <g transform="translate(366 58)"><circle r="20" fill="#fff" ${S3}/><text y="9" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="28" fill="${INK}">?</text></g>
    ${sparkle(176, 108, '#ffd21f', 0.8)}${sparkle(258, 100, '#fff', 0.7)}`),
  // ───────────── Back2Back (co-op racer + shooter) ─────────────
  back2back: svg(`${defs('b2b', '#7fd8ff', '#e6fbff')}
    ${sky('b2b')}${hills('b2b', -8)}
    <g ${S3}><ellipse cx="44" cy="48" rx="62" ry="34" fill="#2c1d52"/><ellipse cx="108" cy="30" rx="50" ry="28" fill="#3b2a63"/><ellipse cx="22" cy="92" rx="46" ry="30" fill="#24103e"/><ellipse cx="96" cy="84" rx="40" ry="24" fill="#3b2a63"/></g>
    <path d="M104 62 L88 98 L102 98 L90 132 L124 86 L108 86 L120 62Z" fill="#ffd21f" ${S3}/>
    <path d="M188 128 C178 158 120 172 84 220 L316 220 C272 176 234 158 212 128Z" fill="#4b4f63" ${S}/>
    <path d="M188 128 C178 158 120 172 84 220 M212 128 C234 158 272 176 316 220" fill="none" stroke="#e53b30" stroke-width="4" opacity=".9"/>
    <path d="M200 132 C198 168 186 186 196 220" fill="none" stroke="#f3f0e6" stroke-width="4" stroke-dasharray="12 10"/>
    <g transform="translate(200 112) scale(.7)"><rect x="-26" y="-34" width="52" height="32" rx="10" fill="#9b4dff" ${S3}/><rect x="-14" y="-46" width="28" height="14" rx="5" fill="#e8f6ff" ${S3}/><rect x="-22" y="-2" width="12" height="8" fill="#1b1b3a"/><rect x="10" y="-2" width="12" height="8" fill="#1b1b3a"/></g>
    <g transform="translate(200 196)"><ellipse cy="8" rx="42" ry="8" fill="#000" opacity=".22"/><rect x="-44" y="-34" width="88" height="38" rx="14" fill="#ff3b30" ${S}/><rect x="-30" y="-56" width="60" height="26" rx="10" fill="#ffe9a8" ${S}/><rect x="-22" y="-52" width="44" height="14" fill="#bfe9ff"/></g>
    <circle cx="300" cy="70" r="26" fill="none" stroke="${INK}" stroke-width="8"/><circle cx="300" cy="70" r="26" fill="none" stroke="#2f7cff" stroke-width="4"/><path d="M270 70 H290 M310 70 H330 M300 40 V60 M300 80 V100" stroke="#fff" stroke-width="4"/>
    ${sparkle(120, 60, '#ffd21f', 0.8)}${sparkle(360, 128, '#fff', 0.7)}`),

  // ───────────── Moo Bowl (ten-pin bowling: camera aim, phone throw) ─────────────
  bowling: svg(`${defs('bw', '#3a2a6b', '#ff9a5a', `
    <linearGradient id="bwl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d79a"/><stop offset="1" stop-color="#e2a85a"/></linearGradient>
    <radialGradient id="bwb" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ff7a6e"/><stop offset=".55" stop-color="#ff3b30"/><stop offset="1" stop-color="#9c120b"/></radialGradient>
    <radialGradient id="bwg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3b0" stop-opacity=".95"/><stop offset="1" stop-color="#ffd21f" stop-opacity="0"/></radialGradient>`)}
    <rect width="400" height="220" fill="url(#bws)"/>
    <g fill="#2a1d52" opacity=".55"><path d="M0 0 H400 V26 L200 4 L0 26Z"/><rect x="0" y="0" width="14" height="220"/><rect x="386" y="0" width="14" height="220"/></g>
    <path d="M-10 34 Q100 58 200 36 T410 34" fill="none" stroke="${INK}" stroke-width="2.5"/>
    ${[18, 62, 108, 154, 246, 292, 338, 382].map((x, i) => `<circle cx="${x}" cy="${43 + Math.sin((x / 400) * Math.PI * 2) * 6 + (x > 200 ? 0 : 2)}" r="6" fill="${['#ffd21f', '#ff3b30', '#2fc65a', '#2f7cff'][i % 4]}" stroke="${INK}" stroke-width="2.5"/>`).join('')}
    <circle cx="200" cy="92" r="84" fill="url(#bwg)"/>
    <path d="M0 220 L136 96 H264 L400 220Z" fill="#6b4a9a" ${S}/>
    <path d="M40 220 L158 96 H242 L360 220Z" fill="url(#bwl)" ${S}/>
    <g stroke="#c98f45" stroke-width="2" opacity=".8"><path d="M120 220 L179 96"/><path d="M200 220 V96"/><path d="M280 220 L221 96"/></g>
    <path d="M40 220 L158 96 L146 96 L4 220Z M360 220 L242 96 L254 96 L396 220Z" fill="#3b2a66" ${S3}/>
    <g fill="${INK}" opacity=".85"><path d="M200 150 l-5 12 h10z"/><path d="M178 158 l-5.5 12 h10z"/><path d="M222 158 l-4.5 12 h10z"/></g>
    <rect x="150" y="66" width="100" height="32" rx="8" fill="#2a1d52" ${S}/>
    ${shadow(200, 99, 44, 5)}
    <g filter="url(#bwd)">
      ${bowlPin(172, 98, 0.42)}${bowlPin(191, 98, 0.42)}${bowlPin(210, 98, 0.42)}${bowlPin(229, 98, 0.42)}
      ${bowlPin(160, 92, 0.6, -38)}${bowlPin(244, 84, 0.62, 52)}${bowlPin(200, 62, 0.66, 14)}
      ${bowlPin(181, 104, 0.5)}${bowlPin(219, 104, 0.5)}${bowlPin(200, 111, 0.58)}
    </g>
    <path d="M150 208 Q150 170 176 138" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 13" opacity=".9"/>
    ${shadow(128, 208, 46, 8)}
    <g filter="url(#bwd)">
      <circle cx="124" cy="166" r="42" fill="url(#bwb)" ${S}/>
      <path d="M92 150 Q108 124 136 128" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".55"/>
      <g fill="${INK}"><ellipse cx="128" cy="150" rx="6" ry="7"/><ellipse cx="146" cy="156" rx="6" ry="7"/><ellipse cx="134" cy="172" rx="6.5" ry="7.5"/></g>
    </g>
    <g stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"><path d="M62 190 h-34"/><path d="M70 206 h-26"/><path d="M60 174 h-20"/></g>
    <g font-family="Lilita One, sans-serif" font-size="34" fill="#ffd21f" stroke="${INK}" stroke-width="7" paint-order="stroke" stroke-linejoin="round"><text x="262" y="176" transform="rotate(-8 262 176)">STRIKE!</text></g>
    ${sparkle(306, 78, '#ffd21f')}${sparkle(98, 86, '#fff', 0.8)}${sparkle(342, 128, '#fff', 0.6)}`),
  // ───────────── Bale Brawl (foam-bopper duel on a hay bale in a pond) ─────────────
  brawl: svg(`${defs('bl', '#5ec2ff', '#d8f2ff', `
    <linearGradient id="blw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#43c8f0"/><stop offset="1" stop-color="#1679b8"/></linearGradient>
    <radialGradient id="blb" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#ffe08a"/><stop offset="1" stop-color="#e0a732"/></radialGradient>`)}
    ${sky('bl')}
    ${cloud(70, 44, 0.9)}${cloud(250, 30, 0.7)}
    <path d="M0 112 Q90 86 190 108 T400 100 V150 H0Z" fill="#8fe86a"/>
    <g ${S3}><rect x="300" y="78" width="54" height="40" fill="#d0412f"/><path d="M294 80 L327 54 L360 80Z" fill="#8a2a1c"/><rect x="316" y="94" width="22" height="24" fill="#fff"/></g>
    <rect y="132" width="400" height="88" fill="url(#blw)"/>
    <g fill="none" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"><path d="M20 160 q14 -6 28 0"/><path d="M330 196 q14 -6 28 0"/><path d="M40 204 q10 -5 22 0"/></g>
    <g ${S3}><ellipse cx="60" cy="178" rx="20" ry="7" fill="#4fbd2e"/><ellipse cx="352" cy="170" rx="17" ry="6" fill="#4fbd2e"/></g>
    ${shadow(200, 192, 130, 12)}
    <g ${S}>
      <path d="M62 150 V186 Q62 204 200 204 Q338 204 338 186 V150Z" fill="#e0a732"/>
      <ellipse cx="200" cy="150" rx="138" ry="30" fill="url(#blb)"/>
    </g>
    <g stroke="#d0412f" stroke-width="7" fill="none"><path d="M120 176 V203"/><path d="M280 176 V203"/></g>
    <g stroke="#b9791c" stroke-width="3" stroke-linecap="round" opacity=".8"><path d="M96 152 l14 4M150 142 l16 5M232 140 l14 -4M290 150 l16 -2M200 164 l16 3"/></g>
    <g filter="url(#bld)">
      <g transform="translate(138 150)">
        <rect x="-18" y="-46" width="36" height="46" rx="14" fill="#d0412f" ${S}/>
        <circle cx="0" cy="-62" r="22" fill="#fff" ${S}/>
        <circle cx="-9" cy="-70" r="7" fill="${INK}"/><ellipse cx="14" cy="-54" rx="7" ry="5" fill="${INK}" opacity=".85"/>
        <path d="M-20 -78 l-10 -12 l14 4M20 -78 l10 -12 l-14 4" fill="#fff" ${S3}/>
        <ellipse cx="4" cy="-55" rx="13" ry="9" fill="#ffb3b8" ${S3}/>
        <circle cx="-5" cy="-66" r="2.8" fill="${INK}"/><circle cx="8" cy="-66" r="2.8" fill="${INK}"/>
        <path d="M-20 -84 q20 -14 40 0z" fill="#c9ced6" ${S3}/>
      </g>
      <g transform="translate(262 150)">
        <rect x="-18" y="-46" width="36" height="46" rx="14" fill="#2f7cff" ${S}/>
        <circle cx="0" cy="-62" r="22" fill="#ffb3c1" ${S}/>
        <path d="M-18 -78 l-6 -10 l12 4M18 -78 l6 -10 l-12 4" fill="#ff8aa0" ${S3}/>
        <ellipse cx="-3" cy="-56" rx="11" ry="8" fill="#ff8aa0" ${S3}/><circle cx="-6" cy="-56" r="2" fill="${INK}"/><circle cx="0" cy="-56" r="2" fill="${INK}"/>
        <circle cx="-10" cy="-69" r="2.8" fill="${INK}"/><circle cx="3" cy="-69" r="2.8" fill="${INK}"/>
        <path d="M-20 -84 q20 -14 40 0z" fill="#c9ced6" ${S3}/>
      </g>
    </g>
    <g stroke-linecap="round">
      <path d="M150 112 L250 56" stroke="${INK}" stroke-width="22"/><path d="M150 112 L250 56" stroke="#ff3b30" stroke-width="14"/><path d="M196 87 l-4 8M220 72 l-4 8" stroke="#fff" stroke-width="6"/>
      <path d="M250 112 L150 56" stroke="${INK}" stroke-width="22"/><path d="M250 112 L150 56" stroke="#2f7cff" stroke-width="14"/><path d="M204 87 l4 8M180 72 l4 8" stroke="#fff" stroke-width="6"/>
    </g>
    ${sparkle(200, 76, '#ffd21f', 1.3)}${sparkle(112, 52, '#fff', 0.8)}${sparkle(300, 150, '#fff', 0.7)}
    <g fill="#9ee3fa" ${S3}><circle cx="372" cy="150" r="6"/><circle cx="384" cy="132" r="4"/><circle cx="364" cy="124" r="5"/></g>
    <g font-family="Lilita One, sans-serif" font-size="36" fill="#ffd21f" stroke="${INK}" stroke-width="7" paint-order="stroke" stroke-linejoin="round"><text x="22" y="108" transform="rotate(-8 22 108)">BONK!</text></g>`),
  // ───────────── Bumper Carts (hay carts colliding on a barn floor, broken picket) ─────────────
  bumper: svg(`${defs('bm', '#ffb25c', '#ffe9b8', `
    <linearGradient id="bmw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6a3a"/><stop offset="1" stop-color="#5c3a1c"/></linearGradient>
    <radialGradient id="bmf" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#f6d08a"/><stop offset="1" stop-color="#d9a455"/></radialGradient>`)}
    ${sky('bm')}
    <path d="M0 96 Q100 74 200 92 T400 86 V140 H0Z" fill="#8fe86a"/>
    <g ${S3}><rect x="40" y="52" width="70" height="48" fill="#d0412f"/><path d="M32 54 L75 22 L118 54Z" fill="#8a2a1c"/><rect x="60" y="70" width="30" height="30" fill="#fff"/></g>
    <rect y="150" width="400" height="70" fill="url(#bmw)"/>
    ${shadow(200, 186, 170, 22)}
    <g ${S}><ellipse cx="200" cy="168" rx="178" ry="40" fill="url(#bmf)"/></g>
    <g fill="none" stroke="#b9791c" stroke-width="3" opacity=".6"><path d="M70 168 q130 30 260 0"/><path d="M110 150 q90 18 180 0"/></g>
    <g ${S3} fill="#fff">${[34, 70, 106, 294, 330, 366].map((x, i) => `<rect x="${x}" y="${i < 3 ? 126 : 126}" width="12" height="38" rx="3"/>`).join('')}<rect x="28" y="136" width="96" height="6" rx="2"/><rect x="286" y="136" width="96" height="6" rx="2"/></g>
    <g ${S3} fill="#fff"><path d="M148 168 l10 -26 l12 4 l-6 26z"/><path d="M236 172 l16 -22 l10 8 l-12 20z"/></g>
    <g filter="url(#bmd)">
      <g transform="translate(142 150) rotate(-8)">
        <rect x="-46" y="-26" width="92" height="52" rx="16" fill="#d9a455" ${S}/>
        <rect x="-52" y="-18" width="104" height="36" rx="18" fill="#ff3b30" ${S}/>
        <rect x="-36" y="-10" width="30" height="8" rx="4" fill="#fff" opacity=".4"/>
        <circle cx="0" cy="-36" r="20" fill="#fff" ${S}/>
        <path d="M-17 -50 l-8 -12 l13 5M17 -50 l8 -12 l-13 5" fill="#fff" ${S3}/>
        <ellipse cx="4" cy="-30" rx="11" ry="8" fill="#ffb3b8" ${S3}/>
        <circle cx="-6" cy="-40" r="2.8" fill="${INK}"/><circle cx="8" cy="-40" r="2.8" fill="${INK}"/>
        <path d="M-30 -22 l-8 -34" stroke="${INK}" stroke-width="3.5"/><path d="M-38 -56 l16 4 l-14 8z" fill="#ffd21f" ${S3}/>
      </g>
      <g transform="translate(262 156) rotate(9)">
        <rect x="-46" y="-26" width="92" height="52" rx="16" fill="#d9a455" ${S}/>
        <rect x="-52" y="-18" width="104" height="36" rx="18" fill="#2f7cff" ${S}/>
        <rect x="-36" y="-10" width="30" height="8" rx="4" fill="#fff" opacity=".4"/>
        <circle cx="0" cy="-36" r="20" fill="#ffb3c1" ${S}/>
        <path d="M-17 -50 l-6 -10 l12 4M17 -50 l6 -10 l-12 4" fill="#ff8aa0" ${S3}/>
        <ellipse cx="-2" cy="-30" rx="11" ry="8" fill="#ff8aa0" ${S3}/><circle cx="-5" cy="-30" r="2" fill="${INK}"/><circle cx="1" cy="-30" r="2" fill="${INK}"/>
        <circle cx="-7" cy="-41" r="2.8" fill="${INK}"/><circle cx="6" cy="-41" r="2.8" fill="${INK}"/>
      </g>
    </g>
    ${sparkle(202, 138, '#ffd21f', 1.6)}${sparkle(176, 112, '#fff', 0.9)}${sparkle(232, 108, '#fff', 0.8)}${sparkle(340, 70, '#fff', 0.7)}
    <g font-family="Lilita One, sans-serif" font-size="36" fill="#ffd21f" stroke="${INK}" stroke-width="7" paint-order="stroke" stroke-linejoin="round"><text x="150" y="70" transform="rotate(-6 150 70)">BUMP!</text></g>`),
};
