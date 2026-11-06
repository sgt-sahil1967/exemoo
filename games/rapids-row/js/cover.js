// Cover art for the Exemoo menu card (inline SVG, 400x220), Moo Moo Farm style.
const INK = '#1b1b3a';
const S = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
const S3 = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;
const cloud = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><g fill="#d6eeff" transform="translate(0 4)"><ellipse rx="34" ry="13"/><circle cx="-12" cy="-8" r="13"/><circle cx="12" cy="-10" r="16"/></g><g fill="#fff"><ellipse rx="34" ry="13"/><circle cx="-12" cy="-8" r="13"/><circle cx="12" cy="-10" r="16"/></g></g>`;
const splash = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" ${S3}><circle cx="-8" cy="0" r="5"/><circle cx="2" cy="-8" r="6"/><circle cx="11" cy="-1" r="4"/><circle cx="5" cy="4" r="3.5"/></g>`;
const sparkle = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -12L3.5 -3.5L12 0L3.5 3.5L0 12L-3.5 3.5L-12 0L-3.5 -3.5Z" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`;

function paddler(x, y, shirt, dark, hat, lean) {
  return `<g transform="translate(${x} ${y}) rotate(${lean})">
    <rect x="-15" y="-4" width="30" height="34" rx="13" fill="${shirt}" ${S}/>
    <rect x="-11" y="0" width="8" height="24" rx="4" fill="#fff" opacity=".28"/>
    <path d="M-15 14 H15" stroke="${dark}" stroke-width="4"/>
    <circle cx="0" cy="-20" r="16" fill="#ffd9b0" ${S}/>
    <path d="M-16 -22 a16 15 0 0 1 32 0 z" fill="${hat}" ${S3}/>
    <circle cx="-5.5" cy="-19" r="2.5" fill="${INK}"/><circle cx="5.5" cy="-19" r="2.5" fill="${INK}"/>
    <ellipse cx="0" cy="-11" rx="4.5" ry="3.5" fill="${INK}"/>
    <circle cx="-11" cy="-13" r="3" fill="#ff8a9a" opacity=".6"/><circle cx="11" cy="-13" r="3" fill="#ff8a9a" opacity=".6"/>
  </g>`;
}

