import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, CloudOff, Eye, Loader2, Minus, Plus } from "lucide-react";
import AiSummary from "../components/AiSummary";
import { documentById } from "../data/documents";
import { NoBackend, countFilled, fetchAnswers, isFillable, percent, saveAnswers, worksheets } from "../worksheets/api";

// ─────────────────────────────────────────────────────────────────────────
// A worksheet inside the site: each page is an image of the PDF page with
// fill-in fields placed over its blanks (positions from
// shared/worksheet-fields.js). Answers save automatically. There is no
// download or print — the PDFs themselves aren't published.
//
// Admins can open /worksheets/<id>?student=<userId> to read a student's
// answers (read-only).
// ─────────────────────────────────────────────────────────────────────────

const ZOOMS = [1, 1.25, 1.5, 2];
const SAVE_DELAY = 800;
const RETRY_DELAY = 5000;

function Field({ field, value, onChange, readOnly, label }) {
  const style = {
    left: `${field.x * 100}%`,
    top: `${field.y * 100}%`,
    width: `${field.w * 100}%`,
    height: `${field.h * 100}%`,
  };

  if (field.type === "checkbox") {
    const checked = value === true;
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={label}
        disabled={readOnly}
        onClick={() => onChange(field.id, !checked)}
        className={`ws-field ws-check absolute flex items-center justify-center ${checked ? "is-filled" : ""}`}
        style={style}
      >
        {checked && <Check strokeWidth={3} className="h-[85%] w-[85%]" aria-hidden="true" />}
      </button>
    );
  }

  const props = {
    "aria-label": label,
    value: value ?? "",
    readOnly,
    maxLength: 2000,
    onChange: (e) => onChange(field.id, e.target.value),
    className: `ws-field absolute ${value ? "is-filled" : ""}`,
    style,
  };
  return field.type === "textarea" ? <textarea {...props} /> : <input type="text" autoComplete="off" {...props} />;
}

