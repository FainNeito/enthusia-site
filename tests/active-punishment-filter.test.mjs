import test from 'node:test';
import assert from 'node:assert/strict';
import { isActivePunishment, loadActivePunishmentPages } from '../public/assets/active-punishment-filter.js';

test('active filter excludes expired, revoked and recorded warnings', () => {
  assert.equal(isActivePunishment({state:'ACTIVE',punishmentType:'BAN'}),true);
  assert.equal(isActivePunishment({state:'ACTIVE',punishmentType:'MUTE'}),true);
  for(const row of [{state:'ACTIVE',punishmentType:'WARNING'},{state:'EXPIRED',punishmentType:'BAN'},{state:'REVOKED',punishmentType:'BAN'}]) assert.equal(isActivePunishment(row),false);
});
test('active filter continues through earlier pages without dropping the next cursor', async () => {
  const calls=[];
  const result=await loadActivePunishmentPages(async cursor=>{
    calls.push(cursor);
    return cursor===null?{items:[{state:'EXPIRED',punishmentType:'BAN'}],nextCursor:'next'}:{items:[{state:'ACTIVE',punishmentType:'BAN'}],nextCursor:'after'};
  });
  assert.deepEqual(calls,[null,'next']);assert.equal(result.items.length,1);assert.equal(result.nextCursor,'after');
});
test('bounded empty-page scans retain a continuation and reject repeated cursors', async () => {
  let page=0;
  const result=await loadActivePunishmentPages(async()=>({items:[],nextCursor:String(++page)}),null,2);
  assert.deepEqual(result,{items:[],nextCursor:'2'});
  await assert.rejects(()=>loadActivePunishmentPages(async()=>({items:[],nextCursor:'same'}),'same'));
  await assert.rejects(()=>loadActivePunishmentPages(async()=>{throw Error('offline');}));
});
