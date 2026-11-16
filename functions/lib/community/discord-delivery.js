// Discord webhook delivery is performed by the scheduled worker, never by the
// page request. Unknown transport outcomes remain uncertain to prevent blind retries.
export function queueAnnouncement(db,record,revision,now) {
 const channel=record.kind==='changelog'||record.category.toLowerCase()==='changelog'?'changelog':'news';
 return db.prepare(`INSERT INTO community_discord_delivery(kind,slug,revision,title,channel,status,updated_at)
 SELECT ?,?,?,?,?,'pending',? WHERE changes()>0 ON CONFLICT(kind,slug) DO NOTHING`)
 .bind(record.kind,record.slug,revision,record.title,channel,now);
}
export async function deliveryStatus(db,kind,slug) {
 return db.prepare('SELECT status,attempts,updated_at AS updatedAt,error_code AS errorCode FROM community_discord_delivery WHERE kind=? AND slug=?').bind(kind,slug).first();
}
export async function retryDelivery(db,kind,slug,confirmUncertain=false) {
 const result=await db.prepare("UPDATE community_discord_delivery SET status='pending',updated_at=?,error_code=NULL WHERE kind=? AND slug=? AND (status='failed' OR (status='uncertain' AND ?=1))")
 .bind(new Date().toISOString(),kind,slug,confirmUncertain?1:0).run();
 return Boolean(result.meta.changes);
}
