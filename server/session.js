// Session tokens: a signed JWT in an HttpOnly cookie.
//
// Used by both the page guard (middleware.js) and the API functions, so it
// must not touch the database. The API additionally checks the database on
// every call (account still active, password not changed since), see
// server/auth.js.

import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "aa_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const REFRESH_AFTER_SECONDS = 60 * 60 * 24; // re-issue once a day

export class ConfigError extends Error {}

const encoder = new TextEncoder();
let keyPromise = null;

// The signing key is AUTH_SECRET when set. Without it, a key is derived
// from the database connection string, which is already a server-only
// secret, so a fresh deployment works with just DATABASE_URL.
async function loadKey() {
  const secret = process.env.AUTH_SECRET;
  if (secret) {
    if (secret.length < 32) {
      throw new ConfigError("AUTH_SECRET must be at least 32 characters long.");
    }
    return encoder.encode(secret);
  }
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) {
    throw new ConfigError("Login is not configured: set DATABASE_URL (and optionally AUTH_SECRET).");
  }
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(dbUrl),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const derived = await crypto.subtle.sign("HMAC", hmacKey, encoder.encode("azercosmos-session-signing-key-v1"));
  return new Uint8Array(derived);
}

export function getSigningKey() {
  if (!keyPromise) {
    keyPromise = loadKey().catch((err) => {
      keyPromise = null; // retry on the next request instead of caching the failure
      throw err;
    });
  }
  return keyPromise;
}

export async function signSession(user) {
  return new SignJWT({ email: user.email, role: user.role, sv: user.session_version })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(await getSigningKey());
}

// Returns the token's claims, or null when the token is missing, expired or
// forged. Throws ConfigError when the server has no key configured, so the
// caller can fail closed.
export async function verifySession(token) {
  if (!token) return null;
  const key = await getSigningKey();
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const name = part.slice(0, i).trim();
    if (!name || name in out) continue;
    try {
      out[name] = decodeURIComponent(part.slice(i + 1).trim());
    } catch {
      out[name] = part.slice(i + 1).trim();
    }
  }
  return out;
}

export function getSessionToken(request) {
  return parseCookies(request.headers.get("cookie"))[COOKIE_NAME] || null;
}

function isHttps(request) {
  const proto = request.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return new URL(request.url).protocol === "https:";
}

export function sessionCookie(token, request) {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (isHttps(request)) parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookie(request) {
  const parts = [`${COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (isHttps(request)) parts.push("Secure");
  return parts.join("; ");
}
