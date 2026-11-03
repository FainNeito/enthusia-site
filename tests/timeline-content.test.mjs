import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {timelineDisplayBody} from '../public/assets/timeline-content.js';

test('timeline display removes only the exact trailing import notice',()=>{
  const body='The original description.\n\nSource verification pending. Imported from the supplied site content.';
  assert.equal(timelineDisplayBody(body),'The original description.');
  assert.equal(timelineDisplayBody('An unrelated source verification pending note.'),'An unrelated source verification pending note.');
  assert.equal(timelineDisplayBody('Source verification pending. Imported from the supplied site content. More history.'),'Source verification pending. Imported from the supplied site content. More history.');
  assert.equal(timelineDisplayBody(undefined),undefined);
});

test('the published timeline snapshot keeps its descriptions when the legacy notices are hidden',async()=>{
  const snapshot=JSON.parse(await readFile(new URL('../public/preview/timeline-published-capture.json',import.meta.url),'utf8'));
  for(const item of snapshot.items){
    const original=item.body;
    const display=timelineDisplayBody(original);
    assert.ok(display.length>0,item.slug);
    assert.ok(original.startsWith(display),item.slug);
    assert.equal(item.body,original,item.slug);
    assert.ok(!display.endsWith('Source verification pending. Imported from the supplied site content.'),item.slug);
  }
});
