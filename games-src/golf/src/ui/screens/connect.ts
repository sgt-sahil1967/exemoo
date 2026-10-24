/** Phone pairing screen: big PIN, QR code, steps, live link status. */
import { toString as qrToString } from 'qrcode';
import { PALETTE } from '../../core/contracts';
import { h, clear } from '../dom';
import type { IconName } from '../icons';
import type { ScreenDef, UICtx } from '../types';
import { btn, icon, panel, spinner } from '../widgets';

const STEPS: [IconName, string, string][] = [
  ['phone', 'Scan with your phone', 'Point the camera at the code, or open the address below.'],
  ['check', 'Accept the certificate warning', 'Tap “Advanced → Proceed”. It’s your own computer.'],
  ['target', 'Tap Enable Motion', 'Allow motion & orientation access when asked.'],
  ['club', 'Hold it like a club', 'Screen facing you, both hands, thumb on SWING.'],
];

export function connectScreen(ctx: UICtx): ScreenDef {
  /** Where Back / Continue lead (title or setup, whichever opened us). */
  let returnTo: 'title' | 'setup' = 'setup';
  const qrBox = h('div', { class: 'bd-qr' });
  const urlText = h('div', { class: 'bd-connect__url' });
  const pinBox = h('div', { class: 'bd-pin', 'aria-label': 'Pairing PIN' });
  const statusEl = h('div', { class: 'bd-status' }, h('span', { class: 'bd-status__dot' }), h('span', { class: 'bd-status__text' }));
  const stepEls = STEPS.map(([ic, t, sub], i) =>
    h(
      'li',
      { class: 'bd-step' },
      h('span', { class: 'bd-step__num' }, String(i + 1)),
      h('span', { class: 'bd-step__ico' }, icon(ic)),
      h('div', null, h('b', null, t), h('small', null, sub)),
    ),
  );
  const mouse = btn('Play with mouse instead', () => {
    ctx.state.inputChoice = 'mouse';
    ctx.emit('connect', 'mouse');
    ctx.go('setup');
  }, { icon: 'mouse', nav: 'mouse' });
  const cont = btn('Continue', () => {
    if (ctx.state.link.status !== 'connected') return;
    ctx.state.inputChoice = 'phone';
    ctx.emit('connect', 'phone');
    ctx.go('setup');
  }, { icon: 'next', kind: 'go', nav: 'continue' });
  const back = btn('Back', () => ctx.go(returnTo), { icon: 'back', nav: 'back', kind: 'ghost' });

  const el = h(
    'div',
    { class: 'bd-screen' },
    panel(
      'Connect your Phone',
      'phone',
      [
        h(
          'div',
          { class: 'bd-connect' },
          h(
            'div',
            { class: 'bd-connect__pair' },
            qrBox,
            urlText,
            h('div', { class: 'bd-connect__pinlabel' }, 'Pairing PIN'),
            pinBox,
          ),
          h('div', { class: 'bd-connect__info' }, h('ol', { class: 'bd-steps' }, ...stepEls), statusEl),
        ),
      ],
      [back, h('span', { class: 'bd-grow' }), mouse, cont],
      'bd-panel--wide',
    ),
  );

  let lastUrl = '\u0000';
  let lastPin = '\u0000';
  let qrToken = 0;
  const render = () => {
    const { status, pin, url, transport } = ctx.state.link;
    if (url !== lastUrl) {
      lastUrl = url;
      clear(qrBox);
      qrBox.classList.toggle('is-loading', !url);
      urlText.textContent = url ? url.replace(/^https?:\/\//, '') : 'Starting the pairing server…';
      if (!url) qrBox.append(spinner());
      else {
        const token = ++qrToken;
        qrToString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: PALETTE.ink, light: '#ffffff' } })
          .then((svg) => {
            if (token !== qrToken) return;
            qrBox.innerHTML = svg;
          })
          .catch(() => {
            if (token === qrToken) qrBox.textContent = 'QR unavailable';
          });
      }
    }
    if (pin !== lastPin) {
      lastPin = pin;
      clear(pinBox);
      const digits = (pin || '······').padEnd(6, '·').slice(0, 6).split('');
      digits.forEach((d, i) => {
        if (i === 3) pinBox.append(h('span', { class: 'bd-pin__gap' }));
        pinBox.append(h('span', { class: 'bd-pin__d' }, d));
      });
    }
    const texts: Record<string, string> = {
      idle: 'Starting link…',
      connecting: 'Starting link…',
      waiting: 'Waiting for your phone…',
      pairing: 'Phone found — pairing…',
      connected: `Connected via ${transport === 'webrtc' ? 'WebRTC' : transport === 'relay' ? 'relay' : 'link'}`,
      disconnected: 'Phone disconnected — scan again',
      error: 'Couldn’t start the link',
    };
    statusEl.dataset.tone =
      status === 'connected' ? 'ok' : status === 'error' || status === 'disconnected' ? 'bad' : status === 'pairing' ? 'busy' : 'wait';
    statusEl.querySelector('.bd-status__text')!.textContent = texts[status] ?? status;
    const done = status === 'connected' ? 4 : status === 'pairing' ? 1 : 0;
    stepEls.forEach((s, i) => s.classList.toggle('is-done', i < done));
    const wasDisabled = cont.disabled;
    cont.disabled = status !== 'connected';
    ctx.refocus();
    if (wasDisabled && !cont.disabled) cont.classList.add('is-pop');
  };
  return {
    el,
    dim: true,
    first: () => (ctx.state.link.status === 'connected' ? cont : mouse),
    back: () => ctx.go(returnTo),
    show(_d, from) {
      if (from !== 'connect') returnTo = from === 'title' ? 'title' : 'setup';
      render();
    },
    refresh: render,
  };
}
