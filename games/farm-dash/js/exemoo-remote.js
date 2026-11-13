// Exemoo phone remote for Farm Dash: menus with the d-pad, lanes with the d-pad or by tilting the
// phone left/right, jump / roll with up / down (or GO to jump). The webcam still works as before.
import { connectExemoo, pressKey } from '/sdk/exemoo.js';

const inMenu = () => [...document.querySelectorAll('.overlay')].some((o) => o.getClientRects().length && !o.classList.contains('hidden'));

const exemoo = connectExemoo({
  layout: 'remote',
  menuCursor: inMenu, // gyro cursor over the menus
  title: 'Farm Dash',
  stream: true,
  buttons: [
    { b: 'jump', label: 'Jump' },
    { b: 'roll', label: 'Roll' },
  ],
});

const KEY = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', jump: 'ArrowUp', roll: 'ArrowDown', action: 'Space', pause: 'KeyP', back: 'KeyP' };

exemoo.on('button', (b) => {
  if (inMenu() && b !== 'pause' && exemoo.nav(b, { skip: '#mute' })) return;
  if (KEY[b]) pressKey(KEY[b]);
});

// Tilt: roll the phone past ±18° to change lane (one step per tilt, re-armed near level).
let armed = true;
exemoo.on('packet', ({ q }) => {
  if (inMenu()) return;
  // Device roll (rotation about its long axis) from the orientation quaternion.
  const roll = Math.atan2(2 * (q.w * q.y - q.z * q.x), 1 - 2 * (q.x * q.x + q.y * q.y)) * (180 / Math.PI);
  if (armed && Math.abs(roll) > 18) {
    armed = false;
    pressKey(roll > 0 ? 'ArrowRight' : 'ArrowLeft');
    exemoo.haptic(15);
  } else if (Math.abs(roll) < 8) armed = true;
});
