import assert from 'node:assert/strict';
import test from 'node:test';
import { createHistoryOrder } from '../public/assets/history-order.js';

function parent(children = []) {
  const container = { children, append(node) {
    this.children = this.children.filter(child => child !== node);
    this.children.push(node);
    node.parentElement = this;
  } };
  for (const child of children) child.parentElement = container;
  return container;
}

test('changelog sorts real dates in either direction, keeping unknown dates last and ties stable', () => {
  const rows = ['old','undated','new','same-a','same-b'].map(id => ({ id }));
  const list = parent([...rows]);
  const entries = [
    { node: rows[0], date: '2024-01-01' }, { node: rows[1], date: null },
    { node: rows[2], date: '2026-01-01' }, { node: rows[3], date: '2025-01-01' },
    { node: rows[4], date: '2025-01-01' }
  ];
  rows[3].hidden = true;
  const order = createHistoryOrder(entries);
  order();
  assert.deepEqual(list.children.map(row => row.id), ['new','same-a','same-b','old','undated']);
  order('oldest');
  assert.deepEqual(list.children.map(row => row.id), ['old','same-a','same-b','new','undated']);
  assert.equal(rows[3].hidden, true);
  order('newest');
  assert.deepEqual(list.children.map(row => row.id), ['new','same-a','same-b','old','undated']);
});

test('timeline sorts both eras and their existing entries by date', () => {
  const oldEra = { id: 'old-era' }, newEra = { id: 'new-era' }, unknownEra = { id: 'unknown-era' };
  const timeline = parent([oldEra, newEra, unknownEra]);
  const oldA = { id: 'old-a' }, oldB = { id: 'old-b' }, newest = { id: 'new' }, missing = { id: 'missing' };
  const oldList = parent([oldB, oldA]), newList = parent([newest]), unknownList = parent([missing]);
  const order = createHistoryOrder([
    { node: oldB, era: oldEra, date: '2025-09-02' },
    { node: newest, era: newEra, date: '2026-10-01' },
    { node: oldA, era: oldEra, date: '2025-08-01' },
    { node: missing, era: unknownEra, date: null }
  ], [oldEra, newEra, unknownEra]);
  order('newest');
  assert.deepEqual(timeline.children.map(era => era.id), ['new-era','old-era','unknown-era']);
  assert.deepEqual(oldList.children.map(row => row.id), ['old-b','old-a']);
  order('oldest');
  assert.deepEqual(timeline.children.map(era => era.id), ['old-era','new-era','unknown-era']);
  assert.deepEqual(oldList.children.map(row => row.id), ['old-a','old-b']);
  assert.equal(newList.children[0], newest);
  assert.equal(unknownList.children[0], missing);
});
