// Groq client: retries, timeouts, rate limits, fallback model, validation.
// No network: fetch is replaced with scripted responses.

import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { GroqError, _setTransport, groqChat } from "../server/groq.js";

const ok = (content, model = "openai/gpt-oss-120b") =>
  new Response(JSON.stringify({ model, choices: [{ message: { content }, finish_reason: "stop" }] }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
const status = (code, body = {}, headers = {}) =>
  new Response(JSON.stringify(body), { status: code, headers: { "content-type": "application/json", ...headers } });

let calls;
let sleeps;
function script(...responses) {
  calls = [];
  sleeps = [];
  _setTransport({
    fetch: async (url, init) => {
      calls.push({ url, body: JSON.parse(init.body), headers: init.headers, signal: init.signal });
      const next = responses.shift();
      if (!next) throw new Error("no more scripted responses");
      return typeof next === "function" ? next(init) : next;
    },
    sleep: async (ms) => {
      sleeps.push(ms);
    },
  });
}

const messages = [{ role: "user", content: "hi" }];

beforeEach(() => {
  process.env.GROQ_API_KEY = "test-key";
  delete process.env.GROQ_MODEL;
  delete process.env.GROQ_FALLBACK_MODEL;
});
afterEach(() => _setTransport());

test("returns the content and sends a JSON-mode request with the key in the header only", async () => {
  script(ok('{"a":1}'));
  const r = await groqChat({ messages, maxTokens: 300 });
  assert.equal(r.content, '{"a":1}');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.groq.com/openai/v1/chat/completions");
  assert.equal(calls[0].headers.Authorization, "Bearer test-key");
  assert.equal(calls[0].body.model, "openai/gpt-oss-120b");
  assert.equal(calls[0].body.max_completion_tokens, 300);
  assert.deepEqual(calls[0].body.response_format, { type: "json_object" });
  assert.ok(!JSON.stringify(calls[0].body).includes("test-key"));
});

test("missing key fails fast with a config error and no request", async () => {
  delete process.env.GROQ_API_KEY;
  script();
  await assert.rejects(groqChat({ messages }), (e) => e instanceof GroqError && e.kind === "config");
  assert.equal(calls.length, 0);
});

test("429 is retried after Retry-After, then succeeds", async () => {
  script(status(429, {}, { "retry-after": "2" }), ok('{"a":1}'));
  const r = await groqChat({ messages });
  assert.equal(r.content, '{"a":1}');
  assert.equal(calls.length, 2);
  assert.ok(sleeps[0] >= 2000, `waited ${sleeps[0]}ms`);
});

test("5xx is retried with growing backoff", async () => {
  script(status(503), status(502), ok("{}"));
  await groqChat({ messages });
  assert.equal(calls.length, 3);
  assert.equal(sleeps.length, 2);
  assert.ok(sleeps[1] > sleeps[0] - 600, "backoff grows (allowing for jitter)");
});

test("a hung request is aborted by the timeout and retried", async () => {
  process.env.GROQ_TIMEOUT_MS = "50";
  script(
    (init) =>
      new Promise((_, reject) => {
        init.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
      }),
    ok("{}"),
  );
  const started = Date.now();
  const r = await groqChat({ messages });
  delete process.env.GROQ_TIMEOUT_MS;
  assert.equal(r.content, "{}");
  assert.equal(calls.length, 2);
  assert.ok(calls[0].signal.aborted, "first request was aborted");
  assert.ok(Date.now() - started < 2000);
});

test("every attempt timing out → unavailable error", async () => {
  process.env.GROQ_TIMEOUT_MS = "20";
  const hang = (init) =>
    new Promise((_, reject) => init.signal.addEventListener("abort", () => reject(Object.assign(new Error("x"), { name: "AbortError" }))));
  script(...Array.from({ length: 6 }, () => hang));
  await assert.rejects(groqChat({ messages }), (e) => e instanceof GroqError && e.kind === "unavailable" && /timed out/.test(e.message));
  delete process.env.GROQ_TIMEOUT_MS;
  assert.equal(calls.length, 6);
});

test("network error is retried", async () => {
  script(() => Promise.reject(new TypeError("fetch failed")), ok("{}"));
  const r = await groqChat({ messages });
  assert.equal(r.content, "{}");
});

test("rate limit on the main model falls back to the fallback model", async () => {
  script(status(429), status(429), status(429), ok("{}", "openai/gpt-oss-20b"));
  const r = await groqChat({ messages });
  assert.equal(calls.length, 4);
  assert.equal(calls[3].body.model, "openai/gpt-oss-20b");
  assert.equal(r.model, "openai/gpt-oss-20b");
});

test("all attempts rate limited → rate_limit error", async () => {
  script(...Array.from({ length: 6 }, () => status(429)));
  await assert.rejects(groqChat({ messages }), (e) => e instanceof GroqError && e.kind === "rate_limit");
  assert.equal(calls.length, 6);
});

test("401 is not retried and is reported as a config problem", async () => {
  script(status(401, { error: { code: "invalid_api_key" } }));
  await assert.rejects(groqChat({ messages }), (e) => e.kind === "config" && e.status === 401);
  assert.equal(calls.length, 1);
});

test("404 model goes straight to the fallback model", async () => {
  script(status(404, { error: { code: "model_not_found" } }), ok("{}", "openai/gpt-oss-20b"));
  const r = await groqChat({ messages });
  assert.equal(calls.length, 2);
  assert.equal(r.model, "openai/gpt-oss-20b");
});

test("empty and unreadable answers are retried", async () => {
  script(
    ok(""),
    new Response("not json", { status: 200 }),
    ok('{"overview":"fine"}'),
  );
  const r = await groqChat({ messages });
  assert.equal(r.content, '{"overview":"fine"}');
  assert.equal(calls.length, 3);
});

test("answers failing validation are asked again; persistent failure → empty error", async () => {
  script(ok("nope"), ok('{"x":1}'));
  const r = await groqChat({ messages, validate: (c) => JSON.parse(c) });
  assert.deepEqual(r.value, { x: 1 });

  script(...Array.from({ length: 6 }, () => ok("nope")));
  await assert.rejects(
    groqChat({ messages, validate: (c) => JSON.parse(c) }),
    (e) => e instanceof GroqError && e.kind === "empty",
  );
});

test("GROQ_MODEL overrides the model; empty fallback disables it", async () => {
  process.env.GROQ_MODEL = "qwen/qwen3.8-27b";
  process.env.GROQ_FALLBACK_MODEL = "";
  script(status(429), status(429), status(429));
  await assert.rejects(groqChat({ messages }));
  assert.equal(calls.length, 3);
  assert.ok(calls.every((c) => c.body.model === "qwen/qwen3.8-27b"));
});