function SaveStatus({ status, error }) {
  const map = {
    loading: [<Loader2 key="i" size={14} className="animate-spin" />, "Loading…"],
    pending: [<Loader2 key="i" size={14} className="animate-spin" />, "Saving…"],
    saving: [<Loader2 key="i" size={14} className="animate-spin" />, "Saving…"],
    saved: [<Check key="i" size={14} />, "All changes saved"],
    ready: [<Check key="i" size={14} />, "Answers save automatically"],
    error: [<CloudOff key="i" size={14} />, "Not saved yet — retrying"],
    local: [<CloudOff key="i" size={14} />, "Local preview — answers aren't saved"],
    readonly: [<Eye key="i" size={14} />, "Read-only"],
    read: [<Eye key="i" size={14} />, "Reading only — nothing to fill in"],
    failed: [<CloudOff key="i" size={14} />, error || "Couldn't load your answers"],
  };
  const [icon, text] = map[status] || map.ready;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
        status === "error" || status === "failed" ? "text-[#9b1c1d]" : "text-slate"
      }`}
      role="status"
      aria-live="polite"
      title={status === "error" ? error : undefined}
    >
      {icon}
      {text}
    </span>
  );
}

export default function Worksheet() {
  const { docId } = useParams();
  const [params] = useSearchParams();
  const studentId = params.get("student");
  const doc = documentById[docId];
  const sheet = worksheets[docId];
  const fillable = isFillable(docId);

  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState(fillable ? "loading" : "read");
  const [error, setError] = useState("");
  const [student, setStudent] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [edits, setEdits] = useState(0);

  const answersRef = useRef({});
  const dirty = useRef(false);
  const inflight = useRef(false);
  const queued = useRef(false);
  const timer = useRef(null);
  const canSave = useRef(false);

  // ── load ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    clearTimeout(timer.current);
    dirty.current = false;
    canSave.current = false;
    answersRef.current = {};
    setAnswers({});
    setStudent(null);
    setEdits(0);
    if (!fillable) {
      setStatus("read");
      return;
    }
    setStatus("loading");
    fetchAnswers(docId, studentId)
      .then((data) => {
        if (!alive) return;
        answersRef.current = data.answers;
        setAnswers(data.answers);
        setStudent(data.student);
        canSave.current = !data.readOnly;
        setStatus(data.readOnly ? "readonly" : "ready");
      })
      .catch((err) => {
        if (!alive) return;
        if (err instanceof NoBackend) {
          setStatus("local");
        } else {
          setError(err.message);
          setStatus("failed");
        }
      });
    return () => {
      alive = false;
    };
  }, [docId, studentId, fillable]);

  // ── save ───────────────────────────────────────────────────────────────
  const flush = useCallback(async () => {
    if (!dirty.current || !canSave.current) return;
    if (inflight.current) {
      queued.current = true;
      return;
    }
    inflight.current = true;
    dirty.current = false;
    setStatus("saving");
    try {
      await saveAnswers(docId, answersRef.current);
      setStatus(dirty.current ? "pending" : "saved");
    } catch (err) {
      dirty.current = true;
      setError(err.message);
      setStatus("error");
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, RETRY_DELAY);
    } finally {
      inflight.current = false;
      if (queued.current) {
        queued.current = false;
        flush();
      }
    }
  }, [docId]);

  const update = useCallback(
    (id, value) => {
      const next = { ...answersRef.current, [id]: value };
      answersRef.current = next;
      setAnswers(next);
      if (!canSave.current) return;
      setEdits((n) => n + 1);
      dirty.current = true;
      setStatus("pending");
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, SAVE_DELAY);
    },
    [flush],
  );

  // Save straight away when leaving the page or switching tabs.
  useEffect(() => {
    const leave = () => {
      if (dirty.current && canSave.current) {
        dirty.current = false;
        saveAnswers(docId, answersRef.current, { keepalive: true }).catch(() => {});
      }
    };
    const onVisibility = () => document.visibilityState === "hidden" && leave();
    window.addEventListener("pagehide", leave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearTimeout(timer.current);
      leave();
      window.removeEventListener("pagehide", leave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [docId]);

  if (!doc || !sheet) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center md:px-8">
        <h1 className="font-display text-2xl font-bold text-ink">Worksheet not found</h1>
        <Link to="/documents" className="mt-4 inline-block text-stage-2 underline">
          See all documents
        </Link>
      </section>
    );
  }

  const readOnly = !["ready", "pending", "saving", "saved", "error", "local"].includes(status);
  const filled = countFilled(answers);
  const pct = percent(filled, sheet.fieldCount);
  const zi = ZOOMS.indexOf(zoom);
  const back = student ? { to: "/admin/progress", label: "Progress" } : { to: doc.stagePath, label: doc.stage };

  return (
    <div className="bg-card">
      {/* toolbar */}
      <div className="sticky top-0 z-20 border-b border-black/5 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 md:px-8">
          <Link to={back.to} className="inline-flex items-center gap-1 text-sm font-medium text-stage-2 hover:underline">
            <ArrowLeft size={16} aria-hidden="true" />
            {back.label}
          </Link>
          <h1 className="min-w-0 flex-1 truncate font-display text-base font-semibold text-ink md:text-lg">{doc.title}</h1>
          {fillable && (
            <span className="flex items-center gap-2 text-xs font-medium text-slate">
              <span
                className="h-1.5 w-24 overflow-hidden rounded-full bg-black/10"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Blanks filled in"
              >
                <span className="block h-full rounded-full bg-stage-2" style={{ width: `${pct}%` }} />
              </span>
              {filled}/{sheet.fieldCount} filled
            </span>
          )}
          <SaveStatus status={status} error={error} />
          <span className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-md border border-black/10 bg-paper p-1.5 text-ink hover:bg-card disabled:opacity-40"
              onClick={() => setZoom(ZOOMS[zi - 1])}
              disabled={zi <= 0}
              aria-label="Zoom out"
            >
              <Minus size={14} />
            </button>
            <span className="w-11 text-center font-mono text-xs text-slate">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              className="rounded-md border border-black/10 bg-paper p-1.5 text-ink hover:bg-card disabled:opacity-40"
              onClick={() => setZoom(ZOOMS[zi + 1])}
              disabled={zi >= ZOOMS.length - 1}
              aria-label="Zoom in"
            >
              <Plus size={14} />
            </button>
          </span>
        </div>
        {student && (
          <div className="bg-navy text-white">
            <p className="mx-auto max-w-7xl px-5 py-2 text-xs md:px-8">
              Viewing the answers of <b>{student.name || student.email}</b>
              {student.name ? ` (${student.email})` : ""} — read-only.
            </p>
          </div>
        )}
      </div>

      {/* pages */}
      <p className="ws-print-note hidden p-10 text-center">Printing is turned off for worksheets.</p>
      <div className="ws-pages overflow-x-auto px-4 py-6 md:py-10">
        <div className="mx-auto space-y-6" style={{ width: `calc(min(880px, 100vw - 2rem) * ${zoom})` }}>
          {sheet.pages.map((page, pi) => (
            <div
              key={pi}
              className={`ws-page relative select-none overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/5 ${
                readOnly ? "ws-readonly" : ""
              }`}
              style={{ aspectRatio: `1 / ${page.aspect}` }}
              onContextMenu={(e) => {
                if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) e.preventDefault();
              }}
            >
              <img
                src={`/worksheet-pages/${docId}/${pi + 1}.webp`}
                alt={`${doc.title} — page ${pi + 1} of ${sheet.pages.length}`}
                draggable={false}
                loading={pi === 0 ? "eager" : "lazy"}
                className="pointer-events-none absolute inset-0 h-full w-full"
              />
              {page.fields.map((f, fi) => (
                <Field
                  key={f.id}
                  field={f}
                  value={answers[f.id]}
                  onChange={update}
                  readOnly={readOnly}
                  label={`Page ${pi + 1}, ${f.type === "checkbox" ? "tick box" : "answer"} ${fi + 1} of ${page.fields.length}`}
                />
              ))}
            </div>
          ))}
          {["ready", "pending", "saving", "saved", "error", "readonly"].includes(status) && (
            <AiSummary
              docId={docId}
              userId={student ? studentId : undefined}
              edits={edits}
              busy={["pending", "saving", "error"].includes(status)}
              surface="bg-paper shadow-sm ring-1 ring-black/5"
            />
          )}
        </div>
      </div>
    </div>
  );
}
