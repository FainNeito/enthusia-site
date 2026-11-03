import {el} from './community-dom.js';
import {trophyTemplate,trophyDate,hallItems,hallDescription,hallTitle} from './halloffame-model.js';

function dateText(value){
  if(!value||!Number.isFinite(Date.parse(value)))return '';
  return new Date(value).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
}
function champions(section,items){
  const grid=section.querySelector('.tip .eq'),sample=grid?.querySelector('.panel');
  if(!grid||!sample)return;
  const rows=hallItems(items,'Reigning champions').map(item=>{
    const card=sample.cloneNode(true),parts=hallTitle(item),paragraphs=card.querySelectorAll('p');
    paragraphs[0].textContent=parts.event;card.querySelector('h3').textContent=parts.winner||parts.event;
    paragraphs[1].textContent=hallDescription(item);paragraphs[2].textContent=dateText(item.date);
    return card;
  });
  grid.replaceChildren(...rows);
  if(!rows.length)grid.append(el('p',{text:'No reigning champions have been published yet.'}));
}
function trophies(section,items,templates){
  const grid=section.querySelector('.grid3'),rows=hallItems(items,'Trophy wall'),eras=[];
  if(!grid)return eras;
  const cards=rows.map((item,index)=>{
    const original=templates.get(trophyTemplate(item.slug))??templates.get(0),card=original.content.firstElementChild.cloneNode(true);
    const era=trophyTemplate(item.slug)===undefined?'unknown':original.dataset.group,parts=hallTitle(item);
    eras.push(era);card.dataset.apiRecord='';card.setAttribute('data-b-class',`panel {{t${index}}}`);
    const title=card.querySelector('h3'),event=card.querySelector('p'),description=card.querySelector(':scope > p');
    event.textContent=parts.event;title.textContent=parts.winner;
    if(!parts.winner)title.hidden=true;
    description.textContent=hallDescription(item);
    card.querySelector('[aria-label="Podium"]')?.remove();
    const footer=card.lastElementChild,tag=footer.querySelector('.tag');
    if(tag)tag.textContent=({ch2:'Chapter 2',ch1:'Chapter 1',beta:'Open Betas',unknown:'Era unavailable'})[era];
    const last=footer.querySelector('span:not(.tag)');if(last)last.textContent=dateText(trophyDate(item));
    return card;
  });
  grid.replaceChildren(...cards);
  if(!cards.length)grid.append(el('p',{text:'No trophies have been published yet.'}));
  return eras;
}
function records(section,items){
  const records=hallItems(items,'Server records'),stats=section.querySelector('.stats'),panel=section.querySelector('.tip');
  if(stats)stats.remove();
  if(!panel)return;
  panel.replaceChildren(...records.flatMap(item=>[el('h3',{text:item.title}),el('p',{text:hallDescription(item),style:'white-space:pre-wrap'})]));
  if(!records.length)panel.append(el('p',{text:'No server records have been published yet.'}));
}
function firsts(section,items){
  const list=section.querySelector('ul.plain');if(!list)return;
  const rows=hallItems(items,'Firsts').slice().sort((a,b)=>String(a.date??'').localeCompare(String(b.date??'')));
  list.replaceChildren(...rows.map(item=>el('li',{class:'shop'},[
    el('span',{text:dateText(item.date),style:'flex:0 0 120px;color:var(--muted)'}),
    el('span',{text:item.title,style:'flex:1 1 200px;min-width:0;color:var(--head)'}),
    el('span',{text:hallDescription(item),style:'flex:3 1 320px;min-width:0;white-space:pre-wrap'})
  ])));
  if(!rows.length)list.append(el('li',{text:'No firsts have been published yet.'}));
  // Retired honours in the design are examples; show them only when records exist.
  const heading=list.nextElementSibling,description=heading?.nextElementSibling,grid=description?.nextElementSibling;
  const honours=hallItems(items,'Retired honours');
  if(grid&&description&&heading){
    if(!honours.length){heading.remove();description.remove();grid.remove();}
    else grid.replaceChildren(...honours.map(item=>el('div',{class:'panel',style:'padding:20px'},[el('span',{class:'tag tag-dark',text:item.title}),el('p',{text:hallDescription(item)})])));
  }
}
export function renderHallOfFame(items,templates){
  const section=document.querySelector('section[aria-label="Reigning champions"]');
  const recordSection=document.querySelector('section[aria-label="Server records"]');
  const firstSection=document.querySelector('section[aria-label="Firsts and retired honours"]');
  if(!section||!recordSection||!firstSection)throw new Error('Hall of Fame layout unavailable');
  champions(section,items);const eras=trophies(section,items,templates);records(recordSection,items);firsts(firstSection,items);
  section.hidden=false;recordSection.hidden=false;firstSection.hidden=false;
  return eras;
}
