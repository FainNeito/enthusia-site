# Directory feed states

Requirement: a failed or pending public directory request must not appear as a successful empty result when a user operates a search, filter or sort. A successful empty response must still display zero results. Bounty feed failures must identify which data is unavailable; no sample data may appear as live data.

Review evidence: the live bounty endpoint returned 503. Before this change, the directory registered controls before the request finished; selecting a filter ran `draw()` with an empty local array and displayed `0 bounties shown`, despite the failed request. The same loading race affected guild and player directories.

The renderer now guards drawing and profile search until a valid array is received, retains the unavailable status on failure, and continues to display zero for a successful empty result. The preview-only `bounty-feed=offline` state simulates a failed request without contacting the live provider. This does not connect the NotBounties exporter or change server configuration.

Regression tests exercise the actual renderer with a failed feed and a successful empty feed, including filter interaction. Project-local SPEAR state helpers and an EARS validator were not found; this record supplies the scoped requirement, proof and verification boundary. Mobile visual acceptance and the live exporter remain unverified.
