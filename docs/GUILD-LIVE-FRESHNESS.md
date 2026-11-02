# Guild data freshness: local SPEAR record

Spec: when a stored guild snapshot is stale, serve a demonstrably newer production leaderboard with the existing limited/stale labels. Preserve the snapshot if the live feed fails or is not newer. Fresh snapshots retain precedence. Never combine stale profile fields with live rankings or claim a leaderboard is a complete directory.

Prove: `guildFallback` previously skipped the live lookup whenever any stored snapshot existed, even if it was stale. The snapshot route reports a stale flag, but did not compare a live producer timestamp.

Engine and architecture: compare the snapshot's source timestamp (or receipt time for legacy snapshots) and the live leaderboard generation time. Keep the existing public projection and market-banner protections. A failed or older live feed cannot displace the saved snapshot; a selected leaderboard remains explicitly limited and its stale flag reflects its own source time. This does not solve the producer's 50-guild limit, complete rosters, banners or plugin deployment.

The optional live full-directory consumer requires `GUILDS_DIRECTORY_API_URL` (HTTPS) and `GUILDS_API_BEARER`; it never follows redirects and limits upstream pages and timeouts. It checks the immutable capture revision, capture timestamp, total counts, contiguous offsets and unique IDs before publishing any result. The capture is composed of sequential provider reads, not a transactional database snapshot. Missing configuration or a failed/inconsistent producer falls back to the existing path. Roster IDs stay server-side and names are shown only if every member is present in a fresh public player snapshot. If that snapshot is absent, a fresh public playtime leaderboard supplies its last-recorded usernames without private credentials; its current top-100 coverage means many rosters will remain unavailable. The full public player endpoint returned `community_service_unavailable` during this check.

The full directory also applies the existing validated public Market banner enrichment without forwarding Guilds credentials. Guilds with no direct or Market banner remain unavailable.

Refine: on canonical website main cf21ef2555584b15da5318130268408727ef7e16, focused Node tests passed 29/29, including credential isolation, banner enrichment, end-to-end roster projection with synthetic data, supplementing an incomplete player snapshot with the public leaderboard, stale player data, inconsistent pages, freshness and upstream failure. The implementation and tests are local, unmerged and not deployed. No project-local EARS/state helper was found; this is the manual record.

## Current-main reconciliation, 2026-11-02

Source base: website main 461f933684768739f1f4c5657f94c2744c4a6006; Guilds main c0a144bf253835361d3cf2439ec25f21ddb417f2. The producer now captures bounded pages under a random revision, expires them after 30 seconds, and requires the revision on subsequent requests. Pages share the same immutable capture; individual source reads while creating that capture are not a database transaction. An expired or evicted capture fails closed. The consumer passes the revision and checks each page, ID and total. Player profiles can join guild memberships by UUID only when every exported roster is complete; otherwise missing memberships remain unknown. Upstream credentials and member UUIDs remain server-side. Existing public player data determines which player profiles can be shown; the fallback leaderboard is limited and does not resolve every roster.

Acceptance still requires focused producer and consumer tests, provider/runtime compatibility, live credential and routing configuration, a real complete player source, privacy review and a separately authorized deployment. No production changes or runtime claims follow from this local work.

Current local verification: 624 website tests and 131 HTML page/reference checks passed on the merged current-main candidate; focused guild/profile tests passed again after the capture contract change. ESLint passed. Provider configuration and live-data acceptance remain outstanding.
