import { test } from 'node:test';
import assert from 'node:assert/strict';
import { showState, filmTransform, chapterVars, PHASES } from '../show.js';

test('start: small film, nothing settled, Bolo active', () => {
  const s = showState(0, 4);
  assert.equal(s.expand, 0); assert.equal(s.settle, 0); assert.equal(s.index, 0); assert.equal(s.active, 0);
});

test('phase boundaries', () => {
  assert.equal(showState(PHASES.expandEnd, 4).expand, 1);
  assert.equal(showState(PHASES.holdEnd, 4).settle, 0);
  assert.equal(showState(PHASES.settleEnd, 4).settle, 1);
});

test('end: IntelliDrugs fully in', () => {
  const s = showState(1, 4);
  assert.equal(s.index, 2); assert.equal(s.mix, 1); assert.equal(s.active, 3);
});

test('holds: no mixing at the start or end of a segment', () => {
  const at = (raw) => PHASES.settleEnd + (raw / 3) * (1 - PHASES.settleEnd);
  assert.equal(showState(at(1.2), 4).mix, 0);
  assert.equal(showState(at(1.8), 4).mix, 1);
});

test('crossfade never dips: the outgoing layer stays opaque', () => {
  for (let p = PHASES.settleEnd; p <= 1; p += 0.01) {
    const s = showState(p, 4);
    const opaque = [0, 1, 2, 3].filter((k) => chapterVars(k, s).layer === 1).length;
    assert.ok(opaque >= 1, `p=${p.toFixed(2)}`);
  }
});

test('reduce: no partial states', () => {
  for (const p of [0.02, 0.5, 0.63]) {
    const s = showState(p, 4, { reduce: true });
    assert.equal(s.expand, 1); assert.ok(s.mix === 0 || s.mix === 1);
  }
});

test('film transform: small, full, framed', () => {
  const g = { cx: -200, cy: 30, small: 0.8, full: 1.6 };
  assert.deepEqual(filmTransform({ expand: 0, settle: 0 }, g), { scale: 0.8, x: -200, y: 30, radius: 35 });
  assert.deepEqual(filmTransform({ expand: 1, settle: 0 }, g), { scale: 1.6, x: -200, y: 30, radius: 0 });
  assert.deepEqual(filmTransform({ expand: 1, settle: 1 }, g), { scale: 1, x: 0, y: 0, radius: 28 });
});

test('hidden chapters are inert', () => {
  const s = showState(PHASES.settleEnd + (1 - PHASES.settleEnd) / 3, 4); // Medioo fully in, no mixing
  assert.equal(chapterVars(s.active, s).inert, false);
  assert.equal(chapterVars((s.active + 2) % 4, s).inert, true);
});
