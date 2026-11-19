// End-to-end tests of the API functions against a real Postgres.
// Skipped unless TEST_DATABASE_URL is set (use a throwaway database — the
// tables are emptied first). Groq is replaced with scripted responses.
//
//   TEST_DATABASE_URL=postgres://… npm test

import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";

const DB_URL = process.env.TEST_DATABASE_URL;
const DOC = "03-self-perception-worksheet";
const ORIGIN = "http://localhost:3000";

describe("API", { skip: !DB_URL && "TEST_DATABASE_URL not set" }, () => {
  let db, session, groq, api;
  let admin, alice, bob;
  let groqCalls = 0;
  let groqReply;

  before(async () => {
    process.env.DATABASE_URL = DB_URL;
    process.env.AUTH_SECRET = "test-secret-that-is-at-least-32-characters";
    process.env.ADMIN_EMAIL = "admin@example.com";
    process.env.ADMIN_PASSWORD = "admin-pass-123";
    process.env.GROQ_API_KEY = "test-key";
    delete process.env.GROQ_MODEL;
    delete process.env.GROQ_FALLBACK_MODEL;

    const pg = (await import("pg")).default;
    const raw = new pg.Client({ connectionString: DB_URL });
    await raw.connect();
    await raw.query(
      "DROP TABLE IF EXISTS app_ai_usage, app_ai_summaries, app_worksheet_answers, app_login_failures, app_users CASCADE",
    );
    await raw.end();

    db = await import("../server/db.js");
    session = await import("../server/session.js");
    groq = await import("../server/groq.js");
    api = {
      login: await import("../api/auth/login.js"),
      me: await import("../api/auth/me.js"),
      users: await import("../api/admin/users.js"),
      progress: await import("../api/admin/progress.js"),
      worksheets: await import("../api/worksheets.js"),
      summary: await import("../api/summary.js"),
    };

    groq._setTransport({
      fetch: async () => {
        groqCalls++;
        const r = typeof groqReply === "function" ? await groqReply() : groqReply;
        return r;
      },
      sleep: async () => {},
    });
  });

  after(async () => {
    groq._setTransport();
    await (await db.getDb()).end();
  });

  const okReply = (summary) =>
    new Response(
      JSON.stringify({
        model: "openai/gpt-oss-120b",
        choices: [{ message: { content: JSON.stringify(summary) }, finish_reason: "stop" }],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  const SUMMARY = {
    overview: "You describe yourself as curious and reliable as a student.",
    keyPoints: ["Curious and reliable as a student"],
    strengths: ["Reliability"],
    nextSteps: ["Finish the remaining prompts"],
    gaps: ["Most prompts are still empty"],
  };

  async function cookieFor(email, password) {
    const res = await api.login.POST(
      new Request(`${ORIGIN}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: ORIGIN, host: "localhost:3000" },
        body: JSON.stringify({ email, password }),
      }),
    );
    assert.equal(res.status, 200, `login ${email}`);
    return res.headers.get("set-cookie").split(";")[0];
  }

  function req(method, path, cookie, body) {
    const headers = { host: "localhost:3000", origin: ORIGIN };
    if (cookie) headers.cookie = cookie;
    if (body !== undefined) headers["content-type"] = "application/json";
    return new Request(`${ORIGIN}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  }

  async function call(handler, ...args) {
    const res = await handler(req(...args));
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  }

  test("first admin is created from env; login works; wrong password fails", async () => {
    admin = await cookieFor("admin@example.com", "admin-pass-123");
    const me = await call(api.me.GET, "GET", "/api/auth/me", admin);
    assert.equal(me.status, 200);
    assert.equal(me.body.user.role, "admin");
    assert.equal(me.body.user.password_hash, undefined, "no hash in responses");

    const bad = await api.login.POST(
      new Request(`${ORIGIN}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: ORIGIN, host: "localhost:3000" },
        body: JSON.stringify({ email: "admin@example.com", password: "wrong-password" }),
      }),
    );
    assert.equal(bad.status, 401);
  });

  test("admin creates two students in one batch (existing email skipped)", async () => {
    const r = await call(api.users.POST, "POST", "/api/admin/users", admin, {
      users: [
        { email: "alice@example.com", password: "alice-pass-1", name: "Alice" },
        { email: "bob@example.com", password: "bob-pass-12", name: "Bob" },
        { email: "admin@example.com", password: "whatever-123" },
        { email: "not-an-email", password: "whatever-123" },
      ],
    });
    assert.equal(r.status, 201);
    assert.equal(r.body.created.length, 2);
    assert.deepEqual(
      r.body.skipped.map((s) => s.index),
      [2, 3],
    );
    alice = await cookieFor("alice@example.com", "alice-pass-1");
    bob = await cookieFor("bob@example.com", "bob-pass-12");
  });

  test("students cannot reach admin endpoints; signed-out requests get 401", async () => {
    assert.equal((await call(api.users.GET, "GET", "/api/admin/users", alice)).status, 403);
    assert.equal((await call(api.progress.GET, "GET", "/api/admin/progress", alice)).status, 403);
    assert.equal((await call(api.users.GET, "GET", "/api/admin/users", null)).status, 401);
    assert.equal((await call(api.summary.GET, "GET", "/api/summary", null)).status, 401);
    assert.equal((await call(api.summary.POST, "POST", "/api/summary", null, {})).status, 401);
  });

  test("cross-site POST is blocked", async () => {
    const res = await api.summary.POST(
      new Request(`${ORIGIN}/api/summary`, {
        method: "POST",
        headers: { host: "localhost:3000", origin: "https://evil.example", cookie: alice, "content-type": "application/json" },
        body: "{}",
      }),
    );
    assert.equal(res.status, 403);
  });

  test("summary before any answers → empty, no AI call", async () => {
    const before = groqCalls;
    const g = await call(api.summary.GET, "GET", `/api/summary?doc=${DOC}`, alice);
    assert.equal(g.status, 200);
    assert.equal(g.body.status, "empty");
    const p = await call(api.summary.POST, "POST", "/api/summary", alice, { doc: DOC });
    assert.equal(p.status, 422);
    assert.equal(p.body.code, "empty");
    assert.equal(groqCalls, before);
  });

  test("invalid worksheet ids are rejected", async () => {
    assert.equal((await call(api.summary.GET, "GET", "/api/summary?doc=../../etc", alice)).status, 404);
    assert.equal((await call(api.summary.POST, "POST", "/api/summary", alice, { doc: "01-intro-icons-guide" })).status, 400);
  });

  test("saving answers, then creating a summary calls the AI once and stores it", async () => {
    const save = await call(api.worksheets.PUT, "PUT", "/api/worksheets", alice, {
      doc: DOC,
      answers: { "p1-f1": "curious and reliable" },
    });
    assert.equal(save.status, 200);
    assert.equal(save.body.filled, 1);

    groqReply = () => okReply(SUMMARY);
    const before = groqCalls;
    const p = await call(api.summary.POST, "POST", "/api/summary", alice, { doc: DOC });
    assert.equal(p.status, 200);
    assert.equal(p.body.status, "ready");
    assert.equal(p.body.summary.overview, SUMMARY.overview);
    assert.equal(p.body.model, "openai/gpt-oss-120b");
    assert.equal(groqCalls, before + 1);

    const g = await call(api.summary.GET, "GET", `/api/summary?doc=${DOC}`, alice);
    assert.equal(g.body.status, "ready");
    assert.equal(g.body.summary.overview, SUMMARY.overview);
  });

  test("asking again with unchanged answers reuses the stored summary", async () => {
    const before = groqCalls;
    const p = await call(api.summary.POST, "POST", "/api/summary", alice, { doc: DOC });
    assert.equal(p.status, 200);
    assert.equal(p.body.cached, true);
    assert.equal(groqCalls, before);
  });

  test("changed answers mark the summary stale", async () => {
    await call(api.worksheets.PUT, "PUT", "/api/worksheets", alice, {
      doc: DOC,
      answers: { "p1-f1": "curious and reliable", "p1-f2": "helpful" },
    });
    const g = await call(api.summary.GET, "GET", `/api/summary?doc=${DOC}`, alice);
    assert.equal(g.body.status, "stale");
    assert.equal(g.body.summary.overview, SUMMARY.overview, "old summary is still shown");
  });

  test("identical concurrent requests share one AI call", async () => {
    let release;
    const gate = new Promise((r) => (release = r));
    groqReply = async () => {
      await gate;
      return okReply({ ...SUMMARY, overview: "Updated overview after more answers." });
    };
    const before = groqCalls;
    const all = Promise.all([1, 2, 3].map(() => call(api.summary.POST, "POST", "/api/summary", alice, { doc: DOC })));
    await new Promise((r) => setTimeout(r, 100));
    release();
    const results = await all;
    assert.ok(results.every((r) => r.status === 200 && r.body.summary.overview === "Updated overview after more answers."));
    assert.equal(groqCalls, before + 1);
  });

  test("students can't read or create another student's summary", async () => {
    const aliceId = (await call(api.me.GET, "GET", "/api/auth/me", alice)).body.user.id;
    assert.equal((await call(api.summary.GET, "GET", `/api/summary?doc=${DOC}&user=${aliceId}`, bob)).status, 403);
    assert.equal((await call(api.summary.POST, "POST", "/api/summary", bob, { doc: DOC, user: aliceId })).status, 403);
    assert.equal((await call(api.worksheets.GET, "GET", `/api/worksheets?user=${aliceId}`, bob)).status, 403);
  });

  test("admin can read a student's summary and create the overall one", async () => {
    const aliceId = (await call(api.me.GET, "GET", "/api/auth/me", alice)).body.user.id;
    const g = await call(api.summary.GET, "GET", `/api/summary?doc=${DOC}&user=${aliceId}`, admin);
    assert.equal(g.body.status, "ready");

    groqReply = () => okReply(SUMMARY);
    const p = await call(api.summary.POST, "POST", "/api/summary", admin, { user: aliceId });
    assert.equal(p.status, 200);
    assert.equal(p.body.scope, "all");
  });

  test("invalid AI output is retried, then reported as a clear error", async () => {
    await call(api.worksheets.PUT, "PUT", "/api/worksheets", bob, { doc: DOC, answers: { "p1-f1": "calm" } });
    groqReply = () =>
      new Response(JSON.stringify({ choices: [{ message: { content: "sorry, no json" } }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    const before = groqCalls;
    const p = await call(api.summary.POST, "POST", "/api/summary", bob, { doc: DOC });
    assert.equal(p.status, 502);
    assert.equal(p.body.code, "invalid");
    assert.equal(groqCalls - before, 6, "3 tries per model × 2 models");
    const g = await call(api.summary.GET, "GET", `/api/summary?doc=${DOC}`, bob);
    assert.equal(g.body.status, "none", "nothing stored");
  });

  test("provider rate limit → 503 busy", async () => {
    groqReply = () => new Response("{}", { status: 429, headers: { "content-type": "application/json" } });
    const p = await call(api.summary.POST, "POST", "/api/summary", bob, { doc: DOC });
    assert.equal(p.status, 503);
    assert.equal(p.body.code, "busy");
  });

  test("missing GROQ_API_KEY → 503 with a friendly message, GET says unavailable", async () => {
    const key = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;
    try {
      const before = groqCalls;
      const p = await call(api.summary.POST, "POST", "/api/summary", bob, { doc: DOC });
      assert.equal(p.status, 503);
      assert.doesNotMatch(p.body.error, /GROQ|key/i);
      assert.equal(groqCalls, before);
      const g = await call(api.summary.GET, "GET", `/api/summary?doc=${DOC}`, bob);
      assert.equal(g.body.available, false);
    } finally {
      process.env.GROQ_API_KEY = key;
    }
  });

  test("per-account hourly quota", async () => {
    const pool = await db.getDb();
    const bobId = (await call(api.me.GET, "GET", "/api/auth/me", bob)).body.user.id;
    await pool.query("INSERT INTO app_ai_usage (requester_id) SELECT $1 FROM generate_series(1, 25)", [bobId]);
    groqReply = () => okReply(SUMMARY);
    const p = await call(api.summary.POST, "POST", "/api/summary", bob, { doc: DOC });
    assert.equal(p.status, 429);
    assert.equal(p.body.code, "quota");
    await pool.query("DELETE FROM app_ai_usage WHERE requester_id = $1", [bobId]);
  });

  test("admin progress lists students with their progress", async () => {
    const r = await call(api.progress.GET, "GET", "/api/admin/progress", admin);
    assert.equal(r.status, 200);
    assert.equal(r.body.students.length, 2);
    const a = r.body.students.find((s) => s.email === "alice@example.com");
    assert.equal(a.progress[DOC].filled, 2);
  });

  test("deleting a student also deletes their summaries", async () => {
    const pool = await db.getDb();
    const aliceId = (await call(api.me.GET, "GET", "/api/auth/me", alice)).body.user.id;
    const d = await call(api.users.DELETE, "DELETE", `/api/admin/users?id=${aliceId}`, admin);
    assert.equal(d.status, 200);
    const { rows } = await pool.query("SELECT count(*)::int AS n FROM app_ai_summaries WHERE user_id = $1", [aliceId]);
    assert.equal(rows[0].n, 0);
    assert.equal((await call(api.me.GET, "GET", "/api/auth/me", alice)).status, 401, "deleted account is signed out");
  });

  test("session token signed with another key is rejected", async () => {
    const forged = `${session.COOKIE_NAME}=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwicm9sZSI6ImFkbWluIn0.bad`;
    assert.equal((await call(api.users.GET, "GET", "/api/admin/users", forged)).status, 401);
  });
});
