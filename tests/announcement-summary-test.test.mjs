import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSummaryTest} from '../public/assets/announcement-summary-test.js';
import {sendTest} from '../public/assets/discord-live-test.js';

test('summary sends one embed and one cover without enabling mentions',async()=>{
  const cover=new Blob(['cover'],{type:'image/png'}), message=buildSummaryTest('Update','Hello @everyone',cover);
  assert.equal(message.payload.embeds.length,1);assert.equal(message.files.length,1);
  assert.deepEqual(message.payload.allowed_mentions,{parse:[]});
  let calls=0;
  const result=await sendTest('https://discord.com/api/webhooks/123456789012345678/fixture?wait=true',message,async(_url,options)=>{
    calls++;const payload=JSON.parse(options.body.get('payload_json'));
    assert.equal(payload.embeds[0].image.url,'attachment://cover.png');
    assert.equal(payload.embeds[0].url,'https://enthusia.info/news');
    assert.equal(await options.body.get('files[0]').text(),'cover');
    return Response.json({id:'123456789012345679'});
  });
  assert.equal(calls,1);assert.equal(result.status,'sent');
});
test('summary validation rejects empty text and invalid cover',()=>{
  assert.throws(()=>buildSummaryTest('','text'));
  assert.throws(()=>buildSummaryTest('title',''));
  assert.throws(()=>buildSummaryTest('title','text',new Blob(['x'],{type:'text/plain'})));
});
