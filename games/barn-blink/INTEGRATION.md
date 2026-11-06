# Barn Blink: integration notes

Everything the coordinating session needs to wire `games/barn-blink/` into the shell. Nothing outside
this folder was edited.

## 1. Landing card (`public/index.html`, games section)

```html
    <button class="game" style="--bg:#2fc65a" data-g="Barn Blink" data-id="barn-blink"><span class="cover" data-cover="blink"></span><span class="bar"><span class="txt">Barn Blink<small>Party: fastest reflexes</small></span><span class="play">▶</span></span></button>
```

## 2. Cover (`public/covers.js`, inside `export const covers = { ... }`)

Uses the existing helpers `svg`, `defs`, `sky`, `cloud`, `hills`, `shadow`, `sparkle`, `S`, `S3`, `INK`.
Key: `blink`.

```js
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
```

## 3. README rows

`README.md` games table:

```md
| Barn Blink | `barn-blink` | swing: big Action button to react; flick the phone in Flick rounds; buzz cues via haptics | party reaction-time game, 1–4 phones (2nd–4th pair their own PIN in the lobby), CPU rivals; static, see `games/barn-blink/README.md` |
```

`games/README.md` table (either add `barn-blink` to the party-minigames row, or this own row):

```md
| `barn-blink` | static, new party reaction game (Canvas 2D, no build). Party kit copied from `shake-freeze` (adds two how-to icons) | swing (1–4 phones: P1 = shell phone, P2–P4 pair their own PIN) |
```

## 4. Shell settings (`public/js/shell.js`)

- `DEFAULT_LAYOUT`: add `'barn-blink': 'swing'` (the kit asks for `swing` anyway; it streams the gyro needed for Flick rounds and has the big Action button).
- `NO_CAMERA`: add `'barn-blink'`. The game does not use the camera or pose events.
- Not `OWN_CAMERA`.
