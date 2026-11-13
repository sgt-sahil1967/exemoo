// Bale Brawl UI: DOM screens (title, lobby, pause, results) and the in-fight HUD. No game logic here.
// Contract: PLAN.md 3.5. Styles live in ../ui.css (classes start with bb-).
// Menus work with mouse, Tab, arrow keys + Enter, and the phone d-pad through ui.nav(button).

const STORE = 'bale-brawl.cfg';
const DIFFS = [
  ['easy', 'Easy'],
  ['normal', 'Normal'],
  ['hard', 'Hard'],
  ['champ', 'Champ'],
];

const ICONS = {
  mark: `<svg viewBox="0 0 120 100" class="bb-mark" aria-hidden="true">
    <rect x="14" y="52" width="92" height="40" rx="10" fill="#f2c45a" stroke="#1b1b3a" stroke-width="5"/>
    <path d="M44 53v38M76 53v38" stroke="#d0412f" stroke-width="7"/>
    <path d="M24 66h14M52 70h20M82 66h14M24 80h14M82 80h14" stroke="#c99420" stroke-width="3" stroke-linecap="round"/>
    <g stroke="#1b1b3a" stroke-width="5" stroke-linecap="round"><path d="M22 8L96 62" stroke-width="19"/><path d="M98 8L24 62" stroke-width="19"/></g>
    <path d="M22 8L96 62" stroke="#ff3b30" stroke-width="11" stroke-linecap="round"/>
    <path d="M98 8L24 62" stroke="#2f7cff" stroke-width="11" stroke-linecap="round"/>
    <path d="M40 20l8 6M70 42l8 6" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    <path d="M80 20l-8 6M50 42l-8 6" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>`,
  swing: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="14" width="14" height="26" rx="4" transform="rotate(-24 15 27)" fill="#fff" stroke="#1b1b3a" stroke-width="3"/>
    <path d="M26 30c8-2 14-10 14-20" fill="none" stroke="#ff3b30" stroke-width="4" stroke-linecap="round"/><path d="M35 12l5-4 3 7" fill="none" stroke="#ff3b30" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  guard: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="19" y="5" width="10" height="38" rx="5" fill="#2f7cff" stroke="#1b1b3a" stroke-width="3"/>
    <path d="M22 14h4M22 24h4" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M6 14l30 14" stroke="#ff3b30" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 8"/><path d="M40 8l-6 4" stroke="#ffd21f" stroke-width="4" stroke-linecap="round"/></svg>`,
  splash: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="2" y="30" width="26" height="9" rx="4" fill="#f2c45a" stroke="#1b1b3a" stroke-width="3"/>
    <path d="M24 40c4-2 8 2 12 0s6-2 10 0v6H24z" fill="#2bb5e8" stroke="#1b1b3a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M34 28c-3-8-1-13 2-17 3 4 5 9 2 17" fill="#9ee3fa" stroke="#1b1b3a" stroke-width="3" stroke-linejoin="round"/><circle cx="43" cy="22" r="3" fill="#9ee3fa" stroke="#1b1b3a" stroke-width="2"/></svg>`,
  crown: `<svg viewBox="0 0 40 30" aria-hidden="true"><path d="M4 26L2 8l10 8 8-12 8 12 10-8-2 18z" fill="#ffd21f" stroke="#1b1b3a" stroke-width="3" stroke-linejoin="round"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l9 3v7c0 5-4 9-9 10C7 21 3 17 3 12V5z" fill="currentColor" stroke="#1b1b3a" stroke-width="2.4" stroke-linejoin="round"/></svg>`,
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

function loadCfg() {
  const d = { mode: 'cpu', difficulty: 'normal', bestOf: 3 };
  try {
    const s = JSON.parse(localStorage.getItem(STORE) || '{}');
    if (s.mode === 'cpu' || s.mode === 'versus') d.mode = s.mode;
    if (DIFFS.some(([k]) => k === s.difficulty)) d.difficulty = s.difficulty;
    if (s.bestOf === 3 || s.bestOf === 5) d.bestOf = s.bestOf;
  } catch {
    /* no storage */
  }
  return d;
}
function saveCfg(c) {
  try {
    localStorage.setItem(STORE, JSON.stringify(c));
  } catch {
    /* no storage */
  }
}

export function createUI({ root }) {
  const host = el('div', 'bb-ui');
  root.append(host);
  const handlers = new Map();
  const emit = (ev, arg) => (handlers.get(ev) || []).forEach((cb) => cb(arg));
  const cfg = loadCfg();
  let screen = null; // 'title' | 'lobby' | 'pause' | 'results' | null
  let focused = null;
  let status = { phones: [false, false], muted: false };

  const menuLayer = el('div', 'bb-layer');
  const hudLayer = el('div', 'bb-layer bb-hudlayer');
  host.append(hudLayer, menuLayer);

  // ----------------------------------------------------------------- focus + nav
  const menuButtons = () => (screen ? [...menuLayer.querySelectorAll('button')].filter((b) => !b.disabled && b.offsetParent !== null) : []);
  function setFocus(btn) {
    if (focused && focused !== btn) focused.classList.remove('bb-focus');
    focused = btn || null;
    if (focused) {
      focused.classList.add('bb-focus');
      try {
        focused.focus({ preventScroll: true });
      } catch {
        /* ignore */
      }
    }
  }
  function focusDefault() {
    const btns = menuButtons();
    setFocus(btns.find((b) => b.dataset.primary) || btns[0] || null);
  }
  menuLayer.addEventListener('focusin', (e) => {
    if (e.target instanceof HTMLButtonElement && e.target !== focused) setFocus(e.target);
  });

  function nav(button) {
    if (!screen) return false;
    if (button === 'back') {
      if (screen === 'pause') emit('resume');
      else if (screen === 'lobby') emit('lobbyBack');
      return true;
    }
    const btns = menuButtons();
    if (!btns.length) return true;
    if (!focused || !btns.includes(focused)) focusDefault();
    if (button === 'action') {
      (focused || btns[0]).click();
      return true;
    }
    const dirs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const d = dirs[button];
    if (!d) return true;
    const fr = focused.getBoundingClientRect();
    const fx = fr.left + fr.width / 2;
    const fy = fr.top + fr.height / 2;
    let best = null;
    let bestScore = Infinity;
    for (const b of btns) {
      if (b === focused) continue;
      const r = b.getBoundingClientRect();
      const dx = r.left + r.width / 2 - fx;
      const dy = r.top + r.height / 2 - fy;
      const along = dx * d[0] + dy * d[1];
      const across = Math.abs(dx * d[1] - dy * d[0]);
      if (along <= 2) continue;
      const score = along + across * 2.2;
      if (score < bestScore) {
        bestScore = score;
        best = b;
      }
    }
    if (best) setFocus(best);
    return true;
  }
  addEventListener(
    'keydown',
    (e) => {
      if (!screen || e.ctrlKey || e.metaKey || e.altKey) return;
      const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
      if (map[e.key]) {
        e.preventDefault();
        nav(map[e.key]);
      } else if (e.key === 'Escape' && screen === 'lobby') {
        e.preventDefault();
        emit('lobbyBack');
      } else if (e.key === 'Tab') {
        // keep Tab inside the menu and in sync with our focus ring
        const btns = menuButtons();
        if (btns.length) {
          e.preventDefault();
          const i = btns.indexOf(focused);
          setFocus(btns[(i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length]);
        }
      }
    },
    true,
  );

  // ----------------------------------------------------------------- building blocks
  const button = (label, cls, onClick, primary = false) => {
    const b = el('button', `bb-btn ${cls || ''}`, esc(label));
    b.type = 'button';
    if (primary) b.dataset.primary = '1';
    b.addEventListener('click', onClick);
    return b;
  };
  function optGroup(label, options, getValue, setValue, cls = '') {
    const g = el('div', 'bb-optgroup');
    g.append(el('div', 'bb-label', esc(label)));
    const row = el('div', 'bb-opts');
    const btns = options.map(([v, text]) => {
      const b = el('button', `bb-opt ${cls}`, esc(text));
      b.type = 'button';
      b.addEventListener('click', () => {
        setValue(v);
        sync();
      });
      row.append(b);
      return [v, b];
    });
    const sync = () => btns.forEach(([v, b]) => b.setAttribute('aria-pressed', String(getValue() === v)));
    sync();
    g.append(row);
    return { node: g, sync };
  }
  const chip = (text, ok) => `<span class="bb-chip${ok ? ' ok' : ''}"><i></i>${esc(text)}</span>`;

  function show(name, node) {
    screen = name;
    menuLayer.replaceChildren(node);
    host.dataset.screen = name || '';
    focusDefault();
  }

  // ----------------------------------------------------------------- title
  let titleNodes = null;
  function showTitle() {
    hideHud();
    const card = el('div', 'bb-card bb-title-card');
    card.append(el('div', 'bb-logo', `${ICONS.mark}<div class="bb-logo-text">BALE<span>BRAWL</span></div>`));
    card.append(el('div', 'bb-tag', 'Bonk them into the pond!'));

    const setup = el('div', 'bb-setup');
    const diffGroup = optGroup('Rival', DIFFS, () => cfg.difficulty, (v) => ((cfg.difficulty = v), saveCfg(cfg)), 'word');
    const mode = optGroup(
      'Mode',
      [
        ['cpu', 'vs CPU'],
        ['versus', '2 Players'],
      ],
      () => cfg.mode,
      (v) => {
        cfg.mode = v;
        saveCfg(cfg);
        setDiffVisible(v === 'cpu');
        renderStatus();
      },
      'word',
    );
    const best = optGroup(
      'Best of',
      [
        [3, '3'],
        [5, '5'],
      ],
      () => cfg.bestOf,
      (v) => ((cfg.bestOf = v), saveCfg(cfg)),
    );
    // keep the Rival row's space reserved in 2 Players mode so the card never changes size
    // (otherwise START and the bottom row jump under the cursor when switching modes)
    function setDiffVisible(on) {
      diffGroup.node.classList.toggle('bb-reserved', !on);
      diffGroup.node.inert = !on;
      diffGroup.node.setAttribute('aria-hidden', String(!on));
    }
    setDiffVisible(cfg.mode === 'cpu');
    setup.append(mode.node, diffGroup.node, best.node);
    card.append(setup);

    const how = el('div', 'bb-how');
    how.innerHTML = `<div>${ICONS.swing}<b>Point and swing</b><span>Your phone is the bopper</span></div>
      <div>${ICONS.guard}<b>Hold to guard</b><span>Cross their swing</span></div>
      <div>${ICONS.splash}<b>Shove them off</b><span>First wet loses</span></div>`;
    card.append(how);
    card.append(el('div', 'bb-fallback', 'No phone? Player 1: mouse or W A S D + Space. Player 2: arrows + Enter.'));

    const start = button('START', 'green big', () => emit('start', { mode: cfg.mode, difficulty: cfg.difficulty, bestOf: cfg.bestOf }), true);
    card.append(start);

    const row = el('div', 'bb-statusrow');
    const chips = el('span', 'bb-chips');
    const mute = button('', 'small blue', () => emit('mute'));
    const exit = button('Exit', 'small yellow', () => emit('exit'));
    row.append(chips, mute, exit);
    card.append(row);
    titleNodes = { chips, mute };
    renderStatus();
    const wrap = el('div', 'bb-menu');
    wrap.append(card);
    show('title', wrap);
  }
  function renderStatus() {
    if (!titleNodes) return;
    const p = status.phones;
    titleNodes.chips.innerHTML = chip('Phone 1', p[0]) + chip('Phone 2', p[1]);
    // Phone 2 chip always takes its space; only shown in 2 Players so the row never shifts
    const c2 = titleNodes.chips.children[1];
    if (c2 && cfg.mode !== 'versus') { c2.classList.add('bb-reserved'); c2.setAttribute('aria-hidden', 'true'); }
    titleNodes.mute.textContent = status.muted ? 'Sound: off' : 'Sound: on';
  }
  function setStatus(s) {
    status = { phones: [!!s.phones?.[0], !!s.phones?.[1]], muted: !!s.muted };
    renderStatus();
    renderStatusHud();
  }

  // ----------------------------------------------------------------- lobby
  let lobbyCards = null;
  function lobbyCardHtml(c) {
    const body = c.connected
      ? `<div class="bb-ready">${chip('Phone ready', true)}</div>`
      : c.note
        ? `<div class="bb-note">${esc(c.note)}</div>`
        : `${c.qrSrc ? `<img class="bb-qr" src="${esc(c.qrSrc)}" alt="QR code" width="132" height="132">` : '<div class="bb-qr empty">...</div>'}
         <div class="bb-pin">${c.pin ? esc(c.pin) : '----'}</div>
         <div class="bb-pinurl">${c.url ? 'or open ' + esc(c.url) : 'Getting a code...'}</div>`;
    return `<div class="bb-pcard" style="--pc:${esc(c.color)}"><div class="bb-pname">${esc(c.label)}</div>${body}
      ${c.keysHelp ? `<div class="bb-keys">or keys: ${esc(c.keysHelp)}</div>` : ''}</div>`;
  }
  function showLobby(cards) {
    if (screen === 'lobby' && lobbyCards) {
      lobbyCards.innerHTML = cards.map(lobbyCardHtml).join('');
      return;
    }
    hideHud();
    const card = el('div', 'bb-card bb-lobby-card');
    card.append(el('h2', 'bb-h', 'Get your boppers'));
    lobbyCards = el('div', 'bb-pcards');
    lobbyCards.innerHTML = cards.map(lobbyCardHtml).join('');
    card.append(lobbyCards);
    card.append(el('div', 'bb-fallback', 'Scan with a phone camera to join, or just use the keys.'));
    const row = el('div', 'bb-actions');
    row.append(button('Back', 'yellow', () => emit('lobbyBack')), button("Let's brawl!", 'green big', () => emit('lobbyReady'), true));
    card.append(row);
    const wrap = el('div', 'bb-menu');
    wrap.append(card);
    show('lobby', wrap);
  }

  // ----------------------------------------------------------------- pause + results
  function showPause(on) {
    if (!on) {
      if (screen === 'pause') hideAll();
      return;
    }
    const card = el('div', 'bb-card bb-pause-card');
    card.append(el('h2', 'bb-h', 'Paused'));
    card.append(
      button('Resume', 'green', () => emit('resume'), true),
      button('Restart', 'blue', () => emit('restart')),
      button(status.muted ? 'Sound: off' : 'Sound: on', 'yellow', () => emit('mute')),
      button('Exit', 'red', () => emit('exit')),
    );
    const wrap = el('div', 'bb-menu dim');
    wrap.append(card);
    show('pause', wrap);
  }
  function showResults({ winner, names, colors, wins, rounds }) {
    hideHud();
    const draw = winner !== 0 && winner !== 1;
    const card = el('div', 'bb-card bb-results-card');
    const col = draw ? '#ffd21f' : colors[winner];
    const b = el('div', `bb-banner${draw ? ' ink' : ''}`, `${draw ? '' : ICONS.crown}<span>${draw ? 'Draw!' : esc(names[winner]) + ' wins!'}</span>`);
    b.style.setProperty('--pc', col);
    card.append(b);
    const score = el('div', 'bb-score');
    score.innerHTML = [0, 1]
      .map((i) => `<div class="bb-sc${winner === i ? ' win' : ''}" style="--pc:${esc(colors[i])}"><span>${esc(names[i])}</span><b>${wins[i]}</b></div>`)
      .join('<em>:</em>');
    card.append(score);
    if (rounds) card.append(el('div', 'bb-final', `${rounds} round${rounds === 1 ? '' : 's'} played`));
    const row = el('div', 'bb-actions');
    row.append(button('Rematch', 'green', () => emit('rematch'), true), button('Menu', 'blue', () => emit('menu')), button('Exit', 'red', () => emit('exit')));
    card.append(row);
    const wrap = el('div', 'bb-menu dim');
    wrap.append(card);
    show('results', wrap);
  }
  function hideAll() {
    screen = null;
    lobbyCards = null;
    titleNodes = null;
    menuLayer.replaceChildren();
    host.dataset.screen = '';
    if (focused) focused.classList.remove('bb-focus');
    focused = null;
  }

  // ----------------------------------------------------------------- HUD
  const hudEls = {};
  function buildHud() {
    const side = (i) => {
      const n = el('div', `bb-side s${i}`);
      n.innerHTML = `<div class="bb-who"><span class="nm"></span><span class="guard" title="Guard">${ICONS.shield}</span></div>
        <div class="bb-pips"></div>
        <div class="bb-foot"><small>FOOTING</small><div class="bar"><i></i></div></div>`;
      hudEls[`s${i}`] = {
        node: n,
        who: n.querySelector('.bb-who'),
        nm: n.querySelector('.nm'),
        guard: n.querySelector('.guard'),
        pips: n.querySelector('.bb-pips'),
        foot: n.querySelector('.bar'),
        fill: n.querySelector('.bar i'),
        key: '',
      };
      return n;
    };
    const mid = el('div', 'bb-mid');
    mid.innerHTML = '<div class="bb-round"></div><div class="bb-timer"></div>';
    hudEls.mid = mid;
    hudEls.round = mid.querySelector('.bb-round');
    hudEls.timer = mid.querySelector('.bb-timer');
    hudEls.hint = el('div', 'bb-hint');
    hudEls.hint.hidden = true;
    hudEls.status = el('div', 'bb-status');
    hudEls.fx = el('div', 'bb-fx');
    hudEls.pause = button('II', 'small blue bb-pausebtn', () => emit('pause'));
    hudEls.pause.title = 'Pause (Esc)';
    hudEls.pause.tabIndex = -1;
    hudEls.pause.addEventListener('click', () => hudEls.pause.blur()); // keep Space free for guarding
    hudEls.pause.hidden = true;
    hudEls.status.hidden = true;
    hudLayer.append(side(0), mid, side(1), hudEls.hint, hudEls.status, hudEls.fx, hudEls.pause);
    hudLayer.querySelectorAll('.bb-side, .bb-mid').forEach((n) => (n.hidden = true));
    renderStatusHud();
  }
  function renderStatusHud() {
    if (!hudEls.status) return;
    hudEls.status.innerHTML = chip('P1', status.phones[0]) + chip('P2', status.phones[1]) + `<span class="bb-chip">${status.muted ? 'Muted (M)' : 'M mutes'}</span>`;
  }
  function hideHud() {
    if (!hudEls.mid) return;
    hudLayer.querySelectorAll('.bb-side, .bb-mid').forEach((n) => (n.hidden = true));
    hudEls.pause.hidden = true;
    hudEls.status.hidden = true;
    hudEls.fx.replaceChildren();
    hint(null);
  }
  function hud(d) {
    if (!hudEls.mid) buildHud();
    if (!d) return hideHud();
    hudLayer.querySelectorAll('.bb-side, .bb-mid').forEach((n) => (n.hidden = false));
    hudEls.pause.hidden = false;
    hudEls.status.hidden = false;
    for (const i of [0, 1]) {
      const h = hudEls[`s${i}`];
      const key = `${d.names[i]}|${d.colors[i]}|${d.wins[i]}|${d.need}`;
      if (key !== h.key) {
        h.key = key;
        h.node.style.setProperty('--pc', d.colors[i]);
        h.nm.textContent = d.names[i];
        h.pips.innerHTML = Array.from({ length: d.need }, (_, k) => `<i class="${k < d.wins[i] ? 'on' : ''}"></i>`).join('');
      }
      const edge = Math.max(0, Math.min(1, d.edge?.[i] ?? 0));
      h.fill.style.width = `${Math.round((1 - edge) * 100)}%`;
      h.foot.classList.toggle('danger', edge > 0.75);
      h.guard.classList.toggle('on', !!d.guard?.[i]);
    }
    const rt = `ROUND ${d.round}`;
    if (hudEls.round.textContent !== rt) hudEls.round.textContent = rt;
    const tt = d.sudden ? 'SUDDEN DEATH' : String(Math.max(0, Math.ceil(d.timeLeft)));
    if (hudEls.timer.textContent !== tt) hudEls.timer.textContent = tt;
    hudEls.timer.classList.toggle('sudden', !!d.sudden);
    hudEls.timer.classList.toggle('low', !d.sudden && d.timeLeft <= 10);
  }

  // ----------------------------------------------------------------- transient pieces
  let countNode = null;
  function countdown(n) {
    countNode?.remove();
    countNode = el('div', `bb-count${n === 'GO' ? ' go' : ''}`, `<span>${esc(n === 'GO' ? 'GO!' : n)}</span>`);
    hudLayer.append(countNode);
    const mine = countNode;
    setTimeout(() => mine.remove(), n === 'GO' ? 700 : 950);
  }
  let bannerNode = null;
  let bannerT = 0;
  function banner(text, kind = 'round', ms = 1600) {
    bannerNode?.remove();
    bannerNode = el('div', `bb-bigbanner k-${kind}`, `<span>${esc(text)}</span>`);
    hudLayer.append(bannerNode);
    const mine = bannerNode;
    clearTimeout(bannerT);
    bannerT = setTimeout(() => {
      mine.classList.add('out');
      setTimeout(() => mine.remove(), 300);
    }, ms);
  }
  const callNodes = [null, null, null];
  function callout(i, text) {
    const slot = i === 0 || i === 1 ? i : 2;
    callNodes[slot]?.remove();
    const kind = /BONK/i.test(text) ? 'bonk' : /BLOCK/i.test(text) ? 'block' : /CLASH/i.test(text) ? 'clash' : 'info';
    const n = el('div', `bb-call c${slot} k-${kind}`, `<span>${esc(text)}</span>`);
    callNodes[slot] = n;
    hudLayer.append(n);
    setTimeout(() => {
      n.classList.add('out');
      setTimeout(() => n.remove(), 300);
    }, 800);
  }
  function hint(text) {
    if (!hudEls.hint) buildHud();
    hudEls.hint.hidden = !text;
    if (text) hudEls.hint.textContent = text;
  }

  buildHud();
  return {
    on(ev, cb) {
      if (!handlers.has(ev)) handlers.set(ev, new Set());
      handlers.get(ev).add(cb);
      return () => handlers.get(ev).delete(cb);
    },
    showTitle,
    showLobby,
    showPause,
    showResults,
    hideAll,
    hud,
    countdown,
    banner,
    callout,
    hint,
    setStatus,
    nav,
    getConfig: () => ({ ...cfg }),
    get screen() { return screen; },
  };
}
