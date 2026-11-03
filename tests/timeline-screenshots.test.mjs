import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {historicalScreenshotTemplate,restoreTimelineScreenshots} from '../public/assets/timeline-screenshots.js';

test('historical screenshots map to their original event templates', async()=>{
  const html=await readFile(new URL('../public/timeline.html',import.meta.url),'utf8');
  const expected=[
    ['closed-beta-20251003','Closed Beta',1],
    ['first-open-beta-opens-20251031','First Open Beta opens',1],
    ['koth-at-haunted-hill-20251115','KOTH at Haunted Hill',1],
    ['final-open-beta-opens-20251220','Final Open Beta opens',1],
    ['the-beta-end-event-20251226','The beta End event',2],
    ['the-prologue-begins-20260102','The Prologue begins',1],
    ['end-of-the-world-20260411','End of the World',1],
    ['full-release-20260502','Full release',1],
    ['market-opens-then-pauses-20260703','Market opens, then pauses',1]
  ];
  for(const [slug,title,count] of expected){
    const index=historicalScreenshotTemplate(slug);
    const match=html.match(new RegExp(`<template data-collection-template="" data-variant="${index}"[\\s\\S]*?</template>`));
    assert.ok(match,slug);assert.ok(match[0].includes(`>${title}</h3>`),slug);
    assert.equal((match[0].match(/class="ev-shot"/g)||[]).length,count,slug);
  }
  assert.equal(historicalScreenshotTemplate('unrelated-event'),undefined);
});

test('restoration copies every original screenshot and respects a record image',()=>{
  const shots=[{cloneNode:()=>({id:1})},{cloneNode:()=>({id:2})}];
  const templates=new Map([[21,{content:{querySelectorAll:()=>shots}}]]);
  const result=[],node={querySelector:()=>({append:shot=>result.push(shot)})};
  restoreTimelineScreenshots(node,{slug:'the-beta-end-event-20251226'},templates);
  assert.deepEqual(result,[{id:1},{id:2}]);
  restoreTimelineScreenshots(node,{slug:'the-beta-end-event-20251226',image:'https://example.org/own.png'},templates);
  restoreTimelineScreenshots(node,{slug:'unrelated'},templates);
  assert.equal(result.length,2);
});

test('timeline preview includes the captured published descriptions',async()=>{
  const snapshot=JSON.parse(await readFile(new URL('../public/preview/timeline-published-capture.json',import.meta.url),'utf8'));
  const item=snapshot.items.find(row=>row.slug==='the-beta-end-event-20251226');
  assert.ok(item.body.includes('Enthusiast and Blood Guard'));
  assert.ok(snapshot.items.length>=79);
  assert.ok(snapshot.items.every(row=>typeof row.body==='string'&&row.body.length>0));
});
