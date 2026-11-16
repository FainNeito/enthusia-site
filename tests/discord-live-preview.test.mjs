import test from 'node:test';
import assert from 'node:assert/strict';
import {webhookUrl,buildMessage,sendTest} from '../public/assets/discord-live-test.js';
const hook='https://discord.com/api/webhooks/123456789012345678/fixture-token';
test('webhook validation only allows a direct Discord HTTPS webhook',()=>{
 assert.equal(webhookUrl(hook),hook+'?wait=true');
 for(const value of ['http://discord.com/api/webhooks/123456789012345678/fixture-token','https://discord.com.evil.test/api/webhooks/123456789012345678/fixture-token',hook+'?bad=1','https://user@discord.com/api/webhooks/123456789012345678/fixture-token'])assert.equal(webhookUrl(value),null);
});
test('announcements fitting Discord embed limits remain in one message without pings',async()=>{
 const body='😀'.repeat(2048),message=buildMessage('Test',body,null,'Changelog');
 assert.equal(message.files.length,0);assert.equal(message.payload.embeds[0].description,body);
 assert.equal(message.payload.embeds[0].url,'https://enthusia.info/changelog');
 let calls=0;const sent=await sendTest(hook,message,async(_url,options)=>{calls++;const data=JSON.parse(options.body);assert.equal(data.embeds[0].description,body);assert.deepEqual(data.allowed_mentions,{parse:[]});return Response.json({id:'123456789012345679'});});
 assert.deepEqual(sent,{status:'sent'});assert.equal(calls,1);
});
test('long announcement and cover use one multipart message without data loss',async()=>{
 const body='x'.repeat(4097),cover=new Blob(['fake-png'],{type:'image/png'}),message=buildMessage('Test',body,cover);
 assert.equal(message.attached,true);assert.equal(message.files.length,2);assert.equal(await message.files[0].blob.text(),body);
 assert.equal(message.payload.embeds[0].url,'https://enthusia.info/news');
 let calls=0;const result=await sendTest(hook,message,async(_url,options)=>{calls++;assert.ok(options.body instanceof FormData);const payload=JSON.parse(options.body.get('payload_json'));assert.deepEqual(payload.allowed_mentions,{parse:[]});assert.equal(payload.embeds[0].image.url,'attachment://cover.png');assert.equal(await options.body.get('files[0]').text(),body);return Response.json({id:'123456789012345679'});});
 assert.deepEqual(result,{status:'sent'});assert.equal(calls,1);
});
test('uncertain delivery never retries and bad cover is rejected',async()=>{
 const message=buildMessage('Test','body');let calls=0;
 assert.deepEqual(await sendTest(hook,message,async()=>{calls++;throw Error('connection');}),{status:'uncertain'});assert.equal(calls,1);
 assert.throws(()=>buildMessage('Test','body',new Blob(['x'],{type:'text/html'})));
});
test('rate-limited requests may retry only after explicit Discord rejection',async()=>{
 let calls=0;const sent=await sendTest(hook,buildMessage('Test','body'),async()=>{calls++;return calls===1?new Response('',{status:429,headers:{'retry-after':'0'}}):Response.json({id:'123456789012345679'});});
 assert.deepEqual(sent,{status:'sent'});assert.equal(calls,2);
});
