import { isWarning } from './punishment-presentation.js?v=2';

export const isActivePunishment = item => item?.state === 'ACTIVE' && !isWarning(item);

// Scan a bounded number of empty pages; preserve the cursor so the user can continue.
export async function loadActivePunishmentPages(fetchPage, cursor = null, maxPages = 5) {
  const seen = new Set(cursor ? [cursor] : []);
  for (let page = 0; page < maxPages; page++) {
    const payload = await fetchPage(cursor);
    const items = (Array.isArray(payload?.items) ? payload.items : []).filter(isActivePunishment);
    const nextCursor = payload?.nextCursor || null;
    if (nextCursor && seen.has(nextCursor)) throw new Error('repeated_punishment_cursor');
    if (items.length || !nextCursor) return { items, nextCursor };
    seen.add(nextCursor);
    cursor = nextCursor;
  }
  return { items: [], nextCursor: cursor };
}
