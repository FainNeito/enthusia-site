import test from 'node:test';
import assert from 'node:assert/strict';
import { marketWeekKey,marketWeekRange } from '../public/assets/market/eastern-week.js';

test('market weeks begin on Monday at midnight Eastern in summer and winter',()=>{
  assert.deepEqual(marketWeekRange('2026-07-06'),['2026-07-06T04:00:00.000Z','2026-07-13T04:00:00.000Z']);
  assert.deepEqual(marketWeekRange('2026-12-07'),['2026-12-07T05:00:00.000Z','2026-12-14T05:00:00.000Z']);
  assert.equal(marketWeekKey('2026-07-06T03:59:59Z'),'2026-06-29');
  assert.equal(marketWeekKey('2026-07-06T04:00:00Z'),'2026-07-06');
});
test('weeks spanning daylight saving transitions have the correct end boundary',()=>{
  assert.deepEqual(marketWeekRange('2026-03-02'),['2026-03-02T05:00:00.000Z','2026-03-09T04:00:00.000Z']);
  assert.deepEqual(marketWeekRange('2026-10-26'),['2026-10-26T04:00:00.000Z','2026-11-02T05:00:00.000Z']);
  assert.equal(marketWeekKey('2026-11-02',-1),'2026-10-26');
  assert.throws(()=>marketWeekKey('2026-02-30'),/invalid_week/);
});
