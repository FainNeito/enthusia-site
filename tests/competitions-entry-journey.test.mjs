import assert from "node:assert/strict";
import test from "node:test";
import { d1, migratedDatabase } from "./support/d1-sqlite.mjs";
import { createIdentitySession } from "../functions/lib/competitions/identity.js";
import { initialCompetitionConfig } from "../functions/lib/competitions/config.js";
import { onRequestPost as createEntry } from "../functions/api/competitions/[slug]/submissions.js";
import { onRequestPost as uploadImage } from "../functions/api/competitions/[slug]/submissions/[id]/images/index.js";
import { onRequestPost as submitEntry } from "../functions/api/competitions/[slug]/submissions/[id].js";

test("a linked entrant creates a draft, uploads a screenshot and submits it for review", async (t) => {
  const database = await migratedDatabase();
  t.after(() => database.close());
  const db = d1(database);
  const user = "111111111111111111";
  const player = "10000000-0000-4000-8000-000000000001";
  const competition = "20000000-0000-4000-8000-000000000002";
  const now = new Date().toISOString();
  const identity = await createIdentitySession(db, { id: user, username: "Builder", guildMember: true });
  database.prepare("INSERT INTO competition_minecraft_links VALUES (?, ?, ?, ?, ?)").run(player, user, "Builder", now, now);
  database.prepare(`INSERT INTO competitions (id, slug, title, category, lifecycle_state, current_config_version,
    created_by_subject, created_by_uuid, created_at, updated_at, published_at)
    VALUES (?, 'test-entry', 'Test entry', 'Build', 'SUBMISSIONS_OPEN', 1, ?, ?, ?, ?, ?)`)
    .run(competition, `discord:${user}`, player, now, now, now);
  database.prepare(`INSERT INTO competition_config_versions (competition_id, version, config_json,
    created_by_subject, created_by_uuid, created_at, change_note) VALUES (?, 1, ?, ?, ?, ?, 'test')`)
    .run(competition, JSON.stringify(initialCompetitionConfig()), `discord:${user}`, player, now);
  const stored = new Map();
  const bucket = {
    async get(key) { return stored.get(key); },
    async put(key, bytes) { stored.set(key, bytes); return { size: bytes.byteLength }; },
    async delete(key) { stored.delete(key); }
  };
  const env = {
    COMPETITIONS_ENABLED: "true", COMPETITIONS_PUBLIC_ACCESS: "true", COMPETITIONS_DB: db,
    COMPETITIONS_MEDIA: bucket, OPENAI_API_KEY: "synthetic", COMPETITION_BRIDGE_ORIGIN: "https://bridge.example",
    COMPETITION_BRIDGE_BEARER_TOKEN: "b".repeat(40), COMPETITION_BRIDGE_HMAC_SECRET: "h".repeat(40)
  };
  t.mock.method(globalThis, "fetch", async (url) => String(url).includes("bridge.example")
    ? Response.json({ linkedMinecraftAccounts: [], activeMinutes: 100, guilds: [] })
    : Response.json({ model: "omni-moderation-latest", results: [{ flagged: false }] }));
  const cookie = `__Host-enthusia_competition_session=${identity.token}`;
  const headers = { origin: "https://example.test", cookie };
  const request = (path, options) => new Request(`https://example.test${path}`, options);
  const slug = "test-entry";
  const creation = await createEntry({ env, params: { slug }, request: request(`/api/competitions/${slug}/submissions`, {
    method: "POST", headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify({ entryType: "SOLO", title: "Garden", description: "A garden", ownerUuid: player })
  }) });
  assert.equal(creation.status, 201, await creation.clone().text());
  const entry = (await creation.json()).submission;
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aX8AAAAASUVORK5CYII=", "base64");
  const upload = await uploadImage({ env, params: { slug, id: entry.id }, request: request(`/api/competitions/${slug}/submissions/${entry.id}/images`, {
    method: "POST", headers: { ...headers, "content-type": "image/png", "x-submission-revision": "1" }, body: png
  }) });
  assert.equal(upload.status, 201, await upload.clone().text());
  assert.equal(stored.size, 1);
  const uploaded = await upload.json();
  const submission = await submitEntry({ env, params: { slug, id: entry.id }, request: request(`/api/competitions/${slug}/submissions/${entry.id}`, {
    method: "POST", headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify({ action: "SUBMIT", expectedRevision: uploaded.revision })
  }) });
  assert.equal(submission.status, 200, await submission.clone().text());
  assert.equal((await submission.json()).status, "PENDING_REVIEW");
});
