import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, RotateCcw, Send, X } from "lucide-react";
import MiniMarkdown from "./MiniMarkdown";
import { NoBackend, chatAvailable, sendChat } from "../worksheets/api";

// ─────────────────────────────────────────────────────────────────────────
// Career helper: a floating chat on every page. Answers come from
// /api/chat (Groq). The conversation is kept in this browser tab only
// (sessionStorage) and is never saved on the server. Hidden when the AI
// isn't set up or there is no backend.
// ─────────────────────────────────────────────────────────────────────────

const STORE_KEY = "career-helper-chat";
const MAX_LENGTH = 1500;
const MAX_KEPT = 20; // the API accepts at most 20 messages

const SUGGESTIONS = [
  "How do I find an internship?",
  "What should my first CV include?",
  "Hansı peşələr mənə uyğun ola bilər?",
  "How do I prepare for a job interview?",
];

function load() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((m) => m && typeof m.content === "string") : [];
  } catch {
    return [];
  }
}

function save(messages) {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(messages));
  } catch {
    // storage blocked: the chat still works for this page
  }
}

export default function CareerChat() {
  const [available, setAvailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(load);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    let alive = true;
    chatAvailable()
      .then((d) => alive && setAvailable(Boolean(d.available)))
      .catch((err) => alive && !(err instanceof NoBackend) && setAvailable(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => save(messages), [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending, open]);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  const ask = useCallback(
    async (history) => {
      setSending(true);
      setError("");
      try {
        const { reply } = await sendChat(history.slice(-MAX_KEPT));
        setMessages([...history, { role: "assistant", content: reply }].slice(-MAX_KEPT));
      } catch (err) {
        setError(err instanceof NoBackend ? "The career helper needs the backend." : err.message);
      } finally {
        setSending(false);
      }
    },
    [],
  );

  const submit = (text) => {
    const content = text.trim();
    if (!content || sending) return;
    const history = [...messages, { role: "user", content }].slice(-MAX_KEPT);
    setMessages(history);
    setDraft("");
    ask(history);
  };

  const retry = () => {
    if (messages.length && messages[messages.length - 1].role === "user") ask(messages);
  };

  const clear = () => {
    setMessages([]);
    setError("");
    inputRef.current?.focus();
  };

  if (!available) return null;

  return (
    <>
      {!open && (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-3 font-display text-sm font-semibold text-white shadow-lg ring-1 ring-white/10 transition-transform hover:scale-[1.03] print:hidden"
          aria-haspopup="dialog"
        >
          <MessageCircle size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Career helper</span>
          <span className="sr-only sm:hidden">Open the career helper</span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Career helper"
          onKeyDown={(e) => e.key === "Escape" && close()}
          className="fixed right-4 bottom-4 z-50 flex h-[min(580px,calc(100dvh-2rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl bg-paper shadow-2xl ring-1 ring-black/10 print:hidden"
        >
          <div className="flex items-start justify-between gap-3 bg-navy px-4 py-3 text-white">
            <div>
              <p className="font-display text-base font-semibold">Career helper</p>
              <p className="text-xs text-white/70">Ask about jobs, internships, CVs or interviews.</p>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clear}
                  className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
                  aria-label="Start a new conversation"
                  title="New conversation"
                >
                  <RotateCcw size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={close}
                className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
                aria-label="Close the career helper"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.length === 0 && (
              <div>
                <p className="text-sm leading-relaxed text-slate">
                  Hi! I can help you think about careers, internships, applications and interviews. Write in any language —
                  I'll answer in the same one.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => submit(s)}
                      className="rounded-full border border-black/10 bg-card px-3 py-1.5 text-left text-xs font-medium text-ink hover:bg-card-icon"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-md bg-stage-2 px-3.5 py-2 text-sm whitespace-pre-wrap text-white">
                    {m.content}
                  </p>
                </div>
              ) : (
                <div key={i} className="flex justify-start">
                  <MiniMarkdown
                    text={m.content}
                    className="max-w-[90%] rounded-2xl rounded-bl-md bg-card px-3.5 py-2.5 text-sm leading-relaxed text-ink"
                  />
                </div>
              ),
            )}

            {sending && (
              <p className="flex items-center gap-2 text-xs text-slate">
                <Loader2 size={14} className="animate-spin" aria-hidden="true" /> Thinking…
              </p>
            )}
            {error && (
              <div role="alert" className="rounded-md bg-[#fdecec] px-3 py-2 text-xs text-[#9b1c1d]">
                {error}{" "}
                {messages.at(-1)?.role === "user" && (
                  <button type="button" onClick={retry} className="font-semibold underline">
                    Try again
                  </button>
                )}
              </div>
            )}
          </div>

          <form
            className="border-t border-black/5 px-3 pt-3 pb-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit(draft);
            }}
          >
            <div className="flex items-end gap-2">
              <label htmlFor="career-chat-input" className="sr-only">
                Your question
              </label>
              <textarea
                id="career-chat-input"
                ref={inputRef}
                rows={1}
                value={draft}
                maxLength={MAX_LENGTH}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(draft);
                  }
                }}
                placeholder="Ask a question…"
                className="max-h-28 min-h-[42px] flex-1 resize-none rounded-xl border border-black/15 bg-paper px-3 py-2.5 text-sm text-ink focus:border-stage-2 focus:ring-2 focus:ring-stage-2/20 focus:outline-none"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-stage-2 text-white disabled:opacity-50"
                aria-label="Send"
              >
                <Send size={17} />
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-snug text-slate">
              AI can make mistakes. Your messages are sent to Groq to write the answers and aren't saved on this site.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
