# Active punishment filter

Spec: add a themed Active filter to the public punishment page. Active bans and mutes are shown; recorded warnings, expired and removed punishments are excluded. Search remains supported. Existing public pagination must not silently hide later active records.

Prove: the public Staff list supports type filters and cursor paging, but no active-state filter; filtering only the first page would incorrectly report no results when later pages contain active entries.

Engine: request existing public pages with type ALL and retain the upstream cursor, scanning at most five empty pages at a time. If more pages remain, offer Load more rather than claiming the complete history is empty. A repeated cursor or failed upstream request fails visibly; older requests cannot overwrite newer filter or search selections. The preview uses synthetic records. No server or production changes are needed.

Refine: validate active/expired/warning behavior, pagination continuation, search and error handling, plus site validation and hosted checks. No project-local EARS validator or state helper was identified; this is the manual SPEAR record.
