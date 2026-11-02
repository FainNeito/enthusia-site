// Optional authenticated producer. Never forward browser credentials or follow redirects.
export async function readLiveGuildDirectory(env, fetchImpl = fetch) {
  if (!env.GUILDS_DIRECTORY_API_URL || !env.GUILDS_API_BEARER) return null;
  let url;
  try { url = new URL(env.GUILDS_DIRECTORY_API_URL); } catch { return null; }
  if (url.protocol !== 'https:' || url.username || url.password) return null;
  const headers = {Accept:'application/json', Authorization:`Bearer ${env.GUILDS_API_BEARER}`};
  if (env.CF_ACCESS_CLIENT_ID && env.CF_ACCESS_CLIENT_SECRET) {
    headers['CF-Access-Client-Id'] = env.CF_ACCESS_CLIENT_ID;
    headers['CF-Access-Client-Secret'] = env.CF_ACCESS_CLIENT_SECRET;
  }
  const entries=[], ids=new Set();let offset=0, revision=null, total=null, generatedAt=null;
  try {
    for (let page=0;page<20;page++) {
      url.searchParams.set('offset',String(offset));url.searchParams.set('limit','50');
      if (revision !== null) url.searchParams.set('revision',revision);
      const response=await fetchImpl(url.toString(),{headers,redirect:'error',signal:globalThis.AbortSignal.timeout(5000)});
      if (!response.ok) return null;
      const data=await response.json();
      const stamp=Date.parse(data.generatedAt);
      if (!Number.isFinite(stamp) || stamp>Date.now()+300000 || !/^[0-9a-f]{64}$/.test(data.directoryRevision) ||
          !Number.isInteger(data.total) || data.total<0 || data.total>1000 || data.offset!==offset ||
          !Array.isArray(data.entries) || data.entries.length>50) return null;
      if (revision!==null && (revision!==data.directoryRevision || total!==data.total || data.generatedAt!==generatedAt)) return null;
      revision=data.directoryRevision;total=data.total;
      generatedAt=data.generatedAt;
      for (const entry of data.entries) {
        if (!entry || typeof entry.id!=='string' || ids.has(entry.id)) return null;
        ids.add(entry.id);entries.push(entry);
      }
      const expected=offset+data.entries.length;
      if (data.nextOffset===null || data.nextOffset===undefined) {
        return expected===total ? {entries,generatedAt} : null;
      }
      if (data.entries.length===0 || data.nextOffset!==expected || expected>=total) return null;
      offset=expected;
    }
  } catch { return null; }
  return null;
}

// This public leaderboard is a partial set; a roster is published only if all members resolve.
export async function readPublicLeaderboardPlayers(fetchImpl = fetch) {
  try {
    const response=await fetchImpl('https://enthusia.info/api/leaderboards/playtime-active-all',{
      headers:{Accept:'application/json'},redirect:'error',signal:globalThis.AbortSignal.timeout(3000)
    });
    if (!response.ok) return [];
    const data=await response.json(),stamp=Date.parse(data.generatedAt);
    if (!Number.isFinite(stamp) || stamp>Date.now()+300000 || Date.now()-stamp>900000 ||
        !Array.isArray(data.players) || data.players.length>1000) return [];
    return data.players.filter(player=>typeof player?.uuid==='string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(player.uuid) &&
      typeof player.username==='string' && /^[A-Za-z0-9_]{3,16}$/.test(player.username))
      .map(player=>({id:player.uuid,name:player.username}));
  } catch { return []; }
}

// Only resolve names already present in the website's public player snapshot.
// An incomplete or malformed roster remains unavailable instead of looking complete.
export function resolvePublicGuildMembers(directory, players) {
  const known=new Map(), conflicts=new Set();
  for (const player of players) {
    if (typeof player?.id==='string' && typeof player.name==='string' && player.name.trim()) {
      const key=player.id.toLowerCase();
      if (known.has(key) && known.get(key)!==player.name) conflicts.add(key);
      known.set(key,player.name);
    }
  }
  return {...directory,entries:directory.entries.map(entry=>{
    if (!Array.isArray(entry.memberUuids) || entry.memberUuids.length>200 ||
        entry.memberUuids.length!==entry.memberCount ||
        entry.memberUuids.some(id=>typeof id!=='string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) return entry;
    const ids=entry.memberUuids.map(id=>id.toLowerCase());
    if (new Set(ids).size!==ids.length || ids.some(id=>!known.has(id) || conflicts.has(id))) return entry;
    return {...entry,membersList:ids.map(id=>known.get(id))};
  })};
}
