import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { handleCommunity } from '../functions/lib/community/service.js';
import { dispatchAnnouncements } from '../cloudflare/discord-announcements/worker.js';
const {Miniflare}=createRequire(pathToFileURL(process.env.LOCAL_MINIFLARE_PACKAGE))('miniflare');
const mf=new Miniflare({modules:true,script:"export default {fetch(){return new Response('ok')}}",d1Databases:['DB']});
try {
 const db=await mf.getD1Database('DB');
 for(const file of ['0001_community.sql','0002_discord_delivery.sql'])for(const statement of readFileSync(new URL('../migrations/community/'+file,import.meta.url),'utf8').split(';').map(v=>v.trim()).filter(Boolean))await db.prepare(statement).run();
 const req=(status,revision)=>handleCommunity({request:new Request('https://site.example/api/community/admin/news',{method:'POST',headers:{origin:'https://site.example'},body:JSON.stringify({kind:'news',slug:'sample',title:'Sample',body:'text',status,revision})}),params:{path:'admin/news'},env:{COMMUNITY_DB:db}},{editor:async()=>({id:'editor'}),identity:async()=>null});
 assert.equal((await req('draft',0)).status,200);assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM community_discord_delivery').first()).n,0);
 assert.equal((await req('published',1)).status,200);assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM community_discord_delivery').first()).n,1);
 assert.equal((await req('published',1)).status,409);assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM community_discord_delivery').first()).n,1);
 const env={COMMUNITY_DB:db,COMMUNITY_DISCORD_ENABLED:'true',COMMUNITY_DISCORD_NEWS_WEBHOOK:'https://discord.com/api/webhooks/123456789012345678/fixture'};
 await dispatchAnnouncements(env,async()=>Response.json({id:'123456789012345679'}));
 assert.equal((await db.prepare('SELECT status FROM community_discord_delivery').first()).status,'sent');
 console.log('Local D1 publication queue and revision checks passed');
} finally {await mf.dispose();}
