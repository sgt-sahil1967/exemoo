# Haystack Hideout: integration notes

Everything below is for the coordinating session to paste into shared files. Nothing outside
`games/haystack-hideout/` was edited.

Note: while this was being built, an empty `games/peek-a-barn/` folder (kit copies only, no `game.js`)
appeared from another session. It is not part of this game; this game uses id `haystack-hideout`.

## 1. Landing card (`public/index.html`, next to the other party minigames)
```html
    <button class="game" style="--bg:#ffb000" data-g="Haystack Hideout" data-id="haystack-hideout"><span class="cover" data-cover="hideout"></span><span class="bar"><span class="txt">Haystack Hideout<small>Party: memory hide-and-seek</small></span><span class="play">▶</span></span></button>
```

## 2. Cover (`public/covers.js`, inside `export const covers = { ... }`, key `hideout`)
Uses the file's own helpers `defs`, `sky`, `cloud`, `hills`, `sparkle`, `shadow`, `svg`, `S`, `S3`, `INK`.
```js
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
```

## 3. README rows
`README.md` games table:
```
| Haystack Hideout | `haystack-hideout` | swing: sweep/tilt the phone to aim a cursor (gyro), Action picks, Recenter re-centres | party minigame (memory hide-and-seek), 1–4 phones (2nd–4th pair their own PIN in the lobby), CPU rivals; static, see `games/haystack-hideout/README.md` |
```
`games/README.md` table:
```
| `haystack-hideout` | static, new party minigame (Canvas 2D, no build). Own copy of the party kit; its `party.js` is extended with up/down/pick keys per player | swing (1–4 phones: P1 = shell phone, P2–P4 pair their own PIN) |
```

## 4. Shell (`public/js/shell.js`)
- `DEFAULT_LAYOUT`: add `'haystack-hideout': 'swing'` (needs the motion stream: gyro rate drives the cursor, plus Action / Pause / Recenter).
- Add `'haystack-hideout'` to `NO_CAMERA` (the game never uses camera assist or `pose` events). Not `OWN_CAMERA`.
