// GET /api/auth/me  → { user } for the signed-in user, or 401.
// Also renews the session cookie once a day, so active users stay signed in.

import { getSession, publicUser } from "../../server/auth.js";
import { handle, json } from "../../server/http.js";
import { REFRESH_AFTER_SECONDS, clearSessionCookie, sessionCookie, signSession } from "../../server/session.js";

export const GET = handle(async (request) => {
  const session = await getSession(request);
  if (!session) {
    return json({ error: "Please sign in." }, 401, { "Set-Cookie": clearSessionCookie(request) });
  }
  const headers = {};
  const age = Math.floor(Date.now() / 1000) - (session.claims.iat || 0);
  if (age > REFRESH_AFTER_SECONDS) {
    headers["Set-Cookie"] = sessionCookie(await signSession(session.user), request);
  }
  return json({ user: publicUser(session.user) }, 200, headers);
});
