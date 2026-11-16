import test from 'node:test';
import assert from 'node:assert/strict';
import {webhookUrl,splitMessage,sendTest} from '../public/assets/discord-live-test.js';
const hook='https://discord.com/api/webhooks/123456789012345678/fixture-token';
test('webhook validation only allows a direct Discord HTTPS webhook',()=>{
 assert.equal(webhookUrl(hook),hook+'?wait=true');
 for(const value of ['http://discord.com/api/webhooks/123456789012345678/fixture-token','https://discord.com.evil.test/api/webhooks/123456789012345678/fixture-token',hook+'?bad=1','https://user@discord.com/api/webhooks/123456789012345678/fixture-token'])assert.equal(webhookUrl(value),null);
});
test('long Unicode messages remain bounded and reconstruct exactly',()=>{
 const title='Example',body='😀'.repeat(5500),parts=splitMessage(title,body);
 assert.ok(parts.length>1);assert.ok(parts.every(part=>part.length<=2000));
 assert.equal(parts.map(part=>part.replace(/^\[Part \d+\/\d+\]\n/,'')).join(''),`[WEBSITE TEST] ${title}\n\n${body}`);
});
test('all parts suppress mentions and uncertain delivery never retries',async()=>{
 let calls=0;const payloads=[];
 const sent=await sendTest(hook,['one','two'],async(_url,options)=>{calls++;payloads.push(JSON.parse(options.body));if(calls===2)throw Error('connection');return Response.json({id:'123456789012345679'});});
 assert.deepEqual(sent,{status:'uncertain',confirmed:1});assert.equal(calls,2);
 assert.deepEqual(payloads[0].allowed_mentions,{parse:[]});
});
test('rate-limited requests may retry only after explicit Discord rejection',async()=>{
 let calls=0;const sent=await sendTest(hook,['one'],async()=>{calls++;return calls===1?new Response('',{status:429,headers:{'retry-after':'0'}}):Response.json({id:'123456789012345679'});});
 assert.deepEqual(sent,{status:'sent',confirmed:1});assert.equal(calls,2);
});
