import { FileDown } from "lucide-react";
import Reveal from "./Reveal";

export default function PageDownloads({ items, color = "stage-2" }) {
  if (!items || items.length === 0) return null;

  const colorMap = {
    "stage-1": "bg-stage-1/10 text-stage-1",
    "stage-2": "bg-stage-2/10 text-stage-2",
    "stage-3": "bg-stage-3/15 text-stage-3",
    "stage-4": "bg-stage-4/10 text-stage-4",
    "stage-5": "bg-stage-5/10 text-stage-5",
    "stage-6": "bg-stage-6/10 text-stage-6",
  };
  const iconClass = colorMap[color] ?? colorMap["stage-2"];

  return (
    <section className="border-t border-black/5 bg-card">
      <div className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <Reveal>
          <h2 className="font-display text-xl font-semibold text-ink">
            Worksheets for this stage
          </h2>
          <p className="mt-2 text-sm text-slate">
            Download, print, and fill in alongside your Career Guidance program.
          </p>
        </Reveal>

        <div className="mt-6 space-y-3">
          {items.map((doc, i) => (
            <Reveal
              as="a"
              key={doc.file}
              href={doc.file}
              download
              delay={i * 70}
              className="btn-pop group flex items-start gap-4 rounded-xl bg-paper p-5 transition-colors hover:bg-paper-dim"
              style={{}}
            >
              <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
                <FileDown size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[15px] font-semibold text-ink">
                  {doc.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-slate">
                  {doc.description}
                </span>
              </span>
              <span className="mt-1 shrink-0 rounded-full bg-card px-2 py-0.5 font-mono text-[11px] font-medium text-slate">
                {doc.pages}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
