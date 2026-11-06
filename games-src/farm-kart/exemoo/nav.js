// Phone d-pad → Farm Kart's HTML menus. Spatial navigation: a direction moves a focus ring to the nearest
// button that way on the visible screen; GO clicks it; Back presses the screen's back button.
// Menus re-render often (the setup screen rebuilds its cards), so the ring re-attaches by position.
const $ = (id) => document.getElementById(id);
const SCREENS = ['settings', 'pause', 'results', 'setup', 'title'];
/** Button GO presses first on each screen, and the one Back presses. */
const PRIMARY = { title: 'btn-play', setup: 'btn-go', pause: 'btn-resume', results: 'btn-again', settings: 'btn-settings-done' };
const BACK = { setup: 'btn-back', pause: 'btn-resume', settings: 'btn-settings-done', results: 'btn-menu' };

export function createNav() {
  let cur = null, at = null, screen = null;
  const visible = () => SCREENS.map((id) => $(id)).find((el) => el && !el.classList.contains('hidden')) || null;
  const usable = (el) => el.getClientRects().length && !el.disabled && getComputedStyle(el).visibility !== 'hidden';
  const items = (scope) => [...scope.querySelectorAll('button, select, input[type=range]')].filter(usable);
  /** On screen but covered (e.g. by the setup screen's sticky button bar): not a target. */
  const covered = (el) => {
    const { x, y } = mid(el);
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return false;
    const hit = document.elementFromPoint(x, y);
    return !!hit && hit !== el && !el.contains(hit);
  };
  const mid = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const nearest = (list, pt) => list.reduce((b, el) => {
    const c = mid(el), d = Math.hypot(c.x - pt.x, c.y - pt.y);
    return d < b.d ? { el, d } : b;
  }, { el: null, d: Infinity }).el;

  function mark(el) {
    if (cur && cur !== el) cur.classList.remove('fk-focus');
    cur = el;
    if (!el) return;
    el.classList.add('fk-focus');
    at = mid(el);
    el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }

  /** The focused element, re-found after a re-render or screen change. Null if nothing usable. */
  function current() {
    const scope = visible();
    if (!scope) return mark(null), null;
    if (scope !== screen) {
      screen = scope;
      mark(null);
      at = null;
    }
    if (cur && cur.isConnected && scope.contains(cur) && usable(cur)) return cur;
    const list = items(scope);
    if (!list.length) return mark(null), null;
    const prim = $(PRIMARY[scope.id]);
    mark((at && nearest(list, at)) || (prim && list.includes(prim) ? prim : list[0]));
    return cur;
  }

  function move(dir) {
    const from = cur && cur.isConnected ? cur : null;
    const el = current();
    if (!el || !from) return; // first press only shows the ring
    if (el.type === 'range' && (dir === 'left' || dir === 'right')) {
      el.value = +el.value + (dir === 'right' ? 1 : -1) * (+el.step || 1) * 5;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
    const [dx, dy] = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[dir];
    const o = mid(el);
    let best = null, bestScore = Infinity;
    for (const c of items(screen)) {
      if (c === el || covered(c)) continue;
      const p = mid(c), vx = p.x - o.x, vy = p.y - o.y;
      const along = vx * dx + vy * dy;
      if (along <= 4) continue;
      const across = Math.abs(vx * dy - vy * dx);
      const score = along + across * 2.5;
      if (score < bestScore) (best = c), (bestScore = score);
    }
    if (best) mark(best);
  }

  function click() {
    const had = cur && cur.isConnected;
    const el = current();
    if (!el) return;
    if (!had && el.id !== PRIMARY[screen.id]) return; // ring just appeared: show it first
    if (el.tagName === 'SELECT') {
      el.selectedIndex = (el.selectedIndex + 1) % el.options.length;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else el.click();
    // The click may re-render or switch screens: re-attach the ring on the next frame.
    requestAnimationFrame(() => cur && !cur.isConnected && current());
  }

  // Keep the ring on the same spot when a menu re-renders under it.
  setInterval(() => {
    if (cur && (!cur.isConnected || !visible()?.contains(cur))) current();
  }, 250);

  return {
    press: (b) => (b === 'action' ? click() : move(b)),
    back() {
      const s = visible();
      const btn = s && $(BACK[s.id]);
      if (btn && usable(btn)) btn.click();
    },
  };
}
