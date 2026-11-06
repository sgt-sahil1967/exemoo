# Peek-a-Barn: integration notes

Everything below is for the coordinating session to paste into the shared files. Nothing outside
`games/peek-a-barn/` was edited.

## 1. Landing card (`public/index.html`, in the games `<section>`, e.g. after Flapjack Flip)

```html
    <button class="game" style="--bg:#c8402f" data-g="Peek-a-Barn" data-id="peek-a-barn"><span class="cover" data-cover="peek"></span><span class="bar"><span class="txt">Peek-a-Barn<small>Party: match the pairs</small></span><span class="play">▶</span></span></button>
```

## 2. Cover (`public/covers.js`, inside `export const covers = { ... }`, key `peek`)

Uses only the helpers already in `covers.js`: `defs`, `sky`, `cloud`, `hills`, `shadow`, `sparkle`,
`svg`, `S`, `S3`, `INK` (filter id `pbd` comes from `defs('pb', ...)`). Checked by rendering it at 400x220.

```js
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
```

## 3. Games tables

`README.md` (root) games table:

```md
| Peek-a-Barn | `peek-a-barn` | remote: d-pad moves the cursor, GO opens a door | party memory game, 1–4 phones (2nd–4th pair their own PIN in the lobby), turn-based, CPU rivals; static, see `games/peek-a-barn/README.md` |
```

`games/README.md` table:

```md
| `peek-a-barn` | static, new party memory game (Canvas 2D, no build). Own copy of the party kit, extended for the `remote` layout and turn-based d-pad input | remote (1–4 phones: P1 = shell phone, P2–P4 pair their own PIN) |
```

## 4. `public/js/shell.js`

- `DEFAULT_LAYOUT`: add `'peek-a-barn': 'remote',` (the game also asks for `remote` itself through the SDK,
  with the motion stream off; it only needs the d-pad, GO, Pause and Back).
- `NO_CAMERA`: add `'peek-a-barn'` (no camera use; the shell's camera assist is not needed).
- Not `OWN_CAMERA`.
