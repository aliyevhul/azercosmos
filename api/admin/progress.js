// GET /api/admin/progress → every student's progress on every worksheet.
//   { worksheets: [{ id, total }],
//     students: [{ id, email, name, active, lastLoginAt,
//                  progress: { <docId>: { filled, total, updatedAt } } }] }

import { publicUser, requireAdmin } from "../../server/auth.js";
import { getDb } from "../../server/db.js";
import { handle, json } from "../../server/http.js";
import { totalFor, worksheetIds } from "../../server/worksheets.js";

export const GET = handle(async (request) => {
  await requireAdmin(request);
  const db = await getDb();
  // independent queries: run them side by side
  const [{ rows: users }, { rows: answers }] = await Promise.all([
    db.query("SELECT * FROM app_users WHERE role = 'student' ORDER BY (name = ''), lower(name), email"),
    db.query(
      `SELECT a.user_id, a.doc_id, a.filled, a.updated_at
         FROM app_worksheet_answers a JOIN app_users u ON u.id = a.user_id
        WHERE u.role = 'student'`,
    ),
  ]);

  const ids = worksheetIds();
  const known = new Set(ids);
  const byUser = new Map();
  for (const a of answers) {
    if (!known.has(a.doc_id)) continue;
    const key = Number(a.user_id);
    if (!byUser.has(key)) byUser.set(key, {});
    byUser.get(key)[a.doc_id] = { filled: a.filled, total: totalFor(a.doc_id), updatedAt: a.updated_at };
  }

  return json({
    worksheets: ids.map((id) => ({ id, total: totalFor(id) })),
    students: users.map((u) => ({ ...publicUser(u), progress: byUser.get(Number(u.id)) || {} })),
  });
});
