// Guards the "camera shown twice" bug: games that draw their own panel from the shell's #camVideo
// (cricket, bowling) must hide the shell's floating preview, and every game that reads camVideo must be listed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');
const shell = read('public/js/shell.js');

test('games that draw their own camera panel hide the shell preview', () => {
  const set = /OWN_PREVIEW = new Set\(\[([^\]]*)\]\)/.exec(shell)[1];
  const ids = [...set.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  for (const id of ['cricket', 'bowling']) {
    assert.ok(read(`games/${id}/js/handcam.js`).includes("getElementById('camVideo')"));
    assert.ok(ids.includes(id), `${id} must be in OWN_PREVIEW`);
  }
  assert.match(read('public/index.html'), /body\.playing\.cam-own-preview \.cam-preview\{[^}]*opacity:0/);
});

test('own-camera games are not also asked for shell camera assist', () => {
  for (const id of ['pose-match', 'farm-dash']) assert.ok(new RegExp(`OWN_CAMERA = new Set\\([^)]*'${id}'`).test(shell));
});
