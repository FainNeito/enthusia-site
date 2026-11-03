import { priceVerdict } from './exact-prices.js';
import { findMarketItem } from './exact-items.js';
import { api,el } from '../community-dom.js';
import { marketHistoryModel,applyMarketHistory,marketMovers,historyPosition,nearestHistoryIndex,previousMarketWinner,marketStallId,marketStallLabel } from './history-model.js?v=3';
import { drawMarketShareCard } from './share-card.js';
import { drawHistoryChart } from './history-chart.js';
import { marketWeekKey,marketWeekStart } from './eastern-week.js';
const preview=document.documentElement.hasAttribute('data-preview-root');
window.EnthusiaMarketDesignApi=api;
window.EnthusiaMarketPriceVerdict=priceVerdict;
window.EnthusiaMarketFindItem=findMarketItem;
window.EnthusiaMarketHistory={marketMovers,historyPosition,nearestHistoryIndex,previousMarketWinner,marketStallId,marketStallLabel,marketWeekKey,marketWeekStart};
window.EnthusiaMarketDrawShareCard=drawMarketShareCard;
window.EnthusiaMarketDrawHistoryChart=drawHistoryChart;
function week(offset=0){return marketWeekKey(new Date(),offset);}
async function loadHistory(item){
  if(item.loading||item.loaded)return;item.loading=true;
  try{
    const data=await api('insights?item='+encodeURIComponent(item.key));
    applyMarketHistory(item,data.history);window.EnthusiaMarketDesignRefresh();
  }catch(error){window.EnthusiaMarketDesignHistoryError?.(item,error.message);}
  finally{item.loading=false;}
}
function installLiveLoaders(model){
  window.EnthusiaMarketDesignLoadWeek=async(offset,mode)=>{
    const data=await api('insights?week='+week(offset)+'&mode='+mode);
    const rows=data.leaders.map(value=>({...value,stall:value.name,sales:value.quantity,best:[]}));
    const boards=mode==='guild'?(model.guildBoards??={}):model.boards;
    boards[String(offset)]=rows;return rows;
  };
  window.EnthusiaMarketDesignLoadHistory=loadHistory;
}
async function start(){
  try{
    let model;
    if(preview){
      model=await api('market-design');model.preview=true;
      // Explicit sample-only mode exercises the production stall-ID presentation.
      if(new URL(location.href).searchParams.get('market-integrity-demo')==='1'){
        const now=marketWeekKey(new Date()),last=marketWeekKey(now,-1);
        model.currentWeek=marketWeekStart(now).toISOString();model.weeks=[now,last];
        model.winners=[{...model.winners[0],name:'stall1',stall:'stall1',week:last,best:[]}];
        model.live=[{...model.live[0],name:'stall2',stall:'stall2'}];
        model.boards={'-1':model.winners};model.stallTotals={stall1:18420,stall2:9860};
        model.preview=false;
      }
    }
    else {
      const [current,previous]=await Promise.all([api('insights'),api('insights?week='+week(-1))]);
      model=marketHistoryModel(current,previous);installLiveLoaders(model);
      document.querySelector('#mi-title')?.parentElement.querySelector('p:last-child')?.replaceChildren('Recorded sales, Monday to Sunday Eastern Time. The completed winner is shown when that week ends.');
      for(const label of document.querySelectorAll('.mi-head .h7'))label.textContent='30d change';
      for(const label of document.querySelectorAll('.mi-head .hs'))label.textContent='Recorded days';
      const notes=document.querySelectorAll('#price-tracker .mi-note');
      for(const note of notes)note.textContent='Material averages from completed SELL transactions. Item variants and historical stall or guild ownership may be unavailable.';
      const legacyNote=document.querySelector('#price-tracker>p:last-child');
      if(legacyNote?.textContent.includes('Stand-in numbers'))legacyNote.textContent='Recorded sales only. Missing history stays unavailable.';
    }
    window.EnthusiaMarketDesignModel=model;
    // Standings may omit banners; join only public guild profiles, without blocking sales data.
    const guilds=await api('guilds').catch(()=>({items:[]}));
    model.guildBanners=new Map(guilds.items.filter(guild=>guild.banner).map(guild=>[guild.name.toLowerCase(),guild.banner]));
    const script=document.createElement('script');const view=new URL('./exact-view.js',import.meta.url);view.searchParams.set('v','stall-integrity-20261102');script.src=view.href;document.body.append(script);
  }catch(error){for(const id of ['mi-strip','mi-winner','mi-week','mi-rows','mi-detail'])document.getElementById(id)?.replaceChildren(el('p',{class:'mi-empty',role:'status',text:error.message}));}
}
start();
