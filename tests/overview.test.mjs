import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dhakaClock, nextIndex } from '../overview.js';

test('dhakaClock renders Dhaka time', () => {
  const r = dhakaClock(new Date('2026-11-16T19:33:28Z'));
  assert.deepEqual(r, { date: 'Tuesday 17 November', time: '01:33:28' });
});

test('nextIndex wraps both ways', () => {
  assert.equal(nextIndex(1, 1, 2), 0);
  assert.equal(nextIndex(0, -1, 2), 1);
  assert.equal(nextIndex(0, 1, 2), 1);
});
