// POST /api/auth/login  { email, password }  → sets the session cookie

import { getDb, normalizeEmail } from "../../server/db.js";
import { publicUser } from "../../server/auth.js";
import { HttpError, clientIp, handle, json, readJson } from "../../server/http.js";
import { verifyAgainstDummy, verifyPassword, MAX_PASSWORD_LENGTH } from "../../server/passwords.js";
import { sessionCookie, signSession } from "../../server/session.js";

const WINDOW = "15 minutes";
const MAX_FAILURES_PER_EMAIL = 8;
const MAX_FAILURES_PER_IP = 30;

export const POST = handle(async (request) => {
  const body = await readJson(request, 8 * 1024);
  const email = normalizeEmail(body.email);
  const password = String(body.password ?? "");
  if (!email || !password) throw new HttpError(400, "Enter your email and password.");
  if (password.length > MAX_PASSWORD_LENGTH) throw new HttpError(400, "Incorrect email or password.");

  const db = await getDb();
  const ip = clientIp(request);

  const { rows: [counts] } = await db.query(
    `SELECT count(*) FILTER (WHERE email = $1)::int AS by_email,
            count(*) FILTER (WHERE ip = $2)::int    AS by_ip
       FROM app_login_failures
      WHERE at > now() - $3::interval AND (email = $1 OR ip = $2)`,
    [email, ip, WINDOW],
  );
  if (counts.by_email >= MAX_FAILURES_PER_EMAIL || counts.by_ip >= MAX_FAILURES_PER_IP) {
    throw new HttpError(429, "Too many failed attempts. Please wait 15 minutes and try again.");
  }

  const { rows: [user] } = await db.query("SELECT * FROM app_users WHERE email = $1", [email]);
  const ok = user ? await verifyPassword(password, user.password_hash) : await verifyAgainstDummy(password);

  if (!ok) {
    await db.query("INSERT INTO app_login_failures (email, ip) VALUES ($1, $2)", [email, ip]);
    // keep the table small
    await db.query("DELETE FROM app_login_failures WHERE at < now() - interval '1 day'");
    throw new HttpError(401, "Incorrect email or password.");
  }
  if (!user.active) {
    throw new HttpError(403, "This account has been disabled. Please contact the Space Academy.");
  }

  await db.query("DELETE FROM app_login_failures WHERE email = $1", [email]);
  const { rows: [updated] } = await db.query(
    "UPDATE app_users SET last_login_at = now() WHERE id = $1 RETURNING *",
    [user.id],
  );

  const token = await signSession(updated);
  return json({ user: publicUser(updated) }, 200, { "Set-Cookie": sessionCookie(token, request) });
});
