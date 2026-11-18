import Reveal from "./Reveal";
import DocumentCard from "./DocumentCard";
import useProgress from "../worksheets/useProgress";

// The worksheets for one stage page. They open inside the site; fill-in
// worksheets save the student's answers automatically.
export default function PageDownloads({ items, color = "stage-2" }) {
  const progress = useProgress();
  if (!items || items.length === 0) return null;

  return (
    <section className="border-t border-black/5 bg-card">
      <div className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <Reveal>
          <h2 className="font-display text-xl font-semibold text-ink">Worksheets for this stage</h2>
          <p className="mt-2 text-sm text-slate">
            Open them right here and fill in the blanks — your answers are saved automatically.
          </p>
        </Reveal>

        <div className="mt-6 space-y-3">
          {items.map((doc, i) => (
            <DocumentCard key={doc.id} doc={doc} progress={progress} color={color} delay={i * 70} />
          ))}
        </div>
      </div>
    </section>
  );
}
