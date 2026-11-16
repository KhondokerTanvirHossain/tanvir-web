import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { existsSync, statSync } from 'node:fs';
import { filmSources, shouldPlay, allSourcesFailed } from '../films.js';

const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('filmSources lists webm then mp4', () => {
  assert.deepEqual(filmSources('bolo'), [{ src: 'assets/films/bolo.webm', type: 'video/webm' }, { src: 'assets/films/bolo.mp4', type: 'video/mp4' }]);
});

test('home has no inline video; every film marked ready has its files, each at most 3 MB', () => {
  assert.doesNotMatch(home, /<video/);
  for (const m of home.matchAll(/data-film="([a-z]+)" data-film-ready/g)) {
    for (const f of [`${m[1]}.webm`, `${m[1]}.mp4`, `${m[1]}-poster.jpg`]) {
      const p = new URL(`../assets/films/${f}`, import.meta.url);
      assert.ok(existsSync(p), `missing assets/films/${f}`);
      assert.ok(statSync(p).size <= 3 * 1024 * 1024, `assets/films/${f} over 3 MB`);
    }
  }
});

test('shouldPlay: in the show only the active chapter plays; elsewhere half-visible is enough', () => {
  assert.equal(shouldPlay({ ratio: 1, wanted: true, inShow: true, active: false }), false);
  assert.equal(shouldPlay({ ratio: 1, wanted: true, inShow: true, active: true }), true);
  assert.equal(shouldPlay({ ratio: 0.6, wanted: true, inShow: false, active: false }), true);
  assert.equal(shouldPlay({ ratio: 0.3, wanted: true, inShow: false, active: false }), false);
  assert.equal(shouldPlay({ ratio: 1, wanted: false, inShow: true, active: true }), false);
});

test('allSourcesFailed only when the video has no usable source left', () => {
  assert.equal(allSourcesFailed(3), true); // NETWORK_NO_SOURCE
  for (const s of [0, 1, 2]) assert.equal(allSourcesFailed(s), false);
});
