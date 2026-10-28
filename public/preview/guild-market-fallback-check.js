import {mergeMarketGuildBanners} from '../assets/guild-market-banners.js';
const id='23d9b7de-38cb-4ae1-9d3f-1bf124b0a34f';
const design={baseColor:'BLACK',patterns:[{type:'STRIPE_LEFT',color:'YELLOW'},{type:'TRIANGLE_BOTTOM',color:'BLACK'},{type:'STRIPE_DOWNLEFT',color:'YELLOW'},{type:'BORDER',color:'BLACK'}]};
const buttons=[document.querySelector('#ready'),document.querySelector('#missing')];
function show(available){const stalls=available?[{owner:{type:'GUILD',id,avatar:{kind:'GUILD_BANNER',banner:design}}}]:[];const item=mergeMarketGuildBanners([{id,name:'Vibe',banner:null}],{stalls})[0];const node=item.banner?window.EnthusiaGuildBannerRenderer.create(item.banner,'Vibe banner'):window.EnthusiaGuildBannerRenderer.createPlaceholder('Vibe');node.classList.add('banner');document.querySelector('#banner').replaceChildren(node);document.querySelector('#status').textContent=item.banner?'Public market banner matched by guild ID.':'Banner design unavailable; neutral placeholder shown.';buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===(available?0:1))));}
buttons[0].addEventListener('click',()=>show(true));buttons[1].addEventListener('click',()=>show(false));show(true);
