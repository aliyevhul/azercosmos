import PageHero from "../components/PageHero";
import StageNav from "../components/StageNav";
import Reveal from "../components/Reveal";
import PageDownloads from "../components/PageDownloads";
import DocumentCard from "../components/DocumentCard";
import { nav, site } from "../config/site";
import { documents, documentsByPage } from "../data/documents";
import useProgress from "../worksheets/useProgress";
import { fillableIds, percent } from "../worksheets/api";

function OverallProgress({ progress }) {
  if (!progress) return null;
  const items = fillableIds.map((id) => progress[id]).filter(Boolean);
  const filled = items.reduce((n, p) => n + p.filled, 0);
  const total = items.reduce((n, p) => n + p.total, 0);
  const started = items.filter((p) => p.filled > 0).length;
  const done = items.filter((p) => p.total && p.filled >= p.total).length;
  const pct = percent(filled, total);

  return (
    <Reveal className="mt-8 rounded-xl bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-semibold text-ink">Your progress</h2>
        <span className="text-sm text-slate">
          {started} of {items.length} worksheets started · {done} complete
        </span>
      </div>
      <div
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/10"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Share of all blanks filled in"
      >
        <div className="h-full rounded-full bg-stage-5" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate">{pct}% of all blanks filled in</p>
    </Reveal>
  );
}

export default function Documents() {
  const progress = useProgress();

  return (
    <>
      <PageHero lines={["YOUR", "DOCUMENTS!"]} accentIndex={1} color="stage-5" image={site.heroImages.documents} />

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-16">
          <Reveal as="p" className="text-lg leading-relaxed text-slate">
            Every worksheet in the program is here. Open one to read it or fill it in — your answers are saved to your
            account, so you can stop and continue any time. They're also on each individual stage page.
          </Reveal>
          <OverallProgress progress={progress} />
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
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      progress={progress}
                      color="stage-5"
                      delay={i * 70}
                      surface="bg-card hover:bg-card-icon"
                    />
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
