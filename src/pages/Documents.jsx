import PageHero from "../components/PageHero";
import StageNav from "../components/StageNav";
import { nav } from "../config/site";
import { documents } from "../data/documents";
import { FileDown } from "lucide-react";

export default function Documents() {
  return (
    <>
      <PageHero
        number={5}
        eyebrow="Documents"
        tone="stamp"
        title="Documents"
        intro="Worksheets and forms to download, print, and keep alongside your passport. Replace these with your own files any time."
      />

      <section className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <div className="space-y-12">
          {documents.map((group) => (
            <div key={group.category}>
              <h2 className="font-display text-lg font-semibold text-ink">{group.category}</h2>
              <div className="mt-4 space-y-3">
                {group.items.map((doc) => (
                  <a
                    key={doc.title}
                    href={doc.file}
                    download
                    className="group flex items-start gap-4 rounded-xl border border-paper-line bg-paper p-5 transition-colors hover:border-ink/30 hover:bg-paper-dim"
                  >
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stamp/10 text-stamp">
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
                    <span className="mt-1 shrink-0 font-mono text-xs uppercase tracking-wide text-slate">
                      {doc.sizeLabel}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-dashed border-paper-line p-6 text-sm text-slate">
          <strong className="font-display text-ink">Customizing this list:</strong> add your
          own PDFs to <code className="rounded bg-paper-dim px-1.5 py-0.5 font-mono text-xs">/public/documents/</code> and
          list them in <code className="rounded bg-paper-dim px-1.5 py-0.5 font-mono text-xs">src/data/documents.js</code>.
        </div>
      </section>

      <StageNav
        prev={{ to: nav[3].to, label: nav[3].label }}
        next={{ to: nav[5].to, label: nav[5].label }}
      />
    </>
  );
}
