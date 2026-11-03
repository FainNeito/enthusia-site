# Timeline and changelog order

Both pages default to newest first and offer oldest first. Sort by record date, retain the current filters and group timeline entries within their existing eras. Records without valid dates appear last. Preview records use their displayed dates when fixture dates are absent.

The production APIs returned timeline records newest first and changelog records oldest first during development, so input order must not determine display order. The existing timeline reverse styling was insufficient for this. Automated tests cover both date directions, stable ties, missing dates, era order and the controls retaining filters.

No project-local SPEAR state helper or EARS validator was present in this checkout. This record captures the requirement and verification boundary; the automated tests do not establish production deployment or mobile browser acceptance.
