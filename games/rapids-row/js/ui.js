// Rapids Row UI: menus, HUD, toasts, results. Requires ../style.css and Lilita One / Baloo 2 fonts.
const INK = '#1b1b3a';
const ICON = {
  paddle: `<svg viewBox="0 0 32 32"><path d="M6 26 L22 10" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M6 26 L22 10" stroke="#ffe08a" stroke-width="3" stroke-linecap="round"/><ellipse cx="24" cy="8" rx="8" ry="4.5" transform="rotate(-45 24 8)" fill="#fff" stroke="${INK}" stroke-width="3"/></svg>`,
  coin: `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="#ffd21f" stroke="${INK}" stroke-width="3.5"/><circle cx="16" cy="16" r="8" fill="none" stroke="#c79a00" stroke-width="2.5"/><path d="M16 11v10" stroke="#c79a00" stroke-width="3" stroke-linecap="round"/></svg>`,
  star: `<svg viewBox="0 0 64 64"><path d="M32 5 L40 24 L60 25 L44 38 L50 58 L32 46 L14 58 L20 38 L4 25 L24 24Z" fill="#ffd21f" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M32 14 L36 26" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/></svg>`,
  check: `<svg viewBox="0 0 40 40"><path d="M8 21 L17 30 L33 11" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  canoe: `<svg viewBox="0 0 170 80" class="canoe"><path d="M6 40 Q40 76 85 76 Q130 76 164 40 Q130 50 85 50 Q40 50 6 40Z" fill="#8a5326" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><circle cx="55" cy="22" r="13" fill="#ff3b30" stroke="${INK}" stroke-width="4"/><circle cx="115" cy="22" r="13" fill="#2f7cff" stroke="${INK}" stroke-width="4"/><rect x="42" y="30" width="26" height="18" rx="8" fill="#ff3b30" stroke="${INK}" stroke-width="4"/><rect x="102" y="30" width="26" height="18" rx="8" fill="#2f7cff" stroke="${INK}" stroke-width="4"/><path d="M6 40 Q40 52 85 52 Q130 52 164 40 Q130 30 85 30 Q40 30 6 40Z" fill="#e0953f" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/></svg>`,
  tinyBoat: `<svg viewBox="0 0 52 30"><path d="M2 14 Q14 28 26 28 Q38 28 50 14 Q38 18 26 18 Q14 18 2 14Z" fill="#e0953f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="18" cy="8" r="6" fill="#ff3b30" stroke="${INK}" stroke-width="2.5"/><circle cx="34" cy="8" r="6" fill="#2f7cff" stroke="${INK}" stroke-width="2.5"/></svg>`,
  circle: `<svg viewBox="0 0 80 80"><rect x="26" y="14" width="28" height="48" rx="6" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="40" cy="55" r="2.5" fill="${INK}"/><path d="M62 26 A24 24 0 1 1 20 30" fill="none" stroke="#2f7cff" stroke-width="5" stroke-linecap="round"/><path d="M12 22 L20 32 L30 24" fill="none" stroke="#2f7cff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  sync: `<svg viewBox="0 0 80 80"><circle cx="22" cy="40" r="14" fill="#ff3b30" stroke="${INK}" stroke-width="4"/><circle cx="58" cy="40" r="14" fill="#2f7cff" stroke="${INK}" stroke-width="4"/><path d="M36 40 H44" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M22 14 V8 M58 14 V8" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M40 70 V58 M34 64 L40 70 L46 64" fill="none" stroke="#2fc65a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  back: `<svg viewBox="0 0 80 80"><circle cx="40" cy="42" r="26" fill="#ff9a1f" stroke="${INK}" stroke-width="4"/><circle cx="40" cy="42" r="15" fill="#ffd9a0" stroke="${INK}" stroke-width="3"/><path d="M52 14 A28 28 0 0 0 20 22" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M14 12 L20 24 L32 20" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};
const REV = '↺';

function h(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function btn(label, cls, onClick) {
  const b = h('button', 'btn ' + (cls || '')); b.type = 'button'; b.textContent = label;
  b.addEventListener('click', () => { try { onClick && onClick(); } catch (err) { console.error(err); } });
  return b;
}
function fmtTime(t) {
  t = Math.max(0, t || 0); const m = Math.floor(t / 60); const s = t - m * 60;
  return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1);
}
function focusPrimary(el) { if (el) setTimeout(() => { try { el.focus({ preventScroll: true }); } catch (e) {} }, 30); }

export function createUI(root) {
  root.classList.add('rr-ui');
  const screenLayer = h('div'); screenLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none';
  const hudEl = h('div', 'hud');
  const toasts = h('div', 'toasts');
  const bannerLayer = h('div'); bannerLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none';
  root.append(hudEl, screenLayer, toasts, bannerLayer);

  let current = null; // {kind, el, ...}
  function setScreen(kind, el) {
    screenLayer.textContent = ''; screenLayer.appendChild(el); current = { kind, el };
  }
  function clearScreen() { screenLayer.textContent = ''; current = null; }

  /* ---------------- Title ---------------- */
  function showTitle({ onPlay, onKeyboard } = {}) {
    const s = h('div', 'screen tint');
    const logo = h('div', 'logo');
    const word = (t) => [...t].map((c) => `<span class="l">${c}</span>`).join('');
    logo.innerHTML = `${word('RAPIDS')}<span class="r2">${word('ROW')}</span>`;
    const play = btn('Play', 'green big', onPlay);
    const kb = btn('Keyboard', 'yellow', onKeyboard);
    const tiles = h('div', 'tiles');
    tiles.innerHTML = `
      <div class="tile">${ICON.circle}Move your phone in <b>circles</b> to paddle</div>
      <div class="tile">${ICON.sync}Left player = <b>red</b>, right player = <i>blue</i>. Paddle in sync to go straight</div>
      <div class="tile">${ICON.back}<b>Hold the big button</b> to back-paddle</div>`;
    const btns = h('div', 'row'); btns.append(play, kb);
    const hint = h('div', 'tag', 'Keyboard: <b>W / S</b> and <b>↑ / ↓</b>'); hint.style.cssText = 'font-size:clamp(14px,2vh,20px);pointer-events:none';
    s.append(h('div', null, ICON.canoe), logo, h('div', 'wave'), h('div', 'tag', 'Two phones. One canoe. Paddle together!'), tiles, btns, hint);
    setScreen('title', s); focusPrimary(play);
  }

  /* ---------------- Map select ---------------- */
  /** maps: [{id, name, blurb, best, color}] — each map is a big button card. */
  function showMaps({ maps = [], selected, onPick, onBack } = {}) {
    const s = h('div', 'screen tint');
    const row = h('div', 'maps');
    let first = null;
    maps.forEach((m, i) => {
      const b = btn('', 'mapcard', () => onPick && onPick(m.id));
      b.style.setProperty('--mc', m.color || '#2f7cff');
      b.innerHTML = `<span class="mnum">MAP ${i + 1}</span><span class="mname">${m.name}</span><span class="mblurb">${m.blurb || ''}</span><span class="mbest">${m.best ? 'Best ' + fmtTime(m.best) : 'No best yet'}</span>`;
      row.appendChild(b);
      if (!first || m.id === selected) first = b;
    });
    const back = btn('Back', 'blue', onBack);
    s.append(h('div', 'big', 'PICK A RIVER'), row, back);
    setScreen('maps', s); focusPrimary(first);
  }

  /* ---------------- Pairing ---------------- */
  let pairing = null;
  function buildPlayerCard(idx) {
    const el = h('div', `card pcard p${idx + 1}`);
    const head = h('div', 'phead', idx === 0 ? 'P1 • Left paddle' : 'P2 • Right paddle');
    const sub = h('div', 'sub');
    const body = h('div', 'body');
    el.append(head, sub, body);
    return { el, sub, body, state: '', qr: null, pin: null, url: null };
  }
  function updateCard(c, idx, p) {
    p = p || {};
    const sub = p.label || (idx === 0 ? 'Uses your Exemoo phone' : 'Scan with a second phone');
    if (c.sub.textContent !== sub) c.sub.textContent = sub;
    const st = p.connected ? 'ok' : 'wait';
    if (st !== c.state) {
      c.state = st; c.body.textContent = '';
      if (st === 'ok') {
        c.body.append(h('div', 'ok', ICON.check), h('div', 'okt', 'Connected!'));
        c.qr = c.pin = c.url = null;
      } else {
        c.qr = h('img', 'qr'); c.qr.alt = 'QR code'; c.pin = h('div', 'pin'); c.url = h('div', 'url');
        c.body.append(c.qr, h('div', null, 'PIN'), c.pin, c.url, h('div', 'wait', 'waiting…'));
        c.body.children[1].style.cssText = 'font-weight:800;font-size:clamp(12px,1.8vh,18px);margin-bottom:-.8vh;opacity:.7';
      }
    }
    if (st === 'wait') {
      if (p.qrSrc && c.qr.getAttribute('src') !== p.qrSrc) c.qr.src = p.qrSrc;
      c.qr.style.display = p.qrSrc ? '' : 'none';
      const pin = p.pin != null ? String(p.pin) : '';
      if (c.pin.textContent !== pin) c.pin.textContent = pin;
      c.pin.style.display = pin ? '' : 'none'; c.body.children[1].style.display = pin ? '' : 'none';
      const url = p.url || '';
      if (c.url.textContent !== url) c.url.textContent = url;
      c.url.style.display = url ? '' : 'none';
    }
  }
  function showPairing({ p1, p2, onStart, onBack } = {}) {
    if (!pairing || !current || current.kind !== 'pairing') {
      const s = h('div', 'screen dim');
      const cards = [buildPlayerCard(0), buildPlayerCard(1)];
      const row = h('div', 'row'); row.style.alignItems = 'stretch'; row.append(cards[0].el, cards[1].el);
      const start = btn('Start', 'green big', () => pairing.onStart && pairing.onStart());
      const back = btn('Back', 'yellow', () => pairing.onBack && pairing.onBack());
      const btns = h('div', 'row'); btns.append(back, start);
      s.append(h('div', 'h1', 'Get your phones ready!'), row, btns);
      pairing = { cards, start, back, onStart, onBack };
      setScreen('pairing', s); focusPrimary(start);
    }
    pairing.onStart = onStart; pairing.onBack = onBack;
    updateCard(pairing.cards[0], 0, p1); updateCard(pairing.cards[1], 1, p2);
    const both = p1 && p1.connected && p2 && p2.connected;
    const lbl = both ? 'Start' : 'Start with keyboard for missing player';
    const t = (p1 && p1.connected) || (p2 && p2.connected) ? (both ? 'Start' : lbl) : 'Start with keyboard';
    if (pairing.start.textContent !== t) pairing.start.textContent = t;
  }

  /* ---------------- Countdown ---------------- */
  function showCountdown(n) {
    const s = h('div', 'screen');
    const c = h('div', 'count' + (n <= 0 ? ' go' : ''), n <= 0 ? 'GO!' : String(n));
    s.appendChild(c); setScreen('countdown', s);
  }

  /* ---------------- HUD ---------------- */
  hudEl.innerHTML = `
    <div class="meter p1"><div class="tag2">${ICON.paddle}<span>P1</span></div><div class="tube"><div class="fill"></div></div><div class="rate"><b>0.0</b>/s</div></div>
    <div class="meter p2"><div class="tag2">${ICON.paddle}<span>P2</span></div><div class="tube"><div class="fill"></div></div><div class="rate"><b>0.0</b>/s</div></div>
    <div class="toppill"><div class="timer">0:00.0</div><div class="chip"></div></div>
    <div class="coins">${ICON.coin}<span class="cn">0</span><small class="ct">/0</small></div>
    <div class="bottom">
      <div class="sync"><span>SYNC</span><div class="bar"><i></i></div><span class="spd">0 km/h</span></div>
      <div class="prog"><div class="pf"><i></i></div><div class="ticks"></div><div class="flag">\u{1F3C1}</div><div class="boat">${ICON.tinyBoat}</div></div>
    </div>`;
  const q = (s) => hudEl.querySelector(s);
  const H = {
    m: [q('.meter.p1'), q('.meter.p2')],
    fill: [q('.meter.p1 .fill'), q('.meter.p2 .fill')],
    tag: [q('.meter.p1 .tag2 span'), q('.meter.p2 .tag2 span')],
    rate: [q('.meter.p1 .rate'), q('.meter.p2 .rate')],
    timer: q('.timer'), chip: q('.chip'), coins: q('.coins'), cn: q('.cn'), ct: q('.ct'),
    sync: q('.sync'), syncBar: q('.sync .bar i'), spd: q('.spd'),
    pf: q('.pf i'), boat: q('.boat'), prog: q('.prog'), ticks: q('.ticks'),
  };
  const last = { timer: '', zone: null, cn: -1, ct: -1, spd: '', rate: ['', ''], rev: [null, null], pw: [-1, -1], sync: -1, hot: null, prog: -1, boat: -1, tick: -1 };
  let gates = [], gateEls = [], progW = 0;
  function setGates(list) {
    gates = Array.isArray(list) ? list.slice() : []; H.ticks.textContent = ''; gateEls = [];
    for (const g of gates) { const t = h('div', 'tick'); t.style.left = (Math.min(1, Math.max(0, g)) * 100) + '%'; H.ticks.appendChild(t); gateEls.push(t); }
    last.tick = -1;
  }
  const hud = {
    setGates,
    show() { hudEl.classList.add('on'); progW = H.prog.clientWidth; },
    hide() { hudEl.classList.remove('on'); },
    update(d) {
      if (!d) return;
      const ts = fmtTime(d.time); if (ts !== last.timer) { last.timer = ts; H.timer.textContent = ts; }
      const zone = d.zone || ''; if (zone !== last.zone) { last.zone = zone; H.chip.textContent = zone; H.chip.style.visibility = zone ? '' : 'hidden'; }
      if (d.coins !== last.cn) { if (last.cn >= 0 && d.coins > last.cn) { H.coins.classList.remove('bump'); void H.coins.offsetWidth; H.coins.classList.add('bump'); } last.cn = d.coins; H.cn.textContent = d.coins; }
      if (d.coinsTotal !== last.ct) { last.ct = d.coinsTotal; H.ct.textContent = '/' + (d.coinsTotal || 0); }
      const kmh = Math.round((d.speed || 0) * 3.6) + ' km/h'; if (kmh !== last.spd) { last.spd = kmh; H.spd.textContent = kmh; }
      for (let i = 0; i < 2; i++) {
        const p = (i ? d.p2 : d.p1) || {};
        const pw = Math.min(1, Math.max(0, p.power || 0));
        if (Math.abs(pw - last.pw[i]) > 0.004) { last.pw[i] = pw; H.fill[i].style.transform = `scaleY(${pw.toFixed(3)})`; }
        const rev = !!p.reverse;
        if (rev !== last.rev[i]) { last.rev[i] = rev; H.m[i].classList.toggle('rev', rev); H.tag[i].textContent = (rev ? REV + ' ' : '') + 'P' + (i + 1); }
        const r = (p.rate || 0).toFixed(1); if (r !== last.rate[i]) { last.rate[i] = r; H.rate[i].firstChild.textContent = r; }
      }
      const sy = Math.min(1, Math.max(0, d.sync || 0));
      if (Math.abs(sy - last.sync) > 0.004) { last.sync = sy; H.syncBar.style.transform = `scaleX(${sy.toFixed(3)})`; const hot = sy > 0.8; if (hot !== last.hot) { last.hot = hot; H.sync.classList.toggle('hot', hot); } }
      const pr = Math.min(1, Math.max(0, d.progress || 0));
      if (Math.abs(pr - last.prog) > 0.0005) {
        last.prog = pr; H.pf.style.transform = `scaleX(${pr.toFixed(4)})`;
        if (!progW) progW = H.prog.clientWidth;
        H.boat.style.transform = `translateX(${(pr * progW).toFixed(1)}px)`;
        if (gateEls.length) for (let i = 0; i < gateEls.length; i++) { const done = pr >= gates[i]; if (done !== gateEls[i]._d) { gateEls[i]._d = done; gateEls[i].classList.toggle('done', done); } }
      }
    },
  };
  window.addEventListener('resize', () => { progW = H.prog.clientWidth; last.prog = -1; });

  /* ---------------- Toast / banner ---------------- */
  function toast(text, color) {
    const t = h('div', 'toast'); t.textContent = text; if (color) t.style.setProperty('--tc', color);
    toasts.appendChild(t);
    while (toasts.children.length > 3) toasts.firstChild.remove();
    setTimeout(() => t.remove(), 2100);
  }
  function banner(text) {
    bannerLayer.textContent = '';
    const b = h('div', 'banner'); b.textContent = text; bannerLayer.appendChild(b);
    setTimeout(() => { if (b.parentNode) b.remove(); }, 2500);
  }

  /* ---------------- Pause ---------------- */
  function showPause({ onResume, onRestart, onQuit } = {}) {
    const s = h('div', 'screen dim');
    const card = h('div', 'card rcard');
    const resume = btn('Resume', 'green big', onResume);
    const col = h('div'); col.style.cssText = 'display:flex;flex-direction:column;gap:2vh;align-items:center;margin-top:1vh';
    const r2 = h('div', 'row'); r2.append(btn('Restart', 'yellow', onRestart), btn('Quit', 'blue', onQuit));
    col.append(resume, r2);
    card.append(h('div', 'big', 'PAUSED'), col);
    s.appendChild(card); setScreen('pause', s); focusPrimary(resume);
  }

  /* ---------------- Results ---------------- */
  function showResults({ time, coins, coinsTotal, best, stars = 1, hits = 0, onAgain, onQuit } = {}) {
    const s = h('div', 'screen dim');
    const conf = h('div', 'confetti');
    const cols = ['#ff3b30', '#ffd21f', '#2f7cff', '#2fc65a', '#fff', '#ff9a1f'];
    for (let i = 0; i < 46; i++) {
      const c = h('i'); const st = c.style;
      st.left = Math.random() * 100 + '%'; st.setProperty('--cc', cols[i % cols.length]);
      st.setProperty('--t', (3 + Math.random() * 3).toFixed(2) + 's'); st.setProperty('--dl', (-Math.random() * 6).toFixed(2) + 's');
      st.setProperty('--dx', (Math.random() * 16 - 8).toFixed(1) + 'vw'); st.setProperty('--rot', (360 + Math.random() * 720).toFixed(0) + 'deg');
      conf.appendChild(c);
    }
    const card = h('div', 'card rcard');
    const starRow = h('div', 'stars');
    for (let i = 0; i < 3; i++) {
      const st = h('div', null, ICON.star).firstChild;
      if (i < stars) { st.style.animationDelay = (0.4 + i * 0.35) + 's'; st.classList.add('on'); } else st.classList.add('off');
      starRow.appendChild(st);
    }
    const isBest = best == null || time <= best;
    const stats = h('div', 'stats');
    stats.innerHTML = `<div class="stat">Coins<b>${coins}/${coinsTotal}</b></div><div class="stat">Best time<b>${best == null ? fmtTime(time) : fmtTime(Math.min(best, time))}</b></div><div class="stat">Bumps<b>${hits}</b></div>`;
    const again = btn('Again', 'green big', onAgain);
    const btns = h('div', 'btns'); btns.append(again, btn('Quit', 'blue', onQuit));
    card.append(h('div', 'h1', 'FINISH!'), h('div', 'big', fmtTime(time)), isBest ? h('div', 'newbest', 'NEW BEST!') : h('div'), starRow, stats, btns);
    s.append(conf, card); setScreen('results', s); focusPrimary(again);
  }

  function hideAll() { clearScreen(); hud.hide(); toasts.textContent = ''; bannerLayer.textContent = ''; pairing = null; }

  return { showTitle, showPairing, showCountdown, hud, toast, banner, showPause, showResults, hideAll, clearScreen, showMaps };
}
