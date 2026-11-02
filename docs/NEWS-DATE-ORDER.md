# News date ordering

SPEAR scope: show all available posts newest first by publication date, with an oldest-first choice in the existing themed controls. Ordering is strict across pinned and unpinned posts, invalid or missing dates stay last, ties are stable, filtering and selected posts remain usable. The preview demo uses synthetic posts only.

Prove: the existing page previously displayed API order, and the API gives pinned posts priority instead of strict date order. Focused date-order tests were run before the helper existed and failed on its missing module. The implemented helper tests both directions, pinned items, missing/invalid dates, stable ties and input immutability.

Engine and architecture: sort the fetched public posts client-side after category filtering; no server or database changes. The reader and editor continue using the existing API. The public API currently limits a response to 200 records; this change does not add pagination.

Refine: 535 website tests, lint, 121 page references, market layers and static build pass locally. The preview query `?news-order-demo=1` provides three dated sample records, including an older pinned item. Mobile browser acceptance and hosted checks are separate. No project-local EARS/state tooling is present.
