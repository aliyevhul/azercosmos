import PageHero from "../components/PageHero";
import StageNav from "../components/StageNav";
import Reveal from "../components/Reveal";
import PageDownloads from "../components/PageDownloads";
import { nav, site } from "../config/site";
import { documents, documentsByPage } from "../data/documents";
import { FileDown } from "lucide-react";

export default function Documents() {
  return (
    <>
      <PageHero lines={["YOUR", "DOCUMENTS!"]} accentIndex={1} color="stage-5" image={site.heroImages.documents} />

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-16">
          <Reveal as="p" className="text-lg leading-relaxed text-slate">
            Every worksheet in the program is available here. Click any card to download and print it.
            They're also available on each individual stage page.
          </Reveal>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-5 pb-16 md:px-8 md:pb-20">
          <div className="space-y-12">
            {documents.map((group) => (
              <div key={group.category}>
                <Reveal>
                  <h2 className="font-display text-lg font-semibold text-ink">{group.category}</h2>
                </Reveal>
                <div className="mt-4 space-y-3">
                  {group.items.map((doc, i) => (
                    <Reveal
                      as="a"
                      key={doc.file}
                      href={doc.file}
                      download
                      delay={i * 70}
                      className="btn-pop group flex items-start gap-4 rounded-xl bg-card p-5 transition-colors hover:bg-card-icon"
                    >
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stage-5/10 text-stage-5">
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
                      <span className="mt-1 shrink-0 rounded-full bg-paper px-2 py-0.5 font-mono text-[11px] font-medium text-slate">
                        {doc.pages}
                      </span>
                    </Reveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Documents page's own specific worksheets (checklist + evidence log) */}
      <PageDownloads items={documentsByPage.documents} color="stage-5" />

      <StageNav
        prev={{ to: nav[3].to, label: nav[3].label }}
        next={{ to: nav[5].to, label: nav[5].label }}
      />
    </>
  );
}
