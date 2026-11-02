# Competition account and submission review

Base: website main b33c89ec756cf682d0b1582f1dd2b98e2484eddf.

Requirement: a verified linked network account can enter a competition whether its authoritative name is Java-style or a supported Floodgate name. UUID ownership and name safety validation remain mandatory. Browser-provided identities remain untrusted.

Proof: the participant normalization test reproduced rejection of `.Bedrock Player`; the corrected code accepts it and continues rejecting malformed UUIDs, control characters, markup delimiters, and names beyond the network limit. A SQLite-backed session test exercises a synthetic authoritative network refresh. An isolated entry journey exercises draft creation, image attachment, and submission through actual route handlers with simulated bridge, moderation, and object storage.

This work does not prove the live account endpoint or production providers. Production returned `competition_identity_unavailable` for a signed-in user, and the current canonical Staff source lacks the website account routes. The production runtime and authenticated service connection require separate verification. A real screenshot and competition entry have not been tested. Current public competition list is empty. Do not bypass image or text moderation.

SPEAR: this project has no local EARS validator or state helper. The scoped requirement, observed failure, implementation, regression and contract evidence are recorded here rather than fabricating a prior red/green history.
