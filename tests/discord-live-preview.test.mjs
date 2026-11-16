import test from 'node:test';
import assert from 'node:assert/strict';
import {webhookUrl,buildMessage,sendTest,addSelectedImages} from '../public/assets/discord-live-test.js';
const hook='https://discord.com/api/webhooks/123456789012345678/fixture-token';
test('webhook validation only allows a direct Discord HTTPS webhook',()=>{
 assert.equal(webhookUrl(hook),hook+'?wait=true');
 for(const value of ['http://discord.com/api/webhooks/123456789012345678/fixture-token','https://discord.com.evil.test/api/webhooks/123456789012345678/fixture-token',hook+'?bad=1','https://user@discord.com/api/webhooks/123456789012345678/fixture-token'])assert.equal(webhookUrl(value),null);
});
test('announcements fitting Discord embed limits remain in one message without pings',async()=>{
 const body='😀'.repeat(2048),message=buildMessage('Test',body,[],'Changelog');
 assert.equal(message.files.length,0);assert.equal(message.payload.embeds[0].description,body);
 assert.equal(message.payload.embeds[0].url,'https://enthusia.info/changelog');
 let calls=0;const sent=await sendTest(hook,message,async(_url,options)=>{calls++;const data=JSON.parse(options.body);assert.equal(data.embeds[0].description,body);assert.deepEqual(data.allowed_mentions,{parse:[]});return Response.json({id:'123456789012345679'});});
 assert.deepEqual(sent,{status:'sent'});assert.equal(calls,1);
});
test('long announcement and cover use one multipart message without data loss',async()=>{
 const body='x'.repeat(4097),cover=new Blob(['fake-png'],{type:'image/png'}),second=new Blob(['fake-jpeg'],{type:'image/jpeg'}),message=buildMessage('Test',body,[cover,second]);
 assert.equal(message.attached,true);assert.equal(message.files.length,3);assert.equal(await message.files[0].blob.text(),body);
 assert.equal(message.payload.embeds.length,2);assert.equal(message.payload.embeds[1].image.url,'attachment://image-2.jpg');
 assert.equal(message.payload.embeds[0].url,'https://enthusia.info/news');
 let calls=0;const result=await sendTest(hook,message,async(_url,options)=>{calls++;assert.ok(options.body instanceof FormData);const payload=JSON.parse(options.body.get('payload_json'));assert.deepEqual(payload.allowed_mentions,{parse:[]});assert.equal(payload.embeds[0].image.url,'attachment://image-1.png');assert.equal(await options.body.get('files[0]').text(),body);assert.equal(await options.body.get('files[2]').text(),'fake-jpeg');return Response.json({id:'123456789012345679'});});
 assert.deepEqual(result,{status:'sent'});assert.equal(calls,1);
});
test('adding pictures across separate selections preserves earlier images and rejects invalid additions',async()=>{
 const first=new Blob(['first'],{type:'image/png'}),second=new Blob(['second'],{type:'image/jpeg'});
 const initial=addSelectedImages([], [first]),combined=addSelectedImages(initial,[second]);
 assert.deepEqual(initial,[first]);assert.deepEqual(combined,[first,second]);
 const result=buildMessage('Test','body',combined);
 assert.equal(result.payload.embeds.length,2);assert.equal(await result.files[0].blob.text(),'first');assert.equal(await result.files[1].blob.text(),'second');
 assert.throws(()=>addSelectedImages(combined,[new Blob(['invalid'],{type:'text/plain'})]));
 assert.equal(combined.length,2);
 assert.throws(()=>addSelectedImages(combined,Array(8).fill(first)));
});
test('uncertain delivery never retries and bad cover is rejected',async()=>{
 const message=buildMessage('Test','body');let calls=0;
 assert.deepEqual(await sendTest(hook,message,async()=>{calls++;throw Error('connection');}),{status:'uncertain'});assert.equal(calls,1);
 assert.throws(()=>buildMessage('Test','body',[new Blob(['x'],{type:'text/html'})]));
 assert.throws(()=>buildMessage('Test','body',Array(10).fill(new Blob(['x'],{type:'image/png'}))));
});
test('rate-limited requests may retry only after explicit Discord rejection',async()=>{
 let calls=0;const sent=await sendTest(hook,buildMessage('Test','body'),async()=>{calls++;return calls===1?new Response('',{status:429,headers:{'retry-after':'0'}}):Response.json({id:'123456789012345679'});});
 assert.deepEqual(sent,{status:'sent'});assert.equal(calls,2);
});
