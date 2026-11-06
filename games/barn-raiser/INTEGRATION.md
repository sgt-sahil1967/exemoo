# Barn Raiser: integration notes

Id `barn-raiser`, served at `/play/barn-raiser/`. Nothing outside this folder was edited.

## 1. Landing card (`public/index.html`, next to the other party cards)
```html
    <button class="game" style="--bg:#ff8a3d" data-g="Barn Raiser" data-id="barn-raiser"><span class="cover" data-cover="barnraiser"></span><span class="bar"><span class="txt">Barn Raiser<small>Camera: steer, drop, stack</small></span><span class="play">▶</span></span></button>
```

## 2. Cover (`public/covers.js`, inside `export const covers = { ... }`)
```js
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
```
`defs('br', ...)` provides the `brd` drop-shadow filter used above. The cover shows the hay crane on its
blue girder lowering a bale onto a bale/crate tower on the red barn, and a hand inside camera-frame
corners steering it.

## 3. Table rows
`README.md` games table (after the party minigames):
```md
| Barn Raiser | `barn-raiser` | laptop camera: hand steers the crane, raise the other hand to drop (or phone tilt + Action, or keys) | stacking party game, 1–4 players in turns (hot seat), CPU rivals; needs shell camera assist; static, see `games/barn-raiser/README.md` |
```
`games/README.md` folder table:
```md
| `barn-raiser` | static, camera stacking party game (Canvas 2D, no build). Party kit copied from `shake-freeze` (with two small hooks: `titleButtons`, `onAct`) | swing (P1 = shell phone for tilt / Action, P2–P4 pair their own PIN) + shell camera `pose` events |
```

## 4. Shell (`public/js/shell.js`)
- `DEFAULT_LAYOUT`: add `'barn-raiser': 'swing'` (phones tilt to steer and use the big Action button;
  the kit also sets `swing` itself via the SDK).
- **Do not** add `barn-raiser` to `NO_CAMERA` or `OWN_CAMERA`. The game wants the **shell's** camera assist
  ON and reads the `pose` events it forwards (`wrist`, `shoulder`, `scale`, `visible`, `hand` and the `img`
  landmarks `ls rs le re lw rw lh rh` for the free hand and the mini view).
- Nothing else is required: with the id absent from both sets, `openGame` starts the camera when the
  user has camera assist enabled. If it is not on, the game itself asks once via
  `exemoo.setCamera(true)` (2.5 s after load, only if no pose arrived) and its title screen has a
  **Camera: On/Off** button that sends the same `camera` message. Note that this goes through the shell's
  `setCamera`, so it also stores the user's `exemoo.camera` preference. If you would rather not have the
  game flip the stored preference, the alternative is a shell-side `WANTS_CAMERA` set that starts the
  camera for this id without persisting it; the game works either way and falls back to tilt / keys.
