import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {hallItems,hallDescription,hallTitle,trophyTemplate} from '../public/assets/halloffame-model.js';

test('published Hall of Fame records retain their distinct categories and details',async()=>{
  const data=JSON.parse(await readFile(new URL('../public/preview/halloffame-published-capture.json',import.meta.url),'utf8'));
  assert.equal(hallItems(data.items,'Reigning champions').length,4);
  assert.equal(hallItems(data.items,'Trophy wall').length,11);
  assert.equal(hallItems(data.items,'Firsts').length,7);
  assert.equal(hallItems(data.items,'Server records').length,1);
  for(const item of data.items){
    assert.ok(hallDescription(item).length>0,item.slug);
    assert.ok(!hallDescription(item).includes('Source verification pending.'),item.slug);
  }
  const planned=data.items.find(item=>item.slug==='halloween-build-competition');
  assert.deepEqual(hallTitle(planned),{event:'Fall Build Competition',winner:'To be decided'});
  const champion=data.items.find(item=>item.slug==='pvp-tournament-champion-oinkermc-2026-06-21t00-00-00-000z');
  assert.deepEqual(hallTitle(champion),{event:'PvP Tournament champion',winner:'OinkerMC'});
  for(const item of hallItems(data.items,'Trophy wall'))assert.notEqual(trophyTemplate(item.slug),undefined,item.slug);
  assert.equal(trophyTemplate('unknown-event'),undefined);
});
