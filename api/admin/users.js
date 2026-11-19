// Admin account management.
//
//   GET    /api/admin/users              → { users: [...] }
//   POST   /api/admin/users  { users: [{ email, password, name?, role? }] }
//                                        → { created: [...], skipped: [...] }
//   PATCH  /api/admin/users  { id, name?, role?, active?, password? }
//                                        → { user }
//   DELETE /api/admin/users?id=123       → { ok: true }

import { requireAdmin, publicUser } from "../../server/auth.js";
import { getDb, isValidEmail, normalizeEmail } from "../../server/db.js";
import { HttpError, handle, json, readJson, assertSameOrigin } from "../../server/http.js";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, hashPassword } from "../../server/passwords.js";

const ROLES = new Set(["student", "admin"]);
const MAX_BATCH = 500;
const HASH_CONCURRENCY = 4; // Node's default thread pool size

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

export const config = { maxDuration: 120 };

function checkPassword(password) {
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (password.length > MAX_PASSWORD_LENGTH) return "Password is too long.";
  return null;
}

function cleanName(value) {
  return String(value ?? "").trim().slice(0, 200);
}

export const GET = handle(async (request) => {
  await requireAdmin(request);
  const db = await getDb();
  const { rows } = await db.query(
    "SELECT * FROM app_users ORDER BY role = 'admin' DESC, created_at DESC, id DESC",
  );
  return json({ users: rows.map(publicUser) });
});

export const POST = handle(async (request) => {
  await requireAdmin(request);
  const body = await readJson(request);
  const input = Array.isArray(body.users) ? body.users : [body];
  if (input.length === 0) throw new HttpError(400, "No accounts to add.");
  if (input.length > MAX_BATCH) throw new HttpError(400, `Add at most ${MAX_BATCH} accounts at a time.`);

  const created = [];
  const skipped = [];
  const seen = new Set();
  const valid = [];

  for (const [index, raw] of input.entries()) {
    const email = normalizeEmail(raw?.email);
    const password = String(raw?.password ?? "");
    const role = raw?.role ? String(raw.role).trim().toLowerCase() : "student";
    const name = cleanName(raw?.name);

    let reason = null;
    if (!isValidEmail(email)) reason = "Not a valid email address.";
    else if (seen.has(email)) reason = "Listed twice.";
    else if (!ROLES.has(role)) reason = "Role must be student or admin.";
    else reason = checkPassword(password);
    if (reason) {
      skipped.push({ index, email: raw?.email ?? "", reason });
      continue;
    }
    seen.add(email);
    valid.push({ index, email, password, role, name });
  }

  const db = await getDb();
  // Skip existing emails before hashing (hashing is the slow part), then
  // hash a few passwords at a time instead of one after another.
  const { rows: existing } = valid.length
    ? await db.query("SELECT email FROM app_users WHERE email = ANY($1::text[])", [valid.map((v) => v.email)])
    : { rows: [] };
  const taken = new Set(existing.map((r) => r.email));
  const todo = [];
  for (const v of valid) {
    if (taken.has(v.email)) skipped.push({ index: v.index, email: v.email, reason: "An account with this email already exists." });
    else todo.push(v);
  }
  const hashes = await mapLimit(todo, HASH_CONCURRENCY, (v) => hashPassword(v.password));

  for (const [i, v] of todo.entries()) {
    const { rows } = await db.query(
      `INSERT INTO app_users (email, name, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING *`,
      [v.email, v.name, hashes[i], v.role],
    );
    if (rows.length === 0) skipped.push({ index: v.index, email: v.email, reason: "An account with this email already exists." });
    else created.push(publicUser(rows[0]));
  }
  skipped.sort((a, b) => a.index - b.index);

  return json({ created, skipped }, created.length ? 201 : 200);
});

async function activeAdminCount(db, excludingId) {
  const { rows: [r] } = await db.query(
    "SELECT count(*)::int AS n FROM app_users WHERE role = 'admin' AND active AND id <> $1",
    [excludingId],
  );
  return r.n;
}

export const PATCH = handle(async (request) => {
  const { user: me } = await requireAdmin(request);
  const body = await readJson(request);
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Missing account id.");

  const db = await getDb();
  const { rows: [target] } = await db.query("SELECT * FROM app_users WHERE id = $1", [id]);
  if (!target) throw new HttpError(404, "Account not found.");

  const sets = [];
  const values = [];
  let endSessions = false;
  const set = (column, value) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (body.name !== undefined) set("name", cleanName(body.name));

  if (body.role !== undefined) {
    const role = String(body.role);
    if (!ROLES.has(role)) throw new HttpError(400, "Role must be student or admin.");
    if (role !== target.role) {
      if (target.role === "admin" && (await activeAdminCount(db, id)) === 0) {
        throw new HttpError(400, "There must be at least one active admin.");
      }
      set("role", role);
      endSessions = true;
    }
  }

  if (body.active !== undefined) {
    const active = Boolean(body.active);
    if (!active && Number(me.id) === id) throw new HttpError(400, "You can't disable your own account.");
    if (!active && target.role === "admin" && (await activeAdminCount(db, id)) === 0) {
      throw new HttpError(400, "There must be at least one active admin.");
    }
    if (active !== target.active) {
      set("active", active);
      if (!active) endSessions = true;
    }
  }

  if (body.password !== undefined) {
    const password = String(body.password);
    const reason = checkPassword(password);
    if (reason) throw new HttpError(400, reason);
    set("password_hash", await hashPassword(password));
    endSessions = true;
  }

  if (sets.length === 0) return json({ user: publicUser(target) });
  if (endSessions) sets.push("session_version = session_version + 1");
  sets.push("updated_at = now()");
  values.push(id);
  const { rows: [updated] } = await db.query(
    `UPDATE app_users SET ${sets.join(", ")} WHERE id = $${values.length} RETURNING *`,
    values,
  );
  return json({ user: publicUser(updated) });
});

export const DELETE = handle(async (request) => {
  assertSameOrigin(request);
  const { user: me } = await requireAdmin(request);
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Missing account id.");
  if (Number(me.id) === id) throw new HttpError(400, "You can't delete your own account.");

  const db = await getDb();
  const { rows: [target] } = await db.query("SELECT * FROM app_users WHERE id = $1", [id]);
  if (!target) throw new HttpError(404, "Account not found.");
  if (target.role === "admin" && target.active && (await activeAdminCount(db, id)) === 0) {
    throw new HttpError(400, "There must be at least one active admin.");
  }
  await db.query("DELETE FROM app_users WHERE id = $1", [id]);
  return json({ ok: true });
});
