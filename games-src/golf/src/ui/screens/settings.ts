/** Settings: every Settings field; emits settings(s) on each change. */
import type { Quality, Settings, UIScreen } from '../../core/contracts';
import { h } from '../dom';
import type { ScreenDef, UICtx } from '../types';
import { btn, label, nudgeRange, panel, seg, slider, toggle } from '../widgets';

export function settingsScreen(ctx: UICtx): ScreenDef {
  let returnTo: UIScreen = 'title';
  const s = () => ctx.state.settings;
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => ctx.setSettings({ ...s(), [k]: v });
  const pct = (v: number) => `${Math.round(v * 100)}%`;

  const hand = seg('hand', [{ value: 'right', label: 'Right' }, { value: 'left', label: 'Left' }], s().handedness, (v) => set('handedness', v));
  const sens = slider('sens', 0.5, 2, 0.05, s().sensitivity, (v) => `${v.toFixed(2)}×`, (v) => set('sensitivity', v));
  const hold = toggle('hold', 'Hold SWING to swing', s().holdToSwing, (v) => set('holdToSwing', v));
  const haptics = toggle('haptics', 'Phone vibration', s().haptics, (v) => set('haptics', v));
  const marker = toggle('marker', 'Landing marker', s().showLandingMarker, (v) => set('showLandingMarker', v));
  const guide = toggle('guide', 'Putt guide line', s().showPuttGuide, (v) => set('showPuttGuide', v));
  const units = seg('units', [{ value: 'yards', label: 'Yards' }, { value: 'meters', label: 'Metres' }], s().units, (v) => set('units', v));
  const master = slider('vol-master', 0, 1, 0.05, s().masterVolume, pct, (v) => set('masterVolume', v));
  const music = slider('vol-music', 0, 1, 0.05, s().musicVolume, pct, (v) => set('musicVolume', v));
  const sfx = slider('vol-sfx', 0, 1, 0.05, s().sfxVolume, pct, (v) => set('sfxVolume', v));
  const quality = seg<Quality>(
    'quality',
    [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }],
    s().quality,
    (v) => set('quality', v),
  );

  const row = (name: string, control: HTMLElement, hint?: string) =>
    h('div', { class: 'bd-row' }, h('div', { class: 'bd-row__name' }, name, hint ? h('small', null, hint) : null), control);

  const back = btn('Done', () => ctx.go(returnTo), { icon: 'check', kind: 'primary', nav: 'done' });
  const el = h(
    'div',
    { class: 'bd-screen' },
    panel(
      'Settings',
      'settings',
      [
        h(
          'div',
          { class: 'bd-settings' },
          h(
            'div',
            { class: 'bd-settings__col' },
            label('Swing', 'club'),
            row('Handedness', hand.el),
            row('Sensitivity', sens.el, 'How hard you need to swing'),
            hold.el,
            haptics.el,
            label('Helpers', 'target'),
            marker.el,
            guide.el,
            row('Distances', units.el),
          ),
          h(
            'div',
            { class: 'bd-settings__col' },
            label('Sound', 'volume'),
            row('Master', master.el),
            row('Music', music.el),
            row('Effects', sfx.el),
            label('Graphics', 'map'),
            row('Quality', quality.el, 'Lower if the game stutters'),
          ),
        ),
      ],
      [h('span', { class: 'bd-hintline' }, '◀ ▶ adjust sliders'), h('span', { class: 'bd-grow' }), back],
      'bd-panel--wide',
    ),
  );

  const sync = () => {
    const v = s();
    hand.set(v.handedness);
    sens.set(v.sensitivity);
    hold.set(v.holdToSwing);
    haptics.set(v.haptics);
    marker.set(v.showLandingMarker);
    guide.set(v.showPuttGuide);
    units.set(v.units);
    master.set(v.masterVolume);
    music.set(v.musicVolume);
    sfx.set(v.sfxVolume);
    quality.set(v.quality);
  };
  return {
    el,
    dim: true,
    first: () => back,
    back: () => ctx.go(returnTo),
    show(_d, from) {
      if (from !== 'settings') returnTo = from === 'pause' ? 'pause' : 'title';
      sync();
    },
    refresh: sync,
    adjust(target, dir) {
      if (target instanceof HTMLInputElement && target.type === 'range') {
        nudgeRange(target, dir);
        return true;
      }
      return false;
    },
  };
}
