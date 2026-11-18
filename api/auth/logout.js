// POST /api/auth/logout  → clears the session cookie

import { assertSameOrigin, handle, json } from "../../server/http.js";
import { clearSessionCookie } from "../../server/session.js";

export const POST = handle(async (request) => {
  assertSameOrigin(request);
  return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie(request) });
});
