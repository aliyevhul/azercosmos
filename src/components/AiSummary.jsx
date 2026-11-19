import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { stageClasses } from "../config/colors";
import { NoBackend, createSummary, fetchSummary } from "../worksheets/api";

// AI summary of the answers on one worksheet (docId) or on all of them.
// Uses the same card look as "Your progress". Opening the page only reads
// the stored summary; the AI is asked only when the button is pressed.
//
//   docId    — one worksheet, or omit for all worksheets
//   userId   — admins: a student's summary (read-only for their answers)
//   edits    — counts edits made on this page; any edit after the summary
//              was loaded or written marks it as outdated
//   busy     — answers are still being saved: wait before summarising
//   color    — stage colour token for the button
//   surface  — card background (bg-paper on grey pages)

function List({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="mt-4">
      <h3 className="font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-slate">{title}</h3>
      <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-ink marker:text-slate/60">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "";
}

export default function AiSummary({ docId, userId, edits = 0, busy = false, color = "stage-2", title, surface = "bg-card", className = "" }) {
  const [state, setState] = useState({ phase: "loading" });
  const running = useRef(false);
  const editsSeen = useRef(edits); // edits already covered by the shown summary
  const latestEdits = useRef(edits);
  useEffect(() => {
    latestEdits.current = edits;
  }, [edits]);
  const c = stageClasses[color] ?? stageClasses["stage-2"];
  const forStudent = Boolean(userId);

  useEffect(() => {
    let alive = true;
    setState({ phase: "loading" });
    editsSeen.current = latestEdits.current;
    fetchSummary(docId, userId)
      .then((data) => alive && setState({ phase: "idle", data }))
      .catch((err) => {
        if (!alive) return;
        // no backend (plain `npm run dev`): leave the page exactly as it was
        setState(err instanceof NoBackend ? { phase: "hidden" } : { phase: "idle", data: null, error: err.message });
      });
    return () => {
      alive = false;
    };
  }, [docId, userId]);

  const generate = useCallback(async () => {
    if (running.current) return; // one request at a time
    running.current = true;
    setState((s) => ({ ...s, phase: "working", error: "" }));
    const at = edits;
    try {
      const data = await createSummary(docId, userId);
      editsSeen.current = at;
      setState({ phase: "idle", data });
    } catch (err) {
      setState((s) => ({
        ...s,
        phase: "idle",
        error: err instanceof NoBackend ? "AI summaries need the backend." : err.message,
        empty: err.code === "empty",
      }));
    } finally {
      running.current = false;
    }
  }, [docId, userId, edits]);

  if (state.phase === "hidden") return null;

  const data = state.data;
  const changed = edits > editsSeen.current;
  const summary = data?.summary;
  const working = state.phase === "working";
  const empty = (state.empty || data?.status === "empty") && !changed;
  const outdated = summary && (data.status === "stale" || changed);
  const unavailable = data && data.available === false;
  const heading = title || (docId ? "AI summary of these answers" : "AI summary of your worksheets");

  const label = working ? "Summarising…" : summary ? "Update summary" : forStudent ? "Summarise answers" : "Summarise my answers";

  return (
    <section className={`rounded-xl p-5 ${surface} ${className}`} aria-labelledby={`ai-summary-${docId || "all"}`} aria-busy={working}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={`ai-summary-${docId || "all"}`} className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          <Sparkles size={16} className={c.text} aria-hidden="true" />
          {heading}
        </h2>
        {state.phase !== "loading" && !unavailable && !(empty && !summary) && (
          <button
            type="button"
            onClick={generate}
            disabled={working || busy}
            className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 font-display text-sm font-semibold text-white disabled:opacity-60 ${c.bg} ${c.bgHover}`}
          >
            {working ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : summary ? <RefreshCw size={14} aria-hidden="true" /> : null}
            {label}
          </button>
        )}
      </div>

      <div role="status" aria-live="polite">
        {state.phase === "loading" && <p className="mt-3 text-sm text-slate">Loading…</p>}

        {state.phase !== "loading" && !summary && !working && !state.error && (
          <p className="mt-2 text-sm leading-relaxed text-slate">
            {unavailable
              ? "AI summaries aren't set up on this site yet."
              : empty
                ? forStudent
                  ? "Nothing is filled in yet, so there is nothing to summarise."
                  : "Fill in some answers first — then you can get a short summary of what they show."
                : forStudent
                  ? "Get a short summary of what these answers show."
                  : "Get a short summary of what your answers show, with ideas for next steps."}
          </p>
        )}

        {working && !summary && <p className="mt-3 text-sm text-slate">Reading the answers and writing a summary — this takes a few seconds.</p>}

        {state.error && (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-md bg-[#fdecec] px-3 py-2.5 text-sm text-[#9b1c1d]">
            <span className="flex-1">{state.error}</span>
            {!state.empty && !working && (
              <button type="button" onClick={generate} className="font-semibold underline">
                Try again
              </button>
            )}
          </div>
        )}
      </div>

      {summary && (
        <div className={working ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <p className="mt-3 text-[15px] leading-relaxed text-ink">{summary.overview}</p>
          <List title="Key points" items={summary.keyPoints} />
          <List title="Strengths" items={summary.strengths} />
          <List title="Next steps" items={summary.nextSteps} />
          <List title="Still open" items={summary.gaps} />
          <p className="mt-4 text-xs text-slate">
            {outdated ? "The answers have changed since this summary was written. " : ""}
            Written by AI from the saved answers{data.generatedAt ? ` on ${formatDate(data.generatedAt)}` : ""} — it can make
            mistakes.
          </p>
        </div>
      )}
    </section>
  );
}
