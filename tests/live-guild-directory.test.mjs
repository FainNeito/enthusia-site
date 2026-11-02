import test from 'node:test';
import assert from 'node:assert/strict';
import {readLiveGuildDirectory,readPublicLeaderboardPlayers,resolvePublicGuildMembers} from '../functions/lib/live-guild-directory.js';

const env={GUILDS_DIRECTORY_API_URL:'https://guilds.example/api/community/guild-directory',GUILDS_API_BEARER:'test-secret'};
const revision='a'.repeat(64);
const entry=id=>({id,name:id});
const first={generatedAt:'2026-01-01T00:00:00Z',directoryRevision:revision,total:2,offset:0,nextOffset:1,entries:[entry('a')]};
const last={...first,offset:1,nextOffset:null,entries:[entry('b')]};

test('assembles a bounded directory and keeps credentials on the configured upstream',async()=>{
  const calls=[];
  const result=await readLiveGuildDirectory(env,async(url,options)=>{
    calls.push({url,options});return Response.json(calls.length===1?first:last);
  });
  assert.deepEqual(result.entries.map(x=>x.id),['a','b']);
  assert.equal(calls.length,2);assert.equal(calls[0].options.headers.Authorization,'Bearer test-secret');
  assert.equal(calls[0].options.redirect,'error');assert.equal(new URL(calls[1].url).searchParams.get('offset'),'1');
  assert.equal(new URL(calls[0].url).searchParams.has('revision'),false);
  assert.equal(new URL(calls[1].url).searchParams.get('revision'),revision);
});

test('rejects changed revisions, duplicate identities, malformed paging, errors and insecure endpoints',async()=>{
  for (const changed of [
    {...last,directoryRevision:'b'.repeat(64)},
    {...last,generatedAt:'2026-01-01T00:00:01Z'},
    {...last,entries:[entry('a')]},
    {...last,total:3},
    {...last,offset:2},
    {...last,nextOffset:2},
  ]) {
    let calls=0;
    assert.equal(await readLiveGuildDirectory(env,async()=>Response.json(++calls===1?first:changed)),null);
  }
  assert.equal(await readLiveGuildDirectory(env,async()=>{throw Error('offline');}),null);
  assert.equal(await readLiveGuildDirectory({...env,GUILDS_DIRECTORY_API_URL:'http://guilds.example/'},async()=>{throw Error('must not fetch');}),null);
  assert.equal(await readLiveGuildDirectory({...env,GUILDS_API_BEARER:''},async()=>{throw Error('must not fetch');}),null);
  assert.equal(await readLiveGuildDirectory(env,async()=>Response.json({...first,generatedAt:new Date(Date.now()+86400000).toISOString()})),null);
});

test('resolves roster names only when the complete roster has public player identities',()=>{
  const id='12345678-1234-1234-1234-123456789abc';
  const directory={entries:[{id:'guild',memberCount:1,memberUuids:[id]}]};
  assert.deepEqual(resolvePublicGuildMembers(directory,[{id,name:'Player'}]).entries[0].membersList,['Player']);
  assert.equal(resolvePublicGuildMembers(directory,[]).entries[0].membersList,undefined);
  assert.equal(resolvePublicGuildMembers({entries:[{id:'guild',memberCount:2,memberUuids:[id]}]},[{id,name:'Player'}]).entries[0].membersList,undefined);
  assert.equal(resolvePublicGuildMembers({entries:[{id:'guild',memberCount:2,memberUuids:[id,id]}]},[{id,name:'Player'}]).entries[0].membersList,undefined);
  assert.equal(resolvePublicGuildMembers(directory,[{id,name:'Player'},{id,name:'Other'}]).entries[0].membersList,undefined);
});

test('uses only recent public leaderboard identities and sends no private credentials',async()=>{
  const id='12345678-1234-1234-1234-123456789abc';let seen;
  const fetcher=async(url,options)=>{seen={url,options};return Response.json({generatedAt:new Date().toISOString(),players:[{uuid:id,username:'Player',private:'omit'}]});};
  assert.deepEqual(await readPublicLeaderboardPlayers(fetcher),[{id,name:'Player'}]);
  assert.equal(seen.options.headers.Authorization,undefined);assert.equal(seen.options.redirect,'error');
  assert.deepEqual(await readPublicLeaderboardPlayers(async()=>Response.json({generatedAt:'2020-01-01T00:00:00Z',players:[{uuid:id,username:'Player'}]})),[]);
});
