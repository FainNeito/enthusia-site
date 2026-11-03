// Exact published record slugs mapped to their original timeline design templates.
const historicalTemplates = new Map([
  ['closed-beta-20251003', 5],
  ['first-open-beta-opens-20251031', 7],
  ['koth-at-haunted-hill-20251115', 12],
  ['final-open-beta-opens-20251220', 19],
  ['the-beta-end-event-20251226', 21],
  ['the-prologue-begins-20260102', 23],
  ['end-of-the-world-20260411', 35],
  ['full-release-20260502', 38],
  ['market-opens-then-pauses-20260703', 59]
]);

export function historicalScreenshotTemplate(slug) {
  return historicalTemplates.get(slug);
}

export function restoreTimelineScreenshots(node, item, templates) {
  if (item.image) return;
  const source = templates.get(historicalScreenshotTemplate(item.slug));
  const card = node.querySelector('.ev-card');
  if (!source || !card) return;
  for (const shot of source.content.querySelectorAll('.ev-shot')) card.append(shot.cloneNode(true));
}
