// Vercel Routing Middleware: runs before every page and file is served.
// Anyone without a valid session is sent to /login — this covers the pages,
// the JavaScript bundle and the PDF downloads, not just what React renders.
// Non-admins are kept out of /admin.
//
// Left public: the login page, the API (which checks sessions itself), the
// favicon and /logo/ (needed by the login page).

import { next } from "@vercel/functions";
import { ConfigError, getSessionToken, verifySession } from "./server/session.js";

export const config = {
  matcher: ["/((?!api/|login|favicon\\.svg|logo/).*)"],
};

function redirect(location) {
  return new Response(null, { status: 302, headers: { Location: location, "Cache-Control": "no-store" } });
}

export default async function middleware(request) {
  const url = new URL(request.url);

  let session;
  try {
    session = await verifySession(getSessionToken(request));
  } catch (err) {
    if (err instanceof ConfigError) {
      return new Response(
        "This site's login isn't set up yet (no database configured). Please contact the site administrator.",
        { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } },
      );
    }
    throw err;
  }

  if (!session) {
    const target = url.pathname + url.search;
    const login = target === "/" ? "/login" : `/login?next=${encodeURIComponent(target)}`;
    return redirect(login);
  }

  if ((url.pathname === "/admin" || url.pathname.startsWith("/admin/")) && session.role !== "admin") {
    return redirect("/");
  }

  return next();
}
