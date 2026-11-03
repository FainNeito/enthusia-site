import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../public/assets/page-leaderboards.js',import.meta.url),'utf8');
// Exercise the production normalizer without making a third-party network request.
const take=(name,next)=>source.slice(source.indexOf('  function '+name+'('),source.indexOf('  function '+next+'('));
const normalize=runInNewContext(take('text','el')+take('pickNumber','pickText')+take('pickText','guildValue')+take('normalizePlayer','normalizeEntries')+';normalizePlayer');
test('leaderboard skin identity prefers UUID without changing player name or score',()=>{
  const row=normalize({username:'StepSoy',uuid:'7402cfa7-ee57-41ba-8d65-f6d931547f11',formattedValue:'91,710'},2);
  assert.equal(row.headId,'7402cfa7-ee57-41ba-8d65-f6d931547f11');assert.equal(row.name,'StepSoy');assert.equal(row.value,'91,710');assert.equal(row.rank,3);
});
test('skin UUID aliases and compact UUIDs work; malformed and absent UUIDs retain the name fallback',()=>{
  const compact='7402CFA7EE5741BA8D65F6D931547F11';
  for(const key of ['uuid','playerUuid','player_uuid'])assert.equal(normalize({username:'StepSoy',[key]:compact},0).headId,compact.toLowerCase());
  for(const uuid of [undefined,'','not-a-uuid','../../other'])assert.equal(normalize({username:'StepSoy',uuid},0).headId,'StepSoy');
  assert.equal(normalize({name:'LegacyPlayer'},0).headId,'LegacyPlayer');
});
test('donor skins use the Minecraft username instead of a donor-system identifier',()=>{
  const board={id:'donators-all-time'};
  const row=normalize({username:'ToxikFlame11',uuid:'52720e9b-aa87-a7df-224b-4d85dab11429',formattedValue:'$191.00'},0,board);
  assert.equal(row.headId,'ToxikFlame11');
  assert.equal(row.name,'ToxikFlame11');
  assert.equal(row.value,'$191.00');
  assert.equal(normalize({username:'../bad',uuid:'52720e9b-aa87-a7df-224b-4d85dab11429',formattedValue:'$1.00'},0,board).headId,'');
});
