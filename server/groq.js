// Groq chat completions over its OpenAI-compatible REST API (plain fetch,
// no SDK). Server only: GROQ_API_KEY is read here and never leaves the
// backend.
//
//   const { content, model } = await groqChat({ messages, maxTokens })
//
// - request timeout per attempt, plus an overall deadline
// - retries with exponential backoff (and Retry-After) on 429, 5xx,
//   timeouts and network errors; no retry on other 4xx
// - when the main model stays unavailable, one try with a fallback model
// - logs only status codes and model names, never the key or the prompt

const API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const DEFAULT_MODEL = "openai/gpt-oss-120b";
export const DEFAULT_FALLBACK_MODEL = "openai/gpt-oss-20b";

const ATTEMPT_TIMEOUT_MS = 25_000;
const DEADLINE_MS = 50_000; // stays inside the function's maxDuration
const MAX_ATTEMPTS = 3; // per model
const BASE_DELAY_MS = 600;
const MAX_DELAY_MS = 8_000;

export class GroqError extends Error {
  // kind: "config" | "rate_limit" | "unavailable" | "rejected" | "empty"
  constructor(kind, message, { status = null, retryAfter = null } = {}) {
    super(message);
    this.kind = kind;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

// Swappable for tests.
let fetchImpl = (...args) => globalThis.fetch(...args);
let sleepImpl = (ms) => new Promise((r) => setTimeout(r, ms));
export function _setTransport({ fetch, sleep } = {}) {
  fetchImpl = fetch || ((...args) => globalThis.fetch(...args));
  sleepImpl = sleep || ((ms) => new Promise((r) => setTimeout(r, ms)));
}

export function groqConfig() {
  const apiKey = (process.env.GROQ_API_KEY || "").trim();
  return {
    apiKey,
    model: (process.env.GROQ_MODEL || "").trim() || DEFAULT_MODEL,
    fallbackModel: (process.env.GROQ_FALLBACK_MODEL ?? DEFAULT_FALLBACK_MODEL).trim(),
    timeoutMs: Number(process.env.GROQ_TIMEOUT_MS) > 0 ? Number(process.env.GROQ_TIMEOUT_MS) : ATTEMPT_TIMEOUT_MS,
  };
}

export function isGroqConfigured() {
  return Boolean(groqConfig().apiKey);
}

function retryAfterMs(res) {
  const raw = res.headers.get("retry-after");
  if (!raw) return null;
  const secs = Number(raw);
  if (Number.isFinite(secs)) return Math.max(0, secs * 1000);
  const at = Date.parse(raw);
  return Number.isFinite(at) ? Math.max(0, at - Date.now()) : null;
}

function backoff(attempt, hintMs) {
  const exp = BASE_DELAY_MS * 2 ** attempt;
  const jitter = Math.random() * BASE_DELAY_MS;
  return Math.min(MAX_DELAY_MS, Math.max(hintMs ?? 0, exp + jitter));
}

function isReasoningModel(model) {
  return model.startsWith("openai/gpt-oss") || model.startsWith("qwen/");
}

async function callOnce({ apiKey, model, messages, maxTokens, temperature, json, timeoutMs }) {
  const body = {
    model,
    messages,
    temperature,
    max_completion_tokens: maxTokens,
  };
  if (json) body.response_format = { type: "json_object" };
  // keep reasoning short: summaries don't need it, and it costs tokens
  if (isReasoningModel(model)) body.reasoning_effort = "low";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetchImpl(API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    const timedOut = controller.signal.aborted || err?.name === "AbortError" || err?.name === "TimeoutError";
    return { retry: true, error: new GroqError("unavailable", timedOut ? "Groq request timed out." : "Could not reach Groq.") };
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 429) {
    return { retry: true, wait: retryAfterMs(res), error: new GroqError("rate_limit", "Groq rate limit reached.", { status: 429, retryAfter: retryAfterMs(res) }) };
  }
  if (res.status >= 500) {
    return { retry: true, error: new GroqError("unavailable", `Groq returned ${res.status}.`, { status: res.status }) };
  }
  if (!res.ok) {
    // 400 (e.g. JSON mode failed to produce JSON), 401/403 (bad key), 404 (model gone)
    let code = "";
    try {
      code = (await res.json())?.error?.code || "";
    } catch {
      /* ignore */
    }
    if (res.status === 400 && code === "json_validate_failed") {
      return { retry: true, error: new GroqError("empty", "Groq returned invalid JSON.", { status: 400 }) };
    }
    const kind = res.status === 401 || res.status === 403 ? "config" : "rejected";
    return { retry: false, modelProblem: res.status === 404, error: new GroqError(kind, `Groq rejected the request (${res.status}${code ? ` ${code}` : ""}).`, { status: res.status }) };
  }

  let data;
  try {
    data = await res.json();
  } catch {
    return { retry: true, error: new GroqError("empty", "Groq returned an unreadable response.") };
  }
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    return { retry: true, error: new GroqError("empty", "Groq returned an empty answer.") };
  }
  return { content, model: data.model || model, usage: data.usage || null, finishReason: data.choices[0].finish_reason };
}

export async function groqChat({ messages, maxTokens = 900, temperature = 0.2, json = true, validate = null }) {
  const { apiKey, model, fallbackModel, timeoutMs } = groqConfig();
  if (!apiKey) throw new GroqError("config", "GROQ_API_KEY is not set.");

  const deadline = Date.now() + DEADLINE_MS;
  const models = [model, fallbackModel].filter((m, i, a) => m && a.indexOf(m) === i);
  let lastError = null;

  for (const m of models) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const left = deadline - Date.now();
      if (left < 2_000) break;
      const result = await callOnce({ apiKey, model: m, messages, maxTokens, temperature, json, timeoutMs: Math.min(timeoutMs, left) });

      if (result.content !== undefined) {
        if (!validate) return result;
        try {
          return { ...result, value: validate(result.content) };
        } catch (err) {
          // the model answered, but not in the shape we asked for: ask again
          lastError = new GroqError("empty", err.message || "Groq answer failed validation.");
          console.warn(`groq: invalid answer from ${m} (attempt ${attempt + 1})`);
          continue;
        }
      }

      lastError = result.error;
      console.warn(`groq: ${m} attempt ${attempt + 1} failed: ${result.error.message}`);
      if (!result.retry) {
        if (result.modelProblem) break; // try the fallback model
        throw result.error;
      }
      const wait = backoff(attempt, result.wait);
      if (attempt < MAX_ATTEMPTS - 1 && Date.now() + wait < deadline - 2_000) await sleepImpl(wait);
    }
  }
  throw lastError || new GroqError("unavailable", "Groq is unavailable.");
}
