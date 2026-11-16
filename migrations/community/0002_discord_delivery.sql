CREATE TABLE IF NOT EXISTS community_discord_delivery (
 kind TEXT NOT NULL CHECK(kind IN ('news','changelog')),
 slug TEXT NOT NULL, revision INTEGER NOT NULL, title TEXT NOT NULL,
 channel TEXT NOT NULL CHECK(channel IN ('news','changelog')),
 status TEXT NOT NULL CHECK(status IN ('pending','processing','sent','failed','uncertain')),
 attempts INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL,
 message_id TEXT, error_code TEXT, claim_id TEXT,
 PRIMARY KEY(kind,slug)
);
CREATE INDEX IF NOT EXISTS community_discord_pending ON community_discord_delivery(status,updated_at);
