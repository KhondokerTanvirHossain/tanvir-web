import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filmSources } from '../films.js';

const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('filmSources lists webm then mp4', () => {
  assert.deepEqual(filmSources('bolo'), [{ src: 'assets/films/bolo.webm', type: 'video/webm' }, { src: 'assets/films/bolo.mp4', type: 'video/mp4' }]);
});

test('home has no video until a film is marked ready', () => {
  assert.doesNotMatch(home, /<video/);
  assert.doesNotMatch(home, /data-film-ready/);
});
