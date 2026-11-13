// Standalone driver for js/world.js: fakes the ball and pins so the world can be checked without physics.
import { createWorld } from '../js/world.js';
import { LANE, BALL, PIN_SPOTS, PLAYERS } from '../js/constants.js';

const params = new URLSearchParams(location.search);
const world = await createWorld({ canvas: document.getElementById('scene'), quality: params.has('q') ? +params.get('q') : 2 });
if (params.has('q')) world.autoQuality = false;
window.world = world;

const pins = PIN_SPOTS.map((s) => ({ id: s.id, present: true, x: s.x, y: 0, z: s.z, qx: 0, qy: 0, qz: 0, qw: 1, down: false }));
const ball = { present: false, x: 0, y: BALL.radius, z: 0, qx: 0, qy: 0, qz: 0, qw: 1, vx: 0, vy: 0, vz: 0, speed: 0, state: 'none' };
const modes = ['title', 'address', 'follow', 'pins', 'results'];
const S = { mode: 0, player: 0, heldX: 0.1, swing: 0, swingAuto: false, aim: false, angle: -0.02, busy: false, roll: 0, t: 0 };
window.S = S;

function resetPins(ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
  pins.forEach((p, i) => { const s = PIN_SPOTS[i]; Object.assign(p, { present: ids.includes(p.id), x: s.x, y: 0, z: s.z, qx: 0, qy: 0, qz: 0, qw: 1, down: false }); });
}
function knock(ids) { // lay pins down with fake transforms
  for (const id of ids) {
    const p = pins[id - 1]; if (!p.present) continue;
    const a = id * 2.4, h = Math.SQRT1_2;
    // lying on its side: rotate 90 degrees about a horizontal axis
    p.qx = Math.cos(a) * h; p.qy = 0; p.qz = Math.sin(a) * h; p.qw = h;
    p.x += Math.sin(id * 1.9) * 0.12; p.z -= 0.1 + (id % 3) * 0.08; p.y = 0.055; p.down = true;
  }
}
function throwBall() {
  Object.assign(ball, { present: true, x: S.heldX, y: BALL.radius, z: 0, vz: -7.6, state: 'lane' });
  S.roll = 0; world.setBallPlayer(S.player); world.setHeldBall({ visible: false }); world.setAim({ visible: false });
  world.setCamera('follow'); S.mode = 2; S.hit = false;
}
function path() {
  const out = [];
  for (let i = 0; i <= 48; i++) { const d = i / 48 * 18.3, c = Math.max(0, d - 11); out.push({ x: S.heldX + Math.tan(S.angle) * d - 0.012 * c * c, z: -d }); }
  return out;
}
function drawMonitor() {
  const c = world.monitorCanvas, g = c.getContext('2d');
  g.fillStyle = '#12123a'; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = PLAYERS[S.player].color; g.font = '120px "Lilita One", sans-serif'; g.textAlign = 'center';
  g.fillText(PLAYERS[S.player].name + '  ' + Math.floor(S.t * 7) % 300, 512, 290);
  world.monitorChanged();
}

addEventListener('keydown', async (e) => {
  const k = e.key.toLowerCase();
  if (k === 'c') { S.mode = (S.mode + 1) % modes.length; world.setCamera(modes[S.mode], { x: S.heldX }); }
  else if ('12345'.includes(k)) { S.mode = +k - 1; world.setCamera(modes[S.mode], { x: S.heldX }); }
  else if (k === ' ') throwBall();
  else if (k === 'k') { knock([1, 2, 3, 5, 6, 9]); }
  else if (k === 'r') { resetPins(); }
  else if (k === 's') { S.busy = true; await world.pinsetter('sweep', { standing: pins.filter((p) => p.present && !p.down).map((p) => p.id) }); resetPins(pins.filter((p) => p.present && !p.down).map((p) => p.id)); S.busy = false; }
  else if (k === 'f') { S.busy = true; await world.pinsetter('rack', {}); resetPins(); S.busy = false; }
  else if (k === 'x') world.celebrate('strike');
  else if (k === 't') world.celebrate('turkey');
  else if (k === 'z') world.celebrate('spare');
  else if (k === 'g') world.celebrate('gutter');
  else if (k === 'i') world.impact({ x: 0, y: 0.1, z: -18.3, strength: 1 });
  else if (k === 'h') S.held = !S.held;
  else if (k === 'a') S.aim = !S.aim;
  else if (k === 'w') S.swingAuto = !S.swingAuto;
  else if (k === 'p') { S.player = (S.player + 1) % 4; drawMonitor(); }
  else if (k === 'arrowleft') S.heldX = Math.max(-0.46, S.heldX - 0.04);
  else if (k === 'arrowright') S.heldX = Math.min(0.46, S.heldX + 0.04);
  else if (k === 'arrowup') S.swing = Math.min(1, S.swing + 0.1);
  else if (k === 'arrowdown') S.swing = Math.max(-1, S.swing - 0.1);
  else if (k === 'q') world.setQuality((world.quality + 2) % 3);
});

const hud = document.getElementById('hud');
let last = performance.now(), fpsAcc = 0, fpsN = 0, fps = 0;
function step(dt) {
  S.t += dt;
  if (ball.present) {
    ball.z += ball.vz * dt; S.roll += -ball.vz * dt / BALL.radius;
    const c = Math.max(0, -ball.z - 11); ball.x = S.heldX + Math.tan(S.angle) * -ball.z - 0.012 * c * c;
    // rolling about +X axis turned by a bit of side spin
    const h = S.roll / 2; ball.qx = -Math.sin(h) * 0.97; ball.qy = 0; ball.qz = Math.sin(h) * 0.243; ball.qw = Math.cos(h);
    if (!S.hit && ball.z < -18.1) { S.hit = true; knock([1, 2, 3, 4, 5, 6, 8, 9]); world.impact({ x: ball.x, y: 0.12, z: -18.2, strength: 0.9 }); }
    if (ball.z < LANE.deckEndZ) { ball.y -= 2 * dt; ball.state = 'pit'; }
    if (ball.z < LANE.pitBackZ + 0.2) { ball.present = false; ball.state = 'none'; }
  }
  if (S.swingAuto) S.swing = Math.sin(S.t * 2.2);
  world.setHeldBall({ visible: !!S.held && !ball.present, x: S.heldX, swing: S.swing, player: S.player });
  world.setAim({ visible: S.aim && !ball.present, x: S.heldX, angle: S.angle, path: path() });
  if (modes[S.mode] === 'address') world.setCamera('address', { x: S.heldX });
  if (!S.busy) world.syncPins(pins);
  world.syncBall(ball);
  world.update(dt);
}
window.advance = (sec, dt = 1 / 60) => { for (let t = 0; t < sec; t += dt) step(dt); world.render(); };
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  fpsAcc += dt; fpsN++; if (fpsAcc > 0.5) { fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }
  if (!window.manual) { step(dt); world.render(); }
  const info = world.renderer.info.render;
  hud.textContent = `${fps.toFixed(0)} fps  q${world.quality}  calls ${info.calls}  tris ${(info.triangles / 1000).toFixed(0)}k  cam ${modes[S.mode]}\n` +
    'C/1-5 camera  Space throw  K knock  R reset  S sweep  F rack  X strike  T turkey  Z spare  G gutter\nI impact  H held ball  W auto swing  arrows move/swing  A aim  P player  Q quality';
  requestAnimationFrame(frame);
}
drawMonitor();
requestAnimationFrame(frame);
