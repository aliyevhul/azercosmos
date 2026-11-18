import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, PencilLine } from "lucide-react";
import Reveal from "./Reveal";
import { isFillable, percent, progressLabel } from "../worksheets/api";

const colorMap = {
  "stage-1": "bg-stage-1/10 text-stage-1",
  "stage-2": "bg-stage-2/10 text-stage-2",
  "stage-3": "bg-stage-3/15 text-stage-3",
  "stage-4": "bg-stage-4/10 text-stage-4",
  "stage-5": "bg-stage-5/10 text-stage-5",
  "stage-6": "bg-stage-6/10 text-stage-6",
};

// One document in a list: opens the in-site viewer. Fill-in worksheets
// show the student's progress; the rest are marked as reading.
export default function DocumentCard({ doc, progress, color = "stage-2", delay = 0, surface = "bg-paper hover:bg-paper-dim" }) {
  const fillable = isFillable(doc.id);
  const p = progress?.[doc.id];
  const done = p && p.total && p.filled >= p.total;
  const pct = p ? percent(p.filled, p.total) : 0;

  return (
    <Reveal
      as={Link}
      to={`/worksheets/${doc.id}`}
      delay={delay}
      className={`btn-pop group flex items-start gap-4 rounded-xl p-5 transition-colors ${surface}`}
    >
      <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorMap[color] ?? colorMap["stage-2"]}`}>
        {done ? <CheckCircle2 size={18} /> : fillable ? <PencilLine size={18} /> : <BookOpen size={18} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15px] font-semibold text-ink">{doc.title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-slate">{doc.description}</span>
        {fillable ? (
          <span className="mt-3 flex items-center gap-3">
            <span className="h-1.5 w-28 overflow-hidden rounded-full bg-black/10" aria-hidden="true">
              <span className={`block h-full rounded-full ${done ? "bg-[#2f8a4c]" : "bg-stage-2"}`} style={{ width: `${pct}%` }} />
            </span>
            <span className={`text-xs font-medium ${done ? "text-[#1d5b33]" : "text-slate"}`}>
              {progress ? progressLabel(p) : "Fill in online"}
            </span>
          </span>
        ) : (
          <span className="mt-3 block text-xs font-medium text-slate">Read online</span>
        )}
      </span>
      <span className="mt-1 shrink-0 rounded-full bg-card px-2 py-0.5 font-mono text-[11px] font-medium text-slate">
        {doc.pages}
      </span>
    </Reveal>
  );
}
