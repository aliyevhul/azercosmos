// Resolves the signed-in user for an API request, checking the database so
// that disabled accounts and changed passwords take effect immediately.

import { getDb } from "./db.js";
import { HttpError } from "./http.js";
import { getSessionToken, verifySession } from "./session.js";

export function publicUser(row) {
  return {
    id: Number(row.id),
    email: row.email,
    name: row.name,
    role: row.role,
    active: row.active,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

// Returns { user, claims } or null.
export async function getSession(request) {
  const claims = await verifySession(getSessionToken(request));
  if (!claims) return null;
  const db = await getDb();
  const { rows } = await db.query("SELECT * FROM app_users WHERE id = $1", [claims.sub]);
  const user = rows[0];
  if (!user || !user.active || user.session_version !== claims.sv) return null;
  return { user, claims };
}

export async function requireUser(request) {
  const session = await getSession(request);
  if (!session) throw new HttpError(401, "Please sign in.");
  return session;
}

export async function requireAdmin(request) {
  const session = await requireUser(request);
  if (session.user.role !== "admin") throw new HttpError(403, "Admins only.");
  return session;
}
