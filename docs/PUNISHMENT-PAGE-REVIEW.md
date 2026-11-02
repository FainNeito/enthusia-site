# Punishment page review

Spec: show a compact responsive public record with a player head, issuer when explicitly provided by the public moderation contract, and an end date and time in the viewer's timezone. Never infer an issuer from private fields. Warnings have no expiration, permanent punishments say so, and revoked punishments distinguish their scheduled end from their actual (unavailable) end time.

Prove: on current website main d765871, the public API projects no issuer; it has an `expiresAt` timestamp, but the card only shows date and duration, without a player head. The live public endpoint also did not contain issuer names. Current EnthusiaStaff main 73a92a46's public response and public database views omit issuer identity.

Engine/architecture: accept an optional validated `issuedBy` name only when explicitly supplied by the public source, with legacy responses unchanged. Display `Unavailable` otherwise. Use the existing player-head service with a local fallback and retain search, filters, pagination and owned appeal behavior. No private fields are exposed. The preview uses synthetic records.

Refine: verify issuer validation, end-time semantics, page references, lint and existing tests. Server-side public issuer projection, native integration, hosted checks, mobile acceptance and separately authorized production delivery remain outstanding. The record is manual because no project-local EARS or state helper was found.
