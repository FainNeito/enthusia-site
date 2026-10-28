const DYES=new Set(['WHITE','ORANGE','MAGENTA','LIGHT_BLUE','YELLOW','LIME','PINK','GRAY','LIGHT_GRAY','CYAN','PURPLE','BLUE','BROWN','GREEN','RED','BLACK']);
const uuid=value=>typeof value==='string'&&/^(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i.test(value)?value.toLowerCase().replaceAll('-',''):null;
function validBanner(value){
 if(!value||!DYES.has(value.baseColor)||!Array.isArray(value.patterns)||value.patterns.length>20)return null;
 if(!value.patterns.every(p=>p&&DYES.has(p.color)&&typeof p.type==='string'&&/^[A-Z_]{1,40}$/.test(p.type)))return null;
 return {baseColor:value.baseColor,patterns:value.patterns.map(p=>({type:p.type,color:p.color}))};
}
export function mergeMarketGuildBanners(items,snapshot){
 if(!Array.isArray(items)||!Array.isArray(snapshot?.stalls)||snapshot.stalls.length>1000)return items;
 const banners=new Map(),conflicts=new Set();
 for(const stall of snapshot.stalls){const owner=stall?.owner,id=uuid(owner?.id),banner=validBanner(owner?.avatar?.banner);
  if(owner?.type!=='GUILD'||owner?.avatar?.kind!=='GUILD_BANNER'||!id||!banner)continue;
  if(banners.has(id)&&JSON.stringify(banners.get(id))!==JSON.stringify(banner))conflicts.add(id);
  banners.set(id,banner);
 }
 return items.map(item=>{const id=uuid(item.id),banner=!item.banner&&id&&!conflicts.has(id)?banners.get(id):null;return banner?{...item,banner}:item;});
}
