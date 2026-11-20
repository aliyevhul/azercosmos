// Career helper chat (Groq).
//
//   GET  /api/chat                        → { available }  (is the AI set up?)
//   POST /api/chat  { messages: [...] }   → { reply }
//
// messages: [{ role: "user" | "assistant", content }], oldest first, ending
// with the student's new question. The conversation is kept in the browser;
// the server stores only when a question was asked (for the limits below).

import { requireUser } from "../server/auth.js";
import { generateReply, validateMessages } from "../server/chat.js";
import { getDb } from "../server/db.js";
import { GroqError, isGroqConfigured } from "../server/groq.js";
import { HttpError, handle, json, readJson } from "../server/http.js";

export const config = { maxDuration: 60 };

const PER_USER_PER_HOUR = 30;
const SITE_PER_HOUR = 600;

function groqToHttp(err) {
  if (err.kind === "config") {
    console.error(`chat: AI not configured or key rejected (${err.status ?? "no key"})`);
    return new HttpError(503, "The career helper isn't available right now. Please contact the site administrator.", {
      code: "unavailable",
    });
  }
  if (err.kind === "rate_limit") {
    return new HttpError(503, "The career helper is busy. Please try again in a minute.", { code: "busy" });
  }
  console.error(`chat: ${err.message}`);
  return new HttpError(502, "The career helper couldn't answer just now. Please try again.", { code: "failed" });
}

export const GET = handle(async (request) => {
  await requireUser(request);
  return json({ available: isGroqConfigured() });
});

export const POST = handle(async (request) => {
  const { user } = await requireUser(request);
  const body = await readJson(request, 96 * 1024);
  const messages = validateMessages(body.messages);
  if (!isGroqConfigured()) throw groqToHttp(new GroqError("config", "no key"));

  const db = await getDb();
  const { rows: [usage] } = await db.query(
    `SELECT count(*) FILTER (WHERE requester_id = $1)::int AS mine, count(*)::int AS site
       FROM app_ai_chat_usage WHERE at > now() - interval '1 hour'`,
    [user.id],
  );
  if (usage.mine >= PER_USER_PER_HOUR) {
    throw new HttpError(429, "You've asked a lot of questions this hour. Please try again a little later.", { code: "quota" });
  }
  if (usage.site >= SITE_PER_HOUR) {
    throw new HttpError(429, "The career helper is very busy right now. Please try again later.", { code: "busy" });
  }
  await db.query("INSERT INTO app_ai_chat_usage (requester_id) VALUES ($1)", [user.id]);
  await db.query("DELETE FROM app_ai_chat_usage WHERE at < now() - interval '2 days'");

  try {
    const { reply } = await generateReply(messages);
    return json({ reply });
  } catch (err) {
    throw err instanceof GroqError ? groqToHttp(err) : err;
  }
});