export function rapidsRowCover() {
  const river = 'M178 112 C198 118 236 126 218 140 C188 156 130 158 96 174 C66 188 36 204 14 222 H386 C366 202 336 190 312 176 C286 160 266 150 252 138 C242 126 234 118 218 112Z';
  return `<svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><defs>
  <linearGradient id="rrs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4cb4ff"/><stop offset="1" stop-color="#d4f1ff"/></linearGradient>
  <linearGradient id="rrw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fdcff"/><stop offset="1" stop-color="#1f9ad8"/></linearGradient>
  <radialGradient id="rrsun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff8c4"/><stop offset=".6" stop-color="#ffe066" stop-opacity=".6"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>
  <filter id="rrd" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="5" stdDeviation="3" flood-color="#000" flood-opacity=".3"/></filter>
  </defs>
  <rect width="400" height="220" fill="url(#rrs)"/>
  <circle cx="320" cy="42" r="58" fill="url(#rrsun)"/>
  ${cloud(70, 38)}${cloud(250, 24, 0.7)}
  <path d="M0 112 L60 72 L110 104 L170 66 L230 106 L290 80 L340 104 L400 84 V120 H0Z" fill="#7aa8d8" ${S3}/>
  <path d="M0 112 Q90 96 170 112 T400 108 V220 H0Z" fill="#6fd84a" ${S}/>
  <path d="M0 150 Q60 130 120 160 T130 220 H0Z" fill="#5fd03a"/>
  <path d="M400 140 Q330 140 300 170 T330 220 H400Z" fill="#5fd03a"/>
  <path d="${river}" fill="url(#rrw)" ${S}/>
  <path d="M0 112 H400" stroke="none"/>
  <g stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".75"><path d="M190 128 q10 4 22 0"/><path d="M160 176 q12 4 26 0"/><path d="M262 172 q8 -6 14 -14"/><path d="M230 150 q8 3 16 0"/></g>
  <g fill="#fff" stroke="${INK}" stroke-width="3.5"><path d="M118 214 C130 208 150 210 160 216Z"/></g>
  <!-- trees -->
  <g ${S3}>
    <rect x="46" y="112" width="8" height="16" fill="#b8763e"/><circle cx="50" cy="104" r="17" fill="#2fc65a"/><circle cx="44" cy="99" r="6" fill="#6be08a" stroke="none"/>
    <rect x="352" y="116" width="8" height="14" fill="#b8763e"/><circle cx="356" cy="108" r="15" fill="#2fc65a"/>
  </g>
  <!-- cow cheering -->
  <g transform="translate(346 166)" filter="url(#rrd)">
    <ellipse cx="0" cy="26" rx="26" ry="5" fill="#000" opacity=".2"/>
    <rect x="-18" y="2" width="36" height="22" rx="10" fill="#fff" ${S3}/>
    <path d="M-6 3 q8 -2 10 8 q-6 6 -14 2z" fill="${INK}"/>
    <rect x="-15" y="18" width="6" height="12" rx="2" fill="#fff" ${S3}/><rect x="9" y="18" width="6" height="12" rx="2" fill="#fff" ${S3}/>
    <path d="M-12 -6 L-26 -22" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M-12 -6 L-26 -22" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    <rect x="-10" y="-14" width="26" height="22" rx="10" fill="#fff" ${S3}/>
    <path d="M-8 -14 l-4 -8 M14 -14 l4 -8" ${S3} fill="none"/>
    <ellipse cx="3" cy="2" rx="11" ry="7" fill="#ffb3c1" ${S3}/>
    <circle cx="-1" cy="-6" r="2.4" fill="${INK}"/><circle cx="10" cy="-6" r="2.4" fill="${INK}"/>
    <circle cx="0" cy="2" r="1.5" fill="${INK}"/><circle cx="7" cy="2" r="1.5" fill="${INK}"/>
  </g>
  <!-- rock -->
  <g filter="url(#rrd)"><path d="M70 196 C64 180 78 168 96 170 C112 170 122 182 116 198 C100 204 84 204 70 196Z" fill="#9aa3b5" ${S}/>
  <path d="M80 180 q8 -8 18 -6" stroke="#d3dae8" stroke-width="4" fill="none" stroke-linecap="round"/></g>
  ${splash(66, 202, 1.1)}${splash(122, 200, 0.9)}
  <!-- canoe -->
  <g transform="translate(205 160) rotate(-6)" filter="url(#rrd)">
    <ellipse cx="0" cy="34" rx="92" ry="9" fill="#0a5f8f" opacity=".35"/>
    <path d="M-92 14 Q-60 44 0 44 Q60 44 92 14 Q60 22 0 22 Q-60 22 -92 14Z" fill="#8a5326" ${S}/>
    ${paddler(-34, -10, '#ff3b30', '#b3160f', '#ffd21f', -6)}
    ${paddler(34, -10, '#2f7cff', '#1747b5', '#2fc65a', 6)}
    <path d="M-92 14 Q-60 26 0 26 Q60 26 92 14 Q60 -2 0 -2 Q-60 -2 -92 14Z" fill="#e0953f" ${S}/>
    <path d="M-80 14 Q-40 20 0 20" stroke="#ffd68a" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M-92 14 l-8 -8 M92 14 l8 -8" ${S} fill="none"/>
    <!-- paddles -->
    <g ${S3}>
      <path d="M-44 8 L-92 50" stroke="${INK}" stroke-width="9"/><path d="M-44 8 L-92 50" stroke="#ffe08a" stroke-width="4"/>
      <ellipse cx="-96" cy="54" rx="10" ry="6" transform="rotate(40 -96 54)" fill="#ff3b30"/>
      <path d="M44 8 L92 50" stroke="${INK}" stroke-width="9"/><path d="M44 8 L92 50" stroke="#ffe08a" stroke-width="4"/>
      <ellipse cx="96" cy="54" rx="10" ry="6" transform="rotate(-40 96 54)" fill="#2f7cff"/>
    </g>
  </g>
  ${splash(110, 214, 1)}${splash(300, 212, 1.1)}
  ${sparkle(150, 126, 0.8)}${sparkle(262, 112, 0.6)}${sparkle(30, 70, 0.7)}
  </svg>`;
}
