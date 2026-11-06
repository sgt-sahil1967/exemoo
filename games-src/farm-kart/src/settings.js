// Persistent game settings + the settings screen (rendered into #settings-body).
const KEY = 'farmkart.settings';

export const DEFAULTS = {
  master: .8, music: .5, sfx: .8,
  quality: 'high', weather: true, screenFx: true, shake: true, fps: false,
  camera: 'normal', split2: 'horizontal', units: 'kmh', minimap: true,
  items: true, catchup: true,
  requireCode: true, pauseOnDrop: true,
};

export function loadSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...DEFAULTS }; }
}
export function saveSettings(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }

// [section, [key, label, type, options/range, hint]]
const SCHEMA = [
  ['Audio', [
    ['master', 'Master volume', 'range'],
    ['music', 'Music', 'range'],
    ['sfx', 'Sound effects', 'range'],
  ]],
  ['Graphics', [
    ['quality', 'Quality', 'seg', [['low', 'Low'], ['medium', 'Medium'], ['high', 'High']], 'Low turns off shadows and weather for slower computers'],
    ['weather', 'Weather', 'toggle', null, 'Pollen, leaves, snow and dust'],
    ['screenFx', 'Speed lines & flashes', 'toggle'],
    ['shake', 'Camera shake', 'toggle'],
    ['fps', 'Show FPS', 'toggle'],
  ]],
  ['Display', [
    ['camera', 'Camera distance', 'seg', [['near', 'Near'], ['normal', 'Normal'], ['far', 'Far']]],
    ['split2', '2-player split', 'seg', [['horizontal', 'Top / bottom'], ['vertical', 'Side by side']]],
    ['units', 'Speed units', 'seg', [['kmh', 'km/h'], ['mph', 'mph']]],
    ['minimap', 'Minimap', 'toggle'],
  ]],
  ['Gameplay', [
    ['items', 'Item boxes', 'toggle', null, 'Turn off for pure racing'],
    ['catchup', 'Catch-up', 'toggle', null, 'CPU racers ease off when far ahead, speed up when far behind'],
  ]],
  ['Phones & pairing', [
    ['requireCode', 'Require room code', 'toggle', null, 'Phones need the 4-digit code (it is inside the QR codes)'],
    ['pauseOnDrop', 'Pause when a phone disconnects', 'toggle'],
  ]],
];

/** Render the settings form. onChange(key, value) is called on every edit. */
export function renderSettings(root, s, onChange) {
  root.innerHTML = '';
  for (const [title, rows] of SCHEMA) {
    const sec = document.createElement('section'); sec.className = 'set-sec';
    sec.innerHTML = `<h2 class="display">${title}</h2>`;
    for (const [key, label, type, opts, hint] of rows) {
      const row = document.createElement('div'); row.className = 'set-row';
      row.innerHTML = `<div class="set-label"><b>${label}</b>${hint ? `<small>${hint}</small>` : ''}</div><div class="set-ctl"></div>`;
      const ctl = row.querySelector('.set-ctl');
      if (type === 'range') {
        ctl.innerHTML = `<input type="range" min="0" max="100" step="1" value="${Math.round(s[key] * 100)}"><output>${Math.round(s[key] * 100)}</output>`;
        const inp = ctl.querySelector('input'), out = ctl.querySelector('output');
        inp.oninput = () => { out.textContent = inp.value; onChange(key, inp.value / 100); };
      } else if (type === 'toggle') {
        const b = document.createElement('button');
        b.className = 'toggle' + (s[key] ? ' on' : ''); b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', !!s[key]);
        b.innerHTML = '<i></i>';
        b.onclick = () => { const v = !b.classList.contains('on'); b.classList.toggle('on', v); b.setAttribute('aria-checked', v); onChange(key, v); };
        ctl.appendChild(b);
      } else if (type === 'seg') {
        const seg = document.createElement('div'); seg.className = 'seg';
        for (const [v, l] of opts) {
          const b = document.createElement('button'); b.textContent = l; b.className = s[key] === v ? 'on' : '';
          b.onclick = () => { seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); onChange(key, v); };
          seg.appendChild(b);
        }
        ctl.appendChild(seg);
      }
      sec.appendChild(row);
    }
    root.appendChild(sec);
  }
}
