# Straw Shot: integration notes

Everything below is for the coordinating session to paste into shared files. Nothing outside
`games/straw-shot/` was edited.

## 1. Landing card (`public/index.html`, next to the other party games)

```html
    <button class="game" style="--bg:#2fc65a" data-g="Straw Shot" data-id="straw-shot"><span class="cover" data-cover="straw"></span><span class="bar"><span class="txt">Straw Shot<small>Party: point, draw, loose!</small></span><span class="play">▶</span></span></button>
```

## 2. Cover (`public/covers.js`, entry in `covers`, key `straw`)

Uses the file's helpers `svg`, `defs`, `sky`, `cloud`, `hills`, `shadow`, `sparkle`, `S`, `S3`, `INK`.

```js
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
```

## 3. README rows

`README.md` games table:

```md
| Straw Shot | `straw-shot` | swing: point the phone to aim, hold Action to draw, release to shoot; Recenter | party archery, 1–4 phones shoot at once (2nd–4th pair their own PIN in the lobby), CPU rivals; static, see `games/straw-shot/README.md` |
```

`games/README.md` table:

```md
| `straw-shot` | static, new party archery game (Canvas 2D, no build). Own copy of the party kit (`party.js` extended with up / down keys and the held Action state; `art.js`, `sfx.js`, `party.css` unchanged) | swing (1–4 phones: P1 = shell phone, P2–P4 pair their own PIN) |
```

## 4. Shell (`public/js/shell.js`)

- `DEFAULT_LAYOUT`: add `'straw-shot': 'swing'` (needs the motion stream, the big Action button and Recenter).
- `NO_CAMERA`: add `'straw-shot'`. Aiming is all phone orientation, and the shell camera tracks only one body,
  which doesn't fit 4 players shooting at once. Do not add it to `OWN_CAMERA`.
