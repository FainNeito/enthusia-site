import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {hallItems,hallDescription,hallTitle,trophyTemplate,trophyDate} from '../public/assets/halloffame-model.js';

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

test('historical trophy dates come from their matching original preview cards',async()=>{
  const html=await readFile(new URL('../public/halloffame.html',import.meta.url),'utf8');
  const expected=[['media-event-stepsoy','1 Jul 2026'],['first-guild-to-level-100-vibe','28 Jun 2026'],
    ['first-pvp-tournament-oinkermc','21 Jun 2026'],['the-end-fight-vibe-dogeclan-and-boopgang','9 May 2026'],
    ['end-of-the-world-flomish-prologue-champion','11 Apr 2026'],['the-beta-end-event-enthusiast-and-blood-guard','26 Dec 2025'],
    ['top-bug-hunter-redstoneisgreat','18 Nov 2025'],['koth-at-haunted-hill-p2wn-borlyn-and-doge198','15 Nov 2025'],
    ['100-advertisement-event-flashstrength-and-p2wn','15 Nov 2025']];
  for(const [slug,date] of expected){
    const index=trophyTemplate(slug),match=html.match(new RegExp(`<template data-collection-template="" data-variant="${index}"[\\s\\S]*?</template>`));
    assert.ok(match?.[0].includes(`>${date}</span>`),slug);
    assert.equal(new Date(trophyDate({slug})).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}),date,slug);
  }
  assert.equal(trophyDate({slug:'mapart-competition'}),null);
  assert.equal(trophyDate({slug:'halloween-build-competition'}),null);
  assert.equal(trophyDate({slug:'media-event-stepsoy',date:'2026-07-02T00:00:00Z'}),'2026-07-02T00:00:00Z');
});
