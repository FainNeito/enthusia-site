# Guild banner fallback

SPEAR scope: if the guild directory lacks a banner, use only a validated public market banner matched by guild UUID; preserve existing banners and fail safely on unavailable or conflicting data. Do not infer prestige, ELO, member names or server availability.

Evidence: on 28 October the live guild directory returned Vibe level 100, 24 members and no banner; public Market stall 7 returned the same guild UUID with a black/yellow banner. The checked-in server-side join produces the expected banner from those two public captures, but the live response lacked it; whether this is caused by deployment configuration or a failed optional fetch is unproven. A browser-side fallback uses the public market endpoint with no credentials. The market may not cover guilds with no market stall, and full profiles still require an authoritative guild export.

Focused tests cover exact UUID, preserving supplied designs, conflicting/invalid banners and player owners. Real public captures produced Vibe, WeOnTop and Asgard banner matches locally. A sample-only preview provides available and unavailable states. No project EARS/state helpers were found; no production change was made.
