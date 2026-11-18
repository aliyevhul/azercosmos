// Runs the built site the way Vercel does: middleware.js in front of every
// page and file, /api/* handled by the functions in api/, clean URLs and
// the single-page-app fallback from vercel.json.
//
//   npm run build
//   DATABASE_URL=postgres://… ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run serve:local
//
// Then open http://localhost:3000. For UI work without a database, use
// `npm run dev` instead (the login wall is skipped there).

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const PORT = Number(process.env.PORT || 3000);

const middlewareModule = await import(pathToFileURL(join(ROOT, "middleware.js")).href);
const matchers = [middlewareModule.config?.matcher ?? []].flat().map((m) => new RegExp(`^${m}$`));

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

async function fileIfExists(path) {
  try {
    const s = await stat(path);
    return s.isFile() ? path : null;
  } catch {
    return null;
  }
}

// Static files with Vercel's cleanUrls behaviour. Like Vercel, there is no
// catch-all fallback here: single-page-app routes reach index.html only
// through the middleware's rewrite.
async function serveStatic(pathname) {
  const safe = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const base = join(DIST, safe);
  if (!base.startsWith(DIST)) return new Response("Not found", { status: 404 });
  const file =
    (await fileIfExists(base)) ||
    (await fileIfExists(`${base}.html`)) ||
    (await fileIfExists(join(base, "index.html")));
  if (!file) return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  const body = await readFile(file);
  return new Response(body, { headers: { "Content-Type": TYPES[extname(file)] || "application/octet-stream" } });
}

async function callApi(request, pathname) {
  const file = await fileIfExists(join(ROOT, `${pathname}.js`));
  if (!file) return Response.json({ error: "Not found" }, { status: 404 });
  const mod = await import(pathToFileURL(file).href);
  const handler = mod[request.method] || mod.default?.fetch;
  if (!handler) return Response.json({ error: "Method not allowed" }, { status: 405 });
  return handler(request);
}

async function route(request) {
  const { pathname } = new URL(request.url);
  if (pathname.startsWith("/api/")) return callApi(request, pathname);
  if (matchers.some((re) => re.test(pathname))) {
    const res = await middlewareModule.default(request);
    const rewriteTo = res?.headers.get("x-middleware-rewrite");
    if (rewriteTo) return serveStatic(new URL(rewriteTo, request.url).pathname);
    if (res && !res.headers.get("x-middleware-next")) return res;
  }
  return serveStatic(pathname);
}

http
  .createServer(async (req, res) => {
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? Buffer.concat(chunks) : undefined;
      const request = new Request(`http://${req.headers.host}${req.url}`, {
        method: req.method,
        headers: Object.entries(req.headers).flatMap(([k, v]) => [v].flat().map((x) => [k, x])),
        body: ["GET", "HEAD"].includes(req.method) ? undefined : body,
      });
      const response = await route(request);
      const headers = {};
      response.headers.forEach((v, k) => {
        if (k !== "set-cookie") headers[k] = v;
      });
      const cookies = response.headers.getSetCookie();
      if (cookies.length) headers["set-cookie"] = cookies;
      res.writeHead(response.status, headers);
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch (err) {
      console.error(err);
      res.writeHead(500).end("Internal error");
    }
  })
  .listen(PORT, () => console.log(`Local server with login on http://localhost:${PORT}`));
