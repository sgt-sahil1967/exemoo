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
};
