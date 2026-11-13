// Bumper Carts UI: DOM screens (title, lobby, pause, results) and the in-round HUD. No game logic here.
// Contract: PLAN.md 5.4. Styles live in ../ui.css (classes start with bc-).
// Menus work with mouse, Tab, arrow keys + Enter, and the phone d-pad through ui.nav(button).
//
// Events (ui.on): start(cfg) pause resume restart again changePlayers exit mute lobbyBack lobbyReady
// cfg = { cpu: boolean, level: 'easy'|'normal'|'hard', seconds: 60|90|120 }

const STORE = 'bumper-carts.cfg';
const LEVELS = [
  ['easy', 'Easy'],
  ['normal', 'Normal'],
  ['hard', 'Hard'],
];
const LENGTHS = [
  [60, '60 s'],
  [90, '90 s'],
  [120, '120 s'],
];

const ICONS = {
  mark: `<svg viewBox="0 0 120 100" class="bc-mark" aria-hidden="true">
    <ellipse cx="60" cy="88" rx="50" ry="8" fill="#1b1b3a" opacity=".2"/>
    <rect x="16" y="44" width="88" height="40" rx="14" fill="#d9a455" stroke="#1b1b3a" stroke-width="5"/>
    <rect x="8" y="54" width="104" height="30" rx="15" fill="#ff7a1f" stroke="#1b1b3a" stroke-width="5"/>
    <path d="M26 62h26" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5"/>
    <circle cx="60" cy="30" r="20" fill="#fff" stroke="#1b1b3a" stroke-width="5"/>
    <path d="M44 18l-8-12 14 4M76 18l8-12-14 4" fill="#fff" stroke="#1b1b3a" stroke-width="4" stroke-linejoin="round"/>
    <ellipse cx="64" cy="36" rx="11" ry="8" fill="#ffb3b8" stroke="#1b1b3a" stroke-width="3.5"/>
    <circle cx="53" cy="26" r="3" fill="#1b1b3a"/><circle cx="68" cy="26" r="3" fill="#1b1b3a"/>
    <path d="M92 46L100 12" stroke="#1b1b3a" stroke-width="4" stroke-linecap="round"/><path d="M100 12l16 5-14 8z" fill="#ffd21f" stroke="#1b1b3a" stroke-width="3.5" stroke-linejoin="round"/></svg>`,
  tilt: `<svg viewBox="0 0 48 48" aria-hidden="true"><g transform="rotate(-16 24 28)"><rect x="6" y="22" width="36" height="16" rx="5" fill="#fff" stroke="#1b1b3a" stroke-width="3"/>
    <rect x="10" y="26" width="28" height="8" rx="2" fill="#2f7cff"/></g><path d="M8 14c6-7 18-8 28-1" fill="none" stroke="#ff7a1f" stroke-width="4" stroke-linecap="round"/><path d="M33 7l5 6-8 2" fill="none" stroke="#ff7a1f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  charge: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="12" y="18" width="30" height="20" rx="8" fill="#d9a455" stroke="#1b1b3a" stroke-width="3"/>
    <rect x="9" y="24" width="36" height="14" rx="7" fill="#ff3b30" stroke="#1b1b3a" stroke-width="3"/><circle cx="29" cy="14" r="7" fill="#fff" stroke="#1b1b3a" stroke-width="3"/>
    <path d="M2 22h6M0 29h8M3 36h5" stroke="#ffd21f" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  fence: `<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="12" width="8" height="26" rx="2" fill="#fff" stroke="#1b1b3a" stroke-width="3"/>
    <path d="M34 12h8v26h-8z" fill="#fff" stroke="#1b1b3a" stroke-width="3" stroke-linejoin="round"/><path d="M16 38l4-14 6 4-3 10z" fill="#fff" stroke="#1b1b3a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M4 44c5-3 9 2 14 0s8-3 12 0 8 2 14 0" fill="none" stroke="#8a5a2b" stroke-width="4" stroke-linecap="round"/><path d="M22 10l2-6 3 5" fill="none" stroke="#ffd21f" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  crown: `<svg viewBox="0 0 40 30" aria-hidden="true"><path d="M4 26L2 8l10 8 8-12 8 12 10-8-2 18z" fill="#ffd21f" stroke="#1b1b3a" stroke-width="3" stroke-linejoin="round"/></svg>`,
  storm: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L4 14h6l-2 8 10-13h-6z" fill="#ffd21f" stroke="#1b1b3a" stroke-width="2" stroke-linejoin="round"/></svg>`,
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const ORD = ['1st', '2nd', '3rd', '4th'];

function loadCfg() {
  const d = { cpu: true, level: 'normal', seconds: 90 };
  try {
    const s = JSON.parse(localStorage.getItem(STORE) || '{}');
    if (typeof s.cpu === 'boolean') d.cpu = s.cpu;
    if (LEVELS.some(([k]) => k === s.level)) d.level = s.level;
    if (LENGTHS.some(([k]) => k === s.seconds)) d.seconds = s.seconds;
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
  const host = el('div', 'bc-ui');
  root.append(host);
  const handlers = new Map();
  const emit = (ev, arg) => (handlers.get(ev) || []).forEach((cb) => cb(arg));
  const cfg = loadCfg();
  let screen = null; // 'title' | 'lobby' | 'pause' | 'results' | null
  let focused = null;
  let status = { muted: false };

  const menuLayer = el('div', 'bc-layer');
  const hudLayer = el('div', 'bc-layer bc-hudlayer');
  host.append(hudLayer, menuLayer);

  // ----------------------------------------------------------------- focus + nav
  const menuButtons = () => (screen ? [...menuLayer.querySelectorAll('button')].filter((b) => !b.disabled && b.offsetParent !== null && !b.closest('[inert]')) : []);
  function setFocus(btn) {
    if (focused && focused !== btn) focused.classList.remove('bc-focus');
    focused = btn || null;
    if (focused) {
      focused.classList.add('bc-focus');
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
    const b = el('button', `bc-btn ${cls || ''}`, esc(label));
    b.type = 'button';
    if (primary) b.dataset.primary = '1';
    b.addEventListener('click', onClick);
    return b;
  };
  function optGroup(label, options, getValue, setValue, cls = '') {
    const g = el('div', 'bc-optgroup');
    g.append(el('div', 'bc-label', esc(label)));
    const row = el('div', 'bc-opts');
    const btns = options.map(([v, text]) => {
      const b = el('button', `bc-opt ${cls}`, esc(text));
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
  const chip = (text, ok) => `<span class="bc-chip${ok ? ' ok' : ''}"><i></i>${esc(text)}</span>`;

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
    const card = el('div', 'bc-card bc-title-card');
    card.append(el('div', 'bc-logo', `${ICONS.mark}<div class="bc-logo-text">BUMPER<span>CARTS</span></div>`));
    card.append(el('div', 'bc-tag', 'Tilt, charge, bump!'));

    const setup = el('div', 'bc-setup');
    const cpu = optGroup(
      'CPU rivals',
      [
        [true, 'On'],
        [false, 'Off'],
      ],
      () => cfg.cpu,
      (v) => {
        cfg.cpu = v;
        saveCfg(cfg);
        setLevelVisible(v);
      },
    );
    const level = optGroup('CPU level', LEVELS, () => cfg.level, (v) => ((cfg.level = v), saveCfg(cfg)), 'word');
    const len = optGroup('Round', LENGTHS, () => cfg.seconds, (v) => ((cfg.seconds = v), saveCfg(cfg)), 'word');
    // keep the level row's space reserved when CPU is off so the card never changes size
    function setLevelVisible(on) {
      level.node.classList.toggle('bc-reserved', !on);
      level.node.inert = !on;
      level.node.setAttribute('aria-hidden', String(!on));
    }
    setLevelVisible(cfg.cpu);
    setup.append(cpu.node, level.node, len.node);
    card.append(setup);

    const how = el('div', 'bc-how');
    how.innerHTML = `<div>${ICONS.tilt}<b>Hold flat, tilt</b><span>Your phone is the wheel</span></div>
      <div>${ICONS.charge}<b>Hold to charge</b><span>Let go to ram</span></div>
      <div>${ICONS.fence}<b>Break the fence</b><span>Knock them in the mud</span></div>`;
    card.append(how);
    card.append(el('div', 'bc-fallback', 'No phone? P1: W A S D + Space. P2: arrows + Enter. P3: I J K L + U. P4: numpad 8 4 5 6 + 0.'));
    card.append(button('START', 'green big', () => emit('start', { ...cfg }), true));

    const row = el('div', 'bc-statusrow');
    const mute = button('', 'small blue', () => emit('mute'));
    row.append(mute, button('Exit', 'small yellow', () => emit('exit')));
    card.append(row);
    titleNodes = { mute };
    renderStatus();
    const wrap = el('div', 'bc-menu');
    wrap.append(card);
    show('title', wrap);
  }
  function renderStatus() {
    const label = status.muted ? 'Sound: off' : 'Sound: on';
    if (titleNodes) titleNodes.mute.textContent = label;
    if (hudEls.status) hudEls.status.textContent = status.muted ? 'Muted (M)' : 'M mutes';
  }
  function setStatus(s) {
    status = { muted: !!s?.muted };
    renderStatus();
  }

  // ----------------------------------------------------------------- lobby
  let lobbyEls = null;
  function seatCardHtml(c) {
    let body;
    if (c.note) body = `<div class="bc-note">${esc(c.note)}</div>`;
    else if (c.joined) body = `<div class="bc-ready">${chip(c.connected ? 'Phone ready' : 'Keys ready', true)}</div>`;
    else {
      body = `${c.qrSrc ? `<img class="bc-qr" src="${esc(c.qrSrc)}" alt="QR code" width="112" height="112">` : '<div class="bc-qr empty">...</div>'}
        <div class="bc-pin">${c.pin ? esc(c.pin) : '----'}</div>
        <div class="bc-pinurl">${c.url ? 'or open ' + esc(c.url) : 'Getting a code...'}</div>`;
    }
    const tag = !c.joined && !c.note && c.cpu ? '<div class="bc-cputag">CPU if empty</div>' : '';
    return `<div class="bc-pcard${c.joined ? ' joined' : ''}" style="--pc:${esc(c.color)}"><div class="bc-pname">${esc(c.label)}</div>${body}${tag}
      ${c.keysHelp ? `<div class="bc-keys">or keys: ${esc(c.keysHelp)}</div>` : ''}</div>`;
  }
  function lobbyFill(cards, { note = '', canStart = true } = {}) {
    lobbyEls.cards.innerHTML = cards.map(seatCardHtml).join('');
    lobbyEls.note.textContent = note;
    lobbyEls.go.disabled = !canStart;
    lobbyEls.go.classList.toggle('bc-off', !canStart);
  }
  /** cards: [{label,color,joined,connected,pin,url,qrSrc,note,keysHelp,cpu}] x4. opts: {note, canStart}. */
  function showLobby(cards, opts = {}) {
    if (screen === 'lobby' && lobbyEls) {
      lobbyFill(cards, opts);
      return;
    }
    hideHud();
    const card = el('div', 'bc-card bc-lobby-card');
    card.append(el('h2', 'bc-h', 'Pick your carts'));
    const grid = el('div', 'bc-pcards');
    card.append(grid);
    const note = el('div', 'bc-fallback');
    card.append(note);
    const row = el('div', 'bc-actions');
    const go = button("Let's bump!", 'green big', () => emit('lobbyReady'), true);
    row.append(button('Back', 'yellow', () => emit('lobbyBack')), go);
    card.append(row);
    lobbyEls = { cards: grid, note, go };
    lobbyFill(cards, opts);
    const wrap = el('div', 'bc-menu');
    wrap.append(card);
    show('lobby', wrap);
  }

  // ----------------------------------------------------------------- pause + results
  function showPause(on) {
    if (!on) {
      if (screen === 'pause') hideAll();
      return;
    }
    const card = el('div', 'bc-card bc-pause-card');
    card.append(el('h2', 'bc-h', 'Paused'));
    card.append(
      button('Resume', 'green', () => emit('resume'), true),
      button('Restart', 'blue', () => emit('restart')),
      button(status.muted ? 'Sound: off' : 'Sound: on', 'yellow', () => emit('mute')),
      button('Exit', 'red', () => emit('exit')),
    );
    const wrap = el('div', 'bc-menu dim');
    wrap.append(card);
    show('pause', wrap);
  }
  /** d = { ranking: seats best first, names[], colors[], scores[] } (indexed by seat). */
  function showResults(d) {
    hideHud();
    const card = el('div', 'bc-card bc-results-card');
    const win = d.ranking[0];
    const b = el('div', 'bc-banner', `${ICONS.crown}<span>${esc(d.names[win])} wins!</span>`);
    b.style.setProperty('--pc', d.colors[win]);
    card.append(b);
    // podium order on screen: 2nd, 1st, 3rd, then 4th
    const order = [1, 0, 2, 3].filter((k) => d.ranking[k] != null);
    const pod = el('div', 'bc-podium');
    pod.innerHTML = order
      .map((k) => {
        const s = d.ranking[k];
        return `<div class="bc-step p${k}${k === 0 ? ' win' : ''}" style="--pc:${esc(d.colors[s])}">
          <div class="bc-pn">${k === 0 ? ICONS.crown : ''}<span>${esc(d.names[s])}</span></div>
          <div class="bc-block"><small>${ORD[k]}</small><b>${d.scores[s]}</b><em>KO${d.scores[s] === 1 ? '' : 's'}</em></div></div>`;
      })
      .join('');
    card.append(pod);
    const row = el('div', 'bc-actions');
    row.append(button('Play again', 'green', () => emit('again'), true), button('Change players', 'blue', () => emit('changePlayers')), button('Exit', 'red', () => emit('exit')));
    card.append(row);
    const wrap = el('div', 'bc-menu dim');
    wrap.append(card);
    show('results', wrap);
  }
  function hideAll() {
    screen = null;
    lobbyEls = null;
    titleNodes = null;
    menuLayer.replaceChildren();
    host.dataset.screen = '';
    if (focused) focused.classList.remove('bc-focus');
    focused = null;
  }

  // ----------------------------------------------------------------- HUD
  const hudEls = { chips: [] };
  function buildHud() {
    const bar = el('div', 'bc-bar');
    const mkChip = (i) => {
      const n = el('div', `bc-seat s${i}`);
      n.innerHTML = '<div class="bc-sname"><span class="nm"></span><span class="cpu">CPU</span></div><div class="bc-score">0</div>';
      hudEls.chips[i] = { node: n, nm: n.querySelector('.nm'), cpu: n.querySelector('.cpu'), score: n.querySelector('.bc-score'), key: '', last: 0 };
      return n;
    };
    const mid = el('div', 'bc-mid');
    mid.innerHTML = '<div class="bc-timer"></div><div class="bc-stormtag">' + ICONS.storm + '<span>BARN STORM</span></div>';
    hudEls.mid = mid;
    hudEls.timer = mid.querySelector('.bc-timer');
    hudEls.stormtag = mid.querySelector('.bc-stormtag');
    bar.append(mkChip(0), mkChip(1), mid, mkChip(2), mkChip(3));
    hudEls.bar = bar;
    hudEls.hint = el('div', 'bc-hint');
    hudEls.hint.hidden = true;
    hudEls.status = el('div', 'bc-status');
    hudEls.status.hidden = true;
    hudEls.pause = button('II', 'small blue bc-pausebtn', () => emit('pause'));
    hudEls.pause.title = 'Pause (Esc)';
    hudEls.pause.tabIndex = -1;
    hudEls.pause.addEventListener('click', () => hudEls.pause.blur()); // keep Space free for charging
    hudEls.pause.hidden = true;
    bar.hidden = true;
    hudLayer.append(bar, hudEls.hint, hudEls.status, hudEls.pause);
    renderStatus();
  }
  function hideHud() {
    if (!hudEls.bar) return;
    hudEls.bar.hidden = true;
    hudEls.pause.hidden = true;
    hudEls.status.hidden = true;
    hudLayer.querySelectorAll('.bc-call').forEach((n) => n.remove());
    hint(null);
  }
  /** d = { seats: [{name,color,score,state,cpu} | null] x4, timeLeft, storm, sudden } */
  function hud(d) {
    if (!hudEls.bar) buildHud();
    if (!d) return hideHud();
    hudEls.bar.hidden = false;
    hudEls.pause.hidden = false;
    hudEls.status.hidden = false;
    for (let i = 0; i < 4; i++) {
      const h = hudEls.chips[i];
      const s = d.seats?.[i];
      h.node.hidden = !s;
      if (!s) continue;
      const key = `${s.name}|${s.color}|${!!s.cpu}`;
      if (key !== h.key) {
        h.key = key;
        h.node.style.setProperty('--pc', s.color);
        h.nm.textContent = s.name;
        h.cpu.hidden = !s.cpu;
      }
      if (h.score.textContent !== String(s.score)) {
        h.score.textContent = String(s.score);
        if (s.score > h.last) {
          h.score.classList.remove('bump');
          void h.score.offsetWidth;
          h.score.classList.add('bump');
        }
      }
      h.last = s.score;
      h.node.classList.toggle('down', s.state === 'fall' || s.state === 'out');
    }
    const tt = d.sudden ? 'SUDDEN DEATH' : String(Math.max(0, Math.ceil(d.timeLeft)));
    if (hudEls.timer.textContent !== tt) hudEls.timer.textContent = tt;
    hudEls.timer.classList.toggle('sudden', !!d.sudden);
    hudEls.timer.classList.toggle('storm', !!d.storm && !d.sudden);
    hudEls.timer.classList.toggle('low', !d.storm && !d.sudden && d.timeLeft <= 10);
    hudEls.stormtag.hidden = !(d.storm && !d.sudden);
  }

  // ----------------------------------------------------------------- transient pieces
  let countNode = null;
  function countdown(n) {
    countNode?.remove();
    countNode = el('div', `bc-count${n === 'GO' ? ' go' : ''}`, `<span>${esc(n === 'GO' ? 'GO!' : n)}</span>`);
    hudLayer.append(countNode);
    const mine = countNode;
    setTimeout(() => mine.remove(), n === 'GO' ? 700 : 950);
  }
  let bannerNode = null;
  let bannerT = 0;
  function banner(text, kind = 'round', ms = 1600) {
    bannerNode?.remove();
    bannerNode = el('div', `bc-bigbanner k-${kind}`, `<span>${esc(text)}</span>`);
    hudLayer.append(bannerNode);
    const mine = bannerNode;
    clearTimeout(bannerT);
    bannerT = setTimeout(() => {
      mine.classList.add('out');
      setTimeout(() => mine.remove(), 300);
    }, ms);
  }
  const callNodes = new Map();
  /** Pop-up on seat i's score chip ("KO!", "OOPS"), or mid-screen for i = -1 ("CLASH"). */
  function callout(i, text) {
    if (!hudEls.bar) buildHud();
    const chipEl = i >= 0 ? hudEls.chips[i]?.node : null;
    const parent = chipEl && !chipEl.hidden ? chipEl : hudLayer;
    const key = chipEl && !chipEl.hidden ? i : -1;
    callNodes.get(key)?.remove();
    const kind = /KO/i.test(text) ? 'ko' : /OOPS/i.test(text) ? 'oops' : /CLASH/i.test(text) ? 'clash' : 'info';
    const n = el('div', `bc-call ${key >= 0 ? 'onchip' : 'mid'} k-${kind}`, `<span>${esc(text)}</span>`);
    callNodes.set(key, n);
    parent.append(n);
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
