# Player achievement feed candidate

Requirement: when a fresh, authenticated provider returns completed public achievement labels for requested player UUIDs, join only those returned UUIDs to public leaderboard profiles. An empty list is known only for a returned player marked known; offline, omitted, malformed, stale and failed lookups remain unavailable. Do not expose private provider fields or use the feed for authorization.

The opt-in loopback bridge route `/api/community/player-achievements?players=...` requires the existing dedicated bearer token, accepts at most 50 distinct canonical UUIDs, rejects extra query parameters, does not cache requested results, and limits output. The optional HTTPS upstream uses `COMMUNITY_PLAYER_ACHIEVEMENTS_API_URL` and `COMMUNITY_PLAYER_ACHIEVEMENTS_API_TOKEN`; the token must be at least 32 characters. Results older than 15 minutes, unknown identities or invalid batches are rejected. At most two batches are requested concurrently. Unreturned players remain unknown.

The renderer provider dependency is the unmerged achievement-export candidate in FainNeito/EnthusiaAdvancements#13. It only returns requested, online, individually loaded player progress when its separate opt-in is enabled; shared-team and offline progress is omitted. The website joins this feed to public leaderboard fallback profiles; separately supplied full player snapshots are not yet enriched by this path.

The website suite passed 652 tests and the Paper 26.2 bridge profile passed 22 tests locally. Tests use synthetic providers and do not prove the real server, transport or runtime ABI. The main-thread provider lookup can scan up to 50 players per request; benchmark and bound its tick cost with real-sized test fixtures before enabling it. Verify the actual companion plugin, authorization, source freshness, bridge deployment and server configuration before any separately authorized activation. No production configuration or player data was changed.

No project-local EARS validator or SPEAR state helper was found. This document records the requirement, implemented boundary and remaining verification rather than claiming those tools ran.
