/**
 * Exemoo game SDK. A game running inside the Exemoo shell (at /play/<id>/) imports this to get the
 * phone that the shell already paired:
 *
 *   const exemoo = (await import('/sdk/exemoo.js')).connectExemoo({ layout: 'swing', title: 'Golf' });
 *   exemoo.on('packet', (p) => …);        // SEN2 at ~60 Hz: {seq, t, q:{x,y,z,w}, acc, gyro, buttons}
 *                                          // + at: sample time in epoch ms (performance.timeOrigin + now), clock-synced
 *   exemoo.on('button', (b) => …);        // 'action' | 'pause' | 'recenter' | 'up' | … | 'back'
 *   exemoo.on('status', (s) => …);        // {connected, transport, latency, pin, padUrl}
 *   exemoo.on('message', (m) => …);       // other phone messages, e.g. {t:'calibrate', phase}
 *   exemoo.on('pose', (pose) => …);        // camera assist: {wrist:{x,y}, elbow, shoulder, scale, visible} (0…1, mirrored)
 *                                          // + at (epoch ms) and world: 3D landmarks in metres (see /js/camera.js)
 *   // With camera assist on, packet.q is heading-corrected against the camera and packet.cam = wrist position.
 *   exemoo.held(p, 'action');             // is a button held in this packet?
 *   exemoo.haptic(30);  exemoo.setLayout('remote');  exemoo.setStream(false);  exemoo.exit();
 *
 * Outside the shell (game opened directly) `inShell` is false, nothing fires and the methods do
 * nothing, so the game can fall back to mouse/keyboard.
 *
 * Layouts: 'swing' (hold-to-swing button + motion), 'slice' (whole-screen blade + motion),
 * 'remote' (GO / Pause / Back, no motion). Motion streams by default in swing and slice.
 * `buttons` adds game-specific pad buttons: [{b:'minus', label:'-'}, {b:'map', label:'Map'}].
 * `keys` turns phone buttons into keyboard presses for games that only read the keyboard:
 *   connectExemoo({ keys: { action: 'Space', pause: 'Escape', left: 'ArrowLeft' } })
 */
const BUTTON_ORDER = ['action', 'pause', 'recenter', 'up', 'down', 'left', 'right', 'back', 'power', 'home'];

/** True when this page runs inside the Exemoo shell. */
export const inExemooShell = () => typeof window !== 'undefined' && window.parent !== window;

/** Dispatch a keydown + keyup for a KeyboardEvent.code (e.g. 'Space', 'ArrowLeft', 'KeyP'). */
export function pressKey(code) {
  const key = { Space: ' ', Escape: 'Escape', Enter: 'Enter' }[code] ?? (code.startsWith('Arrow') ? code : code.replace(/^Key|^Digit/, '').toLowerCase());
  const target = document.activeElement && document.activeElement !== document.body ? document.activeElement : window;
  for (const type of ['keydown', 'keyup']) target.dispatchEvent(new KeyboardEvent(type, { code, key, bubbles: true, cancelable: true }));
}

/**
 * One step of the air cursor: phone rotation rate (deg/s) moves the ring. Same axes as the Exemoo
 * menu pointer: gyro.beta sweeps left/right, gyro.alpha up/down. `dt` in seconds, `bounds` = {w,h}.
 * Returns the new position and whether the phone is moving (past the 3 deg/s dead zone).
 */
export function stepAirCursor({ x, y }, gyro, dt, speed, { w, h }) {
  const gx = Math.abs(gyro?.beta) > 3 ? gyro.beta : 0;
  const gy = Math.abs(gyro?.alpha) > 3 ? gyro.alpha : 0;
  return {
    x: Math.max(4, Math.min(w - 4, x - gx * dt * speed)),
    y: Math.max(4, Math.min(h - 4, y - gy * dt * speed)),
    moving: !!(gx || gy),
  };
}

/** Pad layouts whose sensor stream is on by default (the others only stream when asked to). */
export const layoutStreams = (layout) => layout === 'swing' || layout === 'slice';

/**
 * `menuCursor`: () => boolean. Pass it and the phone's gyro drives an on-screen ring over the game's
 * menus while it returns true (title, lobby, pause, results...). Action then clicks the button under
 * the ring via nav(), and the d-pad keeps moving focus. Layouts that don't stream motion ('remote')
 * get the stream switched on only while the menu is up.
 */
