# Events content removal: local SPEAR record

Spec: remove the named hub from player-facing website copy while retaining Events and King of the Hill as planned, with no implied sequence or date.

Evidence: canonical website main cf21ef2555584b15da5318130268408727ef7e16 contains references in the Events page, Roadmap page and preview data. Public roadmap API also returns a separately stored published record with slug `events-and-the-events-hub`, revision 4 as observed during this review. Its title and body mention the hub. The King of the Hill public record does not.

Local changes: replace the static and preview title with “Events”, remove the hub description, and remove the supposed King of the Hill dependency. The original feature status and other events remain unchanged.

Outstanding production work: the live published roadmap record is stored separately in the community database. To remove its visible reference, a staff editor or specifically authorized operator must update that exact record's title to “Events” and body to “Planned: additional events. Details and timing are yet to be confirmed.” Preserve its published status, verification, tags, slug and other metadata. Re-read the current record and use its revision for a guarded audited update; do not rely on revision 4 if it has changed. Separately publish the reviewed static site changes and verify the live Events and Roadmap pages. This local patch does not update production.

Verification: local source search and JSON parsing are appropriate for the wording-only change; there is no runtime behavior change. No project-local EARS/state helper was identified; this is the manual record. The existing design-reference copies were also updated because they are served under the public preview path.
