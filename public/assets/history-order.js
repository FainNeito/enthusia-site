import { orderNewsPosts } from './news-order.js';

// Keep the original data/binding indexes stable while moving existing rows.
export function createHistoryOrder(entries, eras = []) {
  const groups = new Map();
  for (const entry of entries) {
    const parent = entry.node.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(entry);
  }
  return (order = 'newest') => {
    const orderedEras = eras.map(era => {
      const rows = entries.filter(entry => entry.era === era);
      const dated = orderNewsPosts(rows, order).find(entry => Number.isFinite(Date.parse(entry.date)));
      return { date: dated?.date ?? null, node: era };
    });
    for (const [parent, rows] of groups) {
      for (const row of orderNewsPosts(rows, order)) parent.append(row.node);
    }
    if (orderedEras.length) {
      const parent = orderedEras[0].node.parentElement;
      for (const era of orderNewsPosts(orderedEras, order)) parent.append(era.node);
    }
  };
}