export function connectExemoo({ layout, title, stream, buttons, keys, menuCursor } = {}) {
  const inShell = typeof window !== 'undefined' && window.parent !== window;
  const listeners = new Map();
  /** pin / padUrl: the shell's pairing room, for games that show their own QR. */
  const phone = { connected: false, transport: 'none', latency: 0, pin: '', padUrl: '' };
  const post = (msg) => {
    if (inShell) window.parent.postMessage({ exemoo: 1, ...msg }, location.origin);
  };
  let curLayout = layout, streamSent = null, airApi = null, cursorOn = false;
  /** Switch the sensor stream on only while the menu cursor needs it and the layout doesn't stream anyway. */
  const syncStream = () => {
    const want = cursorOn || (stream ?? layoutStreams(curLayout));
    if (streamSent === null && !cursorOn) return;
    if (want === streamSent) return;
    streamSent = want;
    post({ type: 'stream', on: want });
  };
  const emit = (ev, arg) => {
    for (const cb of listeners.get(ev) || []) {
      try {
        cb(arg);
      } catch (e) {
        console.error(`[exemoo sdk] ${ev} listener failed`, e);
      }
    }
  };

  if (inShell) {
    window.addEventListener('message', (e) => {
      if (e.source !== window.parent || e.origin !== location.origin) return;
      const d = e.data;
      if (!d || d.exemoo !== 1) return;
      if (d.type === 'status') {
        Object.assign(phone, { connected: !!d.connected, transport: d.transport, latency: d.latency, pin: d.pin || '', padUrl: d.padUrl || '' });
        emit('status', { ...phone });
      } else if (d.type === 'packet') emit('packet', d.p);
      else if (d.type === 'pose') emit('pose', d.pose);
      else if (d.type === 'camera') emit('camera', !!d.on);
      else if (d.type === 'button') {
        // Action while the menu cursor rests on a button clicks that button (the game never sees the press).
        const under = d.b === 'action' ? airApi?.hot() : null;
        if (under && !under.disabled) {
          under.click();
          return;
        }
        if (keys?.[d.b]) pressKey(keys[d.b]);
        emit('button', d.b);
      }
      else if (d.type === 'message') emit('message', d.m);
    });
    post({ type: 'ready', layout, title, stream, buttons });
  }

  const api = {
    inShell,
    phone,
    on(ev, cb) {
      if (!listeners.has(ev)) listeners.set(ev, new Set());
      listeners.get(ev).add(cb);
      return () => listeners.get(ev)?.delete(cb);
    },
    /** True if `button` is held in a sensor packet's bitmask. */
    held(packet, button) {
      const i = BUTTON_ORDER.indexOf(button);
      return i >= 0 && !!(packet.buttons & (1 << i));
    },
    /** `buttons`: extra pad buttons for this game, e.g. [{b:'map', label:'Map'}] (sent back as button events). */
    setLayout(l, t, buttons) {
      curLayout = l;
      post({ type: 'layout', layout: l, title: t, buttons });
      if (streamSent !== null) {
        // The pad resets its stream choice on a layout change: say again what the menu cursor needs.
        streamSent = cursorOn || (stream ?? layoutStreams(curLayout));
        post({ type: 'stream', on: streamSent });
      }
    },
    setStream: (on) => post({ type: 'stream', on: !!on }),
    haptic: (pattern = 20) => post({ type: 'haptic', pattern }),
    /** Send a raw control message to the phone (e.g. {t:'theme', color:'#ff6b4a'}). */
    send: (m) => post({ type: 'send', m }),
    /** Ask the shell to turn camera assist on/off (the player still grants camera permission). */
    setCamera: (on) => post({ type: 'camera', on: !!on }),
    /** Back to the Exemoo menu. */
    exit: () => post({ type: 'exit' }),
    /**
     * Air cursor inside the game: the phone's rotation moves a ring over the page (like the Exemoo menu),
     * shown while `active()` is true. `hot()` is the button under it, for the game to click on Action.
     */
    airCursor({ active = () => true, speed = 9 } = {}) {
      const ring = document.createElement('div');
      ring.style.cssText = 'position:fixed;left:0;top:0;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;border:5px solid #1b1b3a;background:#ffd21fcc;box-shadow:0 4px 0 #1b1b3a;pointer-events:none;z-index:99999;opacity:0;transition:opacity .25s,transform .05s';
      document.body.append(ring);
      let x = innerWidth / 2, y = innerHeight / 2, lastT = 0, idle = 0, hot = null;
      const mark = (el) => {
        if (el === hot) return;
        if (hot) hot.style.outline = '';
        hot = el;
        if (hot) {
          hot.style.outline = '5px solid #ffd21f';
          hot.style.outlineOffset = '3px';
          post({ type: 'haptic', pattern: 8 });
        }
      };
      this.on('packet', (p) => {
        const dt = lastT ? Math.min(0.1, (((p.t - lastT) >>> 0) || 16) / 1000) : 0;
        lastT = p.t;
        if (!active()) {
          ring.style.opacity = '0';
          return mark(null);
        }
        const s = stepAirCursor({ x, y }, p.gyro, dt, speed, { w: innerWidth, h: innerHeight });
        if (s.moving) idle = 0;
        else idle += dt;
        ({ x, y } = s);
        ring.style.transform = `translate(${x}px,${y}px)`;
        ring.style.opacity = idle < 4 ? '1' : '0';
        mark(idle < 4 ? document.elementFromPoint(x, y)?.closest('button, a, [role=button], input, select, [data-nav]') ?? null : null);
      });
      // Menus can appear while the phone is still (no packets): re-check so the stream and ring follow.
      setInterval(() => {
        const on = !!active();
        if (!on) {
          ring.style.opacity = '0';
          mark(null);
        }
        if (cursorOn !== on) {
          cursorOn = on;
          syncStream();
        }
      }, 200);
      airApi = { hot: () => (hot?.isConnected ? hot : null), center: () => ((x = innerWidth / 2), (y = innerHeight / 2)) };
      return airApi;
    },
    /**
     * Phone d-pad / Action over the page's visible <button>s (for HTML menus). Returns false when no
     * button is visible (e.g. mid-game), so the caller can treat the press as gameplay instead.
     */
    nav(b, { skip = '' } = {}) {
      const list = [...document.querySelectorAll('button')].filter(
        (el) => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && !el.disabled && !(skip && el.matches(skip)),
      );
      if (!list.length) return false;
      const cur = list.indexOf(document.activeElement);
      if (b === 'action') (cur >= 0 ? list[cur] : list[0]).click();
      else if (['up', 'down', 'left', 'right'].includes(b)) {
        const next = list[(cur + (b === 'up' || b === 'left' ? -1 : 1) + list.length) % list.length];
        next.focus();
        next.scrollIntoView?.({ block: 'nearest' });
      } else return false;
      return true;
    },
  };
  if (inShell && typeof menuCursor === 'function') {
    const start = () => api.airCursor({ active: menuCursor });
    if (document.body) start();
    else addEventListener('DOMContentLoaded', start, { once: true });
  }
  return api;
}
