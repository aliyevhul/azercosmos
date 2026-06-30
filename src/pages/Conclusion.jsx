import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import Stamp from "../components/Stamp";
import StageNav from "../components/StageNav";
import { nav } from "../config/site";

export default function Conclusion() {
  return (
    <>
      <PageHero
        number={6}
        eyebrow="Conclusion"
        tone="forest"
        title="Bring it all together"
        intro="You've gathered strengths, interests, real-world impressions, and a sense of the routes available. The last step is turning that into a plan you can act on."
      />

      <section className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <h2 className="font-display text-xl font-semibold text-ink">Write your one-page plan</h2>
        <p className="mt-3 leading-relaxed text-slate">
          You don't need certainty — you need a next step. Use what you
          collected in stages two through four to answer these in a few
          sentences each:
        </p>

        <ol className="mt-6 space-y-4">
          {[
            "What direction feels most worth exploring right now, and why?",
            "What did the practical phase confirm or change about that direction?",
            "Which training route fits that direction and your situation best?",
            "What is the one concrete thing you'll do in the next month?",
          ].map((q, i) => (
            <li key={q} className="flex gap-4 rounded-xl border border-paper-line p-5">
              <span className="font-display text-lg font-semibold text-forest">{i + 1}</span>
              <span className="text-[15px] leading-relaxed text-ink">{q}</span>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-paper-line bg-paper-dim px-6 py-12 text-center">
          <Stamp number={6} label="Conclusion" tone="forest" size={80} />
          <h3 className="font-display text-xl font-semibold text-ink">That's the full passport.</h3>
          <p className="max-w-md text-[15px] text-slate">
            Plans change, and that's expected — you can come back to any
            stage as new information comes in.
          </p>
          <Link
            to="/"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-display text-sm font-semibold text-paper hover:bg-ink-light"
          >
            Back to the overview
          </Link>
        </div>
      </section>

      <StageNav prev={{ to: nav[4].to, label: nav[4].label }} />
    </>
  );
}
