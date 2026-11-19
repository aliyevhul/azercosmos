// AI summary of a student's worksheet answers (Groq).
//
//   GET  /api/summary?doc=<docId>    → the stored summary, without calling the AI
//   GET  /api/summary                → same, for all worksheets together
//   POST /api/summary  { doc? }      → create (or refresh) the summary
//
//   Response: { scope, status, summary, model, generatedAt, cached }
//     status: "ready"  — summary matches the current answers
//             "stale"  — answers changed since the summary was made
//             "none"   — no summary yet
//             "empty"  — nothing filled in yet, so nothing to summarise
//
// Admins can add ?user=<id> (GET) or { user } (POST) to see or create a
// student's summary. Students only ever reach their own.
//
// The AI is only called when the stored summary no longer matches the
// answers; identical requests running at the same time share one call; and
// each account can create a limited number of summaries per hour.

import { publicUser, requireUser } from "../server/auth.js";
import { getDb } from "../server/db.js";
import { HttpError, handle, json, readJson } from "../server/http.js";
import { GroqError, isGroqConfigured } from "../server/groq.js";
import { buildInput, generateSummary, inputHash } from "../server/summary.js";
import { assertWorksheet } from "../server/worksheets.js";

export const config = { maxDuration: 60 };

const PER_USER_PER_HOUR = 20;
const SITE_PER_HOUR = 300;

const inflight = new Map(); // key → Promise, shared by identical concurrent requests

async function resolveTarget(db, me, rawUser) {
  if (rawUser === undefined || rawUser === null || rawUser === "" || Number(rawUser) === Number(me.id)) {
    return { userId: Number(me.id), student: null };
  }
  if (me.role !== "admin") throw new HttpError(403, "You can only see your own summary.");
  const id = Number(rawUser);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Invalid user.");
  const { rows: [student] } = await db.query("SELECT * FROM app_users WHERE id = $1", [id]);
  if (!student) throw new HttpError(404, "Account not found.");
  return { userId: id, student: publicUser(student) };
}

function scopeFor(rawDoc) {
  if (rawDoc === undefined || rawDoc === null || rawDoc === "") return "all";
  const docId = String(rawDoc);
  assertWorksheet(docId);
  return `doc:${docId}`;
}

async function loadInput(db, userId, scope) {
  const { rows } =
    scope === "all"
      ? await db.query("SELECT doc_id, answers FROM app_worksheet_answers WHERE user_id = $1 AND filled > 0", [userId])
      : await db.query("SELECT doc_id, answers FROM app_worksheet_answers WHERE user_id = $1 AND doc_id = $2", [
          userId,
          scope.slice(4),
        ]);
  return buildInput(scope, rows);
}

async function stored(db, userId, scope) {
  const { rows: [row] } = await db.query(
    "SELECT input_hash, summary, model, created_at FROM app_ai_summaries WHERE user_id = $1 AND scope = $2",
    [userId, scope],
  );
  return row || null;
}

function respond(scope, status, row, extra = {}) {
  return json({
    scope,
    status,
    summary: row?.summary ?? null,
    model: row?.model ?? null,
    generatedAt: row?.created_at ?? null,
    cached: false,
    ...extra,
  });
}

export const GET = handle(async (request) => {
  const { user: me } = await requireUser(request);
  const params = new URL(request.url).searchParams;
  const scope = scopeFor(params.get("doc"));
  const db = await getDb();
  const { userId } = await resolveTarget(db, me, params.get("user"));

  const [input, row] = await Promise.all([loadInput(db, userId, scope), stored(db, userId, scope)]);
  const available = isGroqConfigured();
  if (!input) return respond(scope, "empty", null, { available });
  if (!row) return respond(scope, "none", null, { available });
  return respond(scope, row.input_hash === inputHash(input) ? "ready" : "stale", row, { available });
});

async function checkQuota(db, requesterId) {
  const { rows: [r] } = await db.query(
    `SELECT count(*) FILTER (WHERE requester_id = $1)::int AS mine, count(*)::int AS site
       FROM app_ai_usage WHERE at > now() - interval '1 hour'`,
    [requesterId],
  );
  if (r.mine >= PER_USER_PER_HOUR) {
    throw new HttpError(429, "You've made a lot of summaries in the last hour. Please try again later.", { code: "quota" });
  }
  if (r.site >= SITE_PER_HOUR) {
    throw new HttpError(429, "The AI summary is busy right now. Please try again later.", { code: "quota" });
  }
}

function groqToHttp(err) {
  if (err.kind === "config") {
    console.error(`summary: AI not configured or key rejected (${err.status ?? "no key"})`);
    return new HttpError(503, "AI summaries aren't available right now. Please contact the site administrator.", { code: "unavailable" });
  }
  if (err.kind === "rate_limit") {
    return new HttpError(503, "The AI service is busy. Please try again in a minute.", { code: "busy" });
  }
  if (err.kind === "empty") {
    return new HttpError(502, "The AI couldn't write a usable summary. Please try again.", { code: "invalid" });
  }
  return new HttpError(502, "The AI service didn't respond. Please try again in a moment.", { code: "unavailable" });
}

export const POST = handle(async (request) => {
  const { user: me } = await requireUser(request);
  const body = await readJson(request, 4 * 1024);
  const scope = scopeFor(body.doc);
  const db = await getDb();
  const { userId } = await resolveTarget(db, me, body.user);

  const input = await loadInput(db, userId, scope);
  if (!input) throw new HttpError(422, "There's nothing filled in yet, so there is nothing to summarise.", { code: "empty" });
  const hash = inputHash(input);

  const existing = await stored(db, userId, scope);
  if (existing && existing.input_hash === hash) return respond(scope, "ready", existing, { cached: true });

  if (!isGroqConfigured()) throw groqToHttp(new GroqError("config", "no key"));

  const key = `${userId}|${scope}|${hash}`;
  let job = inflight.get(key);
  if (!job) {
    job = (async () => {
      await checkQuota(db, Number(me.id));
      await db.query("INSERT INTO app_ai_usage (requester_id) VALUES ($1)", [me.id]);
      let result;
      try {
        result = await generateSummary(input);
      } catch (err) {
        throw err instanceof GroqError ? groqToHttp(err) : err;
      }
      const { rows: [row] } = await db.query(
        `INSERT INTO app_ai_summaries (user_id, scope, input_hash, summary, model, created_at)
         VALUES ($1, $2, $3, $4, $5, now())
         ON CONFLICT (user_id, scope) DO UPDATE
           SET input_hash = EXCLUDED.input_hash, summary = EXCLUDED.summary,
               model = EXCLUDED.model, created_at = now()
         RETURNING input_hash, summary, model, created_at`,
        [userId, scope, hash, JSON.stringify(result.summary), result.model],
      );
      // keep the usage table small
      db.query("DELETE FROM app_ai_usage WHERE at < now() - interval '1 day'").catch(() => {});
      return row;
    })().finally(() => inflight.delete(key));
    inflight.set(key, job);
  }
  const row = await job;
  return respond(scope, "ready", row);
});
