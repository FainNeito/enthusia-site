import {timelineDisplayBody} from './timeline-content.js';

// These mappings come from the corresponding cards in the original Hall of Fame preview.
const trophyTemplates=new Map([
  ['halloween-build-competition',0],['mapart-competition',1],['media-event-stepsoy',2],
  ['first-guild-to-level-100-vibe',3],['first-pvp-tournament-oinkermc',4],
  ['the-end-fight-vibe-dogeclan-and-boopgang',5],['end-of-the-world-flomish-prologue-champion',6],
  ['the-beta-end-event-enthusiast-and-blood-guard',7],['top-bug-hunter-redstoneisgreat',8],
  ['koth-at-haunted-hill-p2wn-borlyn-and-doge198',9],['100-advertisement-event-flashstrength-and-p2wn',10]
]);
export function trophyTemplate(slug){return trophyTemplates.get(slug);}
export function hallItems(items,category){return items.filter(item=>item.category?.toLowerCase()===category.toLowerCase());}
export function hallDescription(item){return timelineDisplayBody(item.body)??'';}
export function hallTitle(item){
  const value=item.title??'',at=value.indexOf(': ');
  if(at>=0)return {event:value.slice(0,at),winner:value.slice(at+2)};
  return {event:value,winner:item.tags?.includes('To be decided')?'To be decided':''};
}
