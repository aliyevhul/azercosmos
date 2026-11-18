// Students' answers on the fill-in worksheets.
//
//   GET /api/worksheets                     → { progress: { <docId>: { filled, total, updatedAt } } }
//   GET /api/worksheets?doc=<docId>         → { doc, answers, filled, total, updatedAt, readOnly: false }
//   PUT /api/worksheets  { doc, answers }   → { filled, total, updatedAt }   (saves your own answers)
//
// Admins can add &user=<id> to either GET to see a student's progress or
// answers (read-only).

import { requireUser, publicUser } from "../server/auth.js";
import { getDb } from "../server/db.js";
import { HttpError, handle, json, readJson } from "../server/http.js";
import { assertWorksheet, cleanAnswers, totalFor, worksheetIds } from "../server/worksheets.js";

async function resolveTarget(request, me) {
  const param = new URL(request.url).searchParams.get("user");
  if (!param || Number(param) === Number(me.id)) return { userId: Number(me.id), student: null };
  if (me.role !== "admin") throw new HttpError(403, "You can only see your own answers.");
  const id = Number(param);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Invalid user.");
  const db = await getDb();
  const { rows: [student] } = await db.query("SELECT * FROM app_users WHERE id = $1", [id]);
  if (!student) throw new HttpError(404, "Account not found.");
  return { userId: id, student: publicUser(student) };
}

export const GET = handle(async (request) => {
  const { user: me } = await requireUser(request);
  const { userId, student } = await resolveTarget(request, me);
  const docId = new URL(request.url).searchParams.get("doc");
  const db = await getDb();

  if (!docId) {
    const { rows } = await db.query(
      "SELECT doc_id, filled, updated_at FROM app_worksheet_answers WHERE user_id = $1",
      [userId],
    );
    const progress = {};
    for (const id of worksheetIds()) progress[id] = { filled: 0, total: totalFor(id), updatedAt: null };
    for (const r of rows) {
      if (progress[r.doc_id]) progress[r.doc_id] = { filled: r.filled, total: totalFor(r.doc_id), updatedAt: r.updated_at };
    }
    return json({ progress, student });
  }

  assertWorksheet(docId);
  const { rows: [row] } = await db.query(
    "SELECT answers, filled, updated_at FROM app_worksheet_answers WHERE user_id = $1 AND doc_id = $2",
    [userId, docId],
  );
  return json({
    doc: docId,
    answers: row?.answers ?? {},
    filled: row?.filled ?? 0,
    total: totalFor(docId),
    updatedAt: row?.updated_at ?? null,
    readOnly: Boolean(student),
    student,
  });
});

export const PUT = handle(async (request) => {
  const { user: me } = await requireUser(request);
  const body = await readJson(request, 256 * 1024);
  const docId = String(body.doc ?? "");
  const { answers, filled, total } = cleanAnswers(docId, body.answers);
  const db = await getDb();
  const { rows: [row] } = await db.query(
    `INSERT INTO app_worksheet_answers (user_id, doc_id, answers, filled, total, updated_at)
     VALUES ($1, $2, $3, $4, $5, now())
     ON CONFLICT (user_id, doc_id) DO UPDATE
       SET answers = EXCLUDED.answers, filled = EXCLUDED.filled, total = EXCLUDED.total, updated_at = now()
     RETURNING updated_at`,
    [me.id, docId, JSON.stringify(answers), filled, total],
  );
  return json({ filled, total, updatedAt: row.updated_at });
});
