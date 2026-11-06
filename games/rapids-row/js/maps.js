/**
 * The rivers. Each map has the same track API (see ../CONTRACT.md); main.js builds the picked one.
 * Modules are loaded on demand so a broken or slow map never stops the other from playing.
 */
export const MAPS = [
  {
    id: 'meadow',
    name: 'Sunny River',
    blurb: 'Cows, rock slaloms, a whitewater canyon and a log jam.',
    sky: 'day',
    color: '#2fc65a',
    load: () => import('./track.js'),
  },
  {
    id: 'temple',
    name: 'Jungle Temple',
    blurb: 'Swinging logs, crocodiles, whirlpools, lock gates and bridges. Wipe out and you go back to the checkpoint!',
    sky: 'sunset',
    color: '#ff9a1f',
    load: () => import('./track2.js'),
  },
];
