import test from 'node:test';
import assert from 'node:assert/strict';
import { readPublicPlayerDirectory } from '../functions/lib/player-directory-source.js';
const a='02f2a966-6e38-4583-9d57-a04f8984af35',b='0a51c4ef-89b4-4560-ac2f-1f554ae28add';
const now=Date.now(),at=new Date(now-60000).toISOString();
const bucket=data=>({get:async()=>({json:async()=>data})});
test('real boards join by UUID and convert active minutes to hours without exporting private fields',async()=>{
  const env={PLAYTIME_LEADERBOARDS:bucket({generatedAt:at,unit:'minutes',players:[{uuid:a,username:'Player',value:90,stats:{activeMinutes:90},lastSeenAt:'private',ip:'private'}]}),BALANCE_LEADERBOARDS:bucket({generatedAt:at,players:[{uuid:a,username:'Player',value:42},{uuid:b,username:'Other',value:7}]})};
  const result=await readPublicPlayerDirectory(env,now);assert.equal(result.items.length,2);
  const player=result.items.find(row=>row.id===a);assert.equal(player.playtime,1.5);assert.equal(player.balance,42);
  assert.equal(result.items.find(row=>row.id===b).playtime,null);
  assert.equal(result.limited,true);assert.equal(result.stale,false);assert.equal(JSON.stringify(result).includes('private'),false);
});
test('one failed board preserves the other with partial source freshness',async()=>{
  const result=await readPublicPlayerDirectory({PLAYTIME_LEADERBOARDS:{get:async()=>{throw new Error('missing')}},BALANCE_LEADERBOARDS:bucket({generatedAt:new Date(now-3600000).toISOString(),players:[{uuid:a,username:'Player',value:0}]})},now);
  assert.equal(result.items[0].balance,0);assert.equal(result.items[0].playtime,null);assert.equal(result.stale,true);
});
test('unavailable boards and hostile identities never produce fictitious profiles',async()=>{
  assert.equal(await readPublicPlayerDirectory({},now),null);
  const env={BALANCE_LEADERBOARDS:bucket({generatedAt:at,players:[{uuid:'bad',username:'Player',value:1},{uuid:a,username:'<script>',value:2}]})};
  assert.equal(await readPublicPlayerDirectory(env,now),null);
});
test('unsupported units, duplicate UUIDs and invalid values remain unavailable',async()=>{
  const result=await readPublicPlayerDirectory({PLAYTIME_LEADERBOARDS:bucket({generatedAt:at,unit:'ticks',players:[{uuid:a,username:'Player',value:99},{uuid:a,username:'Duplicate',value:100}]}),BALANCE_LEADERBOARDS:bucket({generatedAt:at,players:[{uuid:a,username:'Player',value:-1}]})},now);
  assert.equal(result.items.length,1);assert.equal(result.items[0].playtime,null);assert.equal(result.items[0].balance,null);
});

test('full guild directory supplies player guilds and leaves incomplete rosters unknown',async()=>{
  const guild='20000000-0000-4000-8000-000000000002';
  const base={BALANCE_LEADERBOARDS:bucket({generatedAt:at,players:[{uuid:a,username:'Player',value:5},{uuid:b,username:'Other',value:3}]}),GUILDS_DIRECTORY_API_URL:'https://guilds.example/directory',GUILDS_API_BEARER:'secret'};
  const payload={generatedAt:at,directoryRevision:'a'.repeat(64),total:1,offset:0,nextOffset:null,entries:[{id:guild,name:'Guild',memberCount:1,memberUuids:[a],level:10,banner:{baseColor:'RED',patterns:[]}}]};
  const result=await readPublicPlayerDirectory(base,now,async()=>Response.json(payload));
  assert.equal(result.items.find(row=>row.id===a).guildMemberships[0].name,'Guild');
  assert.equal(result.items.find(row=>row.id===a).guildMemberships[0].banner.baseColor,'RED');
  assert.deepEqual(result.items.find(row=>row.id===b).guildMemberships,[]);
  const partial=await readPublicPlayerDirectory(base,now,async()=>Response.json({...payload,entries:[{...payload.entries[0],memberUuids:null}]}));
  assert.equal(partial.items[0].guildsKnown,undefined);
});
