import { goToLogin } from "../auth/AuthContext";
import worksheets from "../../shared/worksheet-fields.js";

// ── Worksheet catalogue (generated from the PDFs) ─────────────────────────
export { worksheets };
export const isFillable = (id) => (worksheets[id]?.fieldCount ?? 0) > 0;
export const fillableIds = Object.keys(worksheets).filter(isFillable);

// ── API ──────────────────────────────────────────────────────────────────
// Thrown when there is no backend (plain `npm run dev`): the viewer then
// works without saving.
export class NoBackend extends Error {}

async function request(path, options = {}) {
  const res = await fetch(path, { credentials: "same-origin", ...options });
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  if (!isJson) throw new NoBackend("No backend available.");
  const data = await res.json();
  if (res.status === 401) {
    goToLogin();
    throw new Error("Your session has ended. Please sign in again.");
  }
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status}).`);
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data;
}

const withUser = (params, userId) => {
  if (userId) params.set("user", userId);
  const q = params.toString();
  return `/api/worksheets${q ? `?${q}` : ""}`;
};

export const fetchProgress = (userId) => request(withUser(new URLSearchParams(), userId));

export const fetchAnswers = (docId, userId) => request(withUser(new URLSearchParams({ doc: docId }), userId));

export const saveAnswers = (docId, answers, { keepalive = false } = {}) =>
  request("/api/worksheets", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doc: docId, answers }),
    keepalive,
  });

export const fetchAllProgress = () => request("/api/admin/progress");

// AI summary of the answers: one worksheet (docId) or all of them (no docId).
// GET only reads the stored summary; POST creates or refreshes it.
export const fetchSummary = (docId, userId) => {
  const params = new URLSearchParams();
  if (docId) params.set("doc", docId);
  if (userId) params.set("user", userId);
  const q = params.toString();
  return request(`/api/summary${q ? `?${q}` : ""}`);
};

export const createSummary = (docId, userId) =>
  request("/api/summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...(docId ? { doc: docId } : {}), ...(userId ? { user: Number(userId) } : {}) }),
  });

// Career helper chat. messages: [{ role: "user" | "assistant", content }]
export const chatAvailable = () => request("/api/chat");

export const sendChat = (messages) =>
  request("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

// ── Progress helpers ─────────────────────────────────────────────────────
export const countFilled = (answers) =>
  Object.values(answers).filter((v) => v === true || (typeof v === "string" && v.trim() !== "")).length;

export const percent = (filled, total) => (total ? Math.round((filled / total) * 100) : 0);

export function progressLabel(p) {
  if (!p || (!p.filled && !p.updatedAt)) return "Not started";
  if (p.filled >= p.total) return "Complete";
  return `${percent(p.filled, p.total)}% filled in`;
}
