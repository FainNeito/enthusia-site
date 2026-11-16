/* global URL, fetch, AbortSignal, Response, crypto */
function webhook(raw){
 try {const url=new URL(String(raw??''));return url.protocol==='https:'&&['discord.com','discordapp.com'].includes(url.hostname)&&!url.username&&!url.password&&/^\/api\/webhooks\/\d{16,22}\/[A-Za-z0-9._-]+$/.test(url.pathname)&&!url.search&&!url.hash?url:null;}catch{return null;}
}
export async function dispatchAnnouncements(env,fetchImpl=fetch){
 if(env.COMMUNITY_DISCORD_ENABLED!=='true'||!env.COMMUNITY_DB)return {enabled:false};
 const db=env.COMMUNITY_DB,now=new Date().toISOString(),expired=new Date(Date.now()-120000).toISOString();
 await db.prepare("UPDATE community_discord_delivery SET status='uncertain',error_code='interrupted',claim_id=NULL,updated_at=? WHERE status='processing' AND updated_at<?").bind(now,expired).run();
 const rows=await db.prepare("SELECT d.kind,d.slug,d.revision,d.title,d.channel FROM community_discord_delivery d JOIN community_records r ON r.kind=d.kind AND r.slug=d.slug WHERE d.status='pending' AND r.status='published' ORDER BY d.updated_at LIMIT 10").all();
 for(const row of rows.results){
  const claim=crypto.randomUUID();
  const claimed=await db.prepare("UPDATE community_discord_delivery SET status='processing',claim_id=?,attempts=attempts+1,updated_at=? WHERE kind=? AND slug=? AND status='pending' AND EXISTS (SELECT 1 FROM community_records WHERE kind=? AND slug=? AND status='published')").bind(claim,new Date().toISOString(),row.kind,row.slug,row.kind,row.slug).run();
  if(!claimed.meta.changes)continue;
  const endpoint=webhook(row.channel==='news'?env.COMMUNITY_DISCORD_NEWS_WEBHOOK:env.COMMUNITY_DISCORD_CHANGELOG_WEBHOOK);
  let status='failed',error='configuration',messageId=null;
  if(endpoint){
   try{
    endpoint.searchParams.set('wait','true');
    const url='https://enthusia.info/'+(row.kind==='news'?'news#'+encodeURIComponent(row.slug):'changelog');
    const result=await fetchImpl(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:`**${row.channel==='news'?'News':'Changelog'}:** ${row.title}\n${url}`,allowed_mentions:{parse:[]}}),signal:AbortSignal.timeout(10000),redirect:'error'});
    if(result.ok){const data=await result.json();if(typeof data.id==='string'&&/^\d{16,22}$/.test(data.id)){status='sent';error=null;messageId=data.id;}else{status='uncertain';error='missing_confirmation';}}
    else if(result.status>=400&&result.status<500){status='failed';error=result.status===429?'rate_limited':'discord_rejected';}
    else{status='uncertain';error='discord_unconfirmed';}
   }catch{status='uncertain';error='connection_unconfirmed';}
  }
  await db.prepare("UPDATE community_discord_delivery SET status=?,error_code=?,message_id=?,claim_id=NULL,updated_at=? WHERE kind=? AND slug=? AND status='processing' AND claim_id=?").bind(status,error,messageId,new Date().toISOString(),row.kind,row.slug,claim).run();
 }
 return {enabled:true,processed:rows.results.length};
}
export default {scheduled(_event,env,ctx){ctx.waitUntil(dispatchAnnouncements(env));},fetch(){return new Response('Not found',{status:404});}};
