// Small helpers shared by the API functions.

import { ConfigError } from "./session.js";

export class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

export function json(data, status = 200, headers = {}) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

// Wraps a handler so thrown errors become JSON responses.
export function handle(fn) {
  return async (request) => {
    try {
      return await fn(request);
    } catch (err) {
      if (err instanceof HttpError) {
        return json({ error: err.message, ...err.extra }, err.status, err.headers || {});
      }
      if (err instanceof ConfigError) {
        console.error(err.message);
        return json({ error: "The login system isn't set up yet. Please contact the site administrator." }, 503);
      }
      console.error(err);
      return json({ error: "Something went wrong on our side. Please try again." }, 500);
    }
  };
}

// Blocks cross-site form posts: state-changing requests must be JSON (which
// browsers won't send cross-origin without a CORS preflight we never allow)
// and, when the browser sends an Origin header, it must be this site.
export function assertSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host;
    let originHost;
    try {
      originHost = new URL(origin).host;
    } catch {
      originHost = null;
    }
    if (originHost !== host) throw new HttpError(403, "Request blocked.");
  }
}

export async function readJson(request, maxBytes = 512 * 1024) {
  assertSameOrigin(request);
  const type = request.headers.get("content-type") || "";
  if (!type.includes("application/json")) throw new HttpError(415, "Expected a JSON body.");
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError(413, "Request is too large.");
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new HttpError(400, "Invalid JSON body.");
  }
}

export function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
