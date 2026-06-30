import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import StageNav from "../components/StageNav";
import { nav, site } from "../config/site";

export default function Conclusion() {
  return (
    <>
      <PageHero lines={["BRING IT", "ALL", "TOGETHER!"]} accentIndex={2} color="stage-6" image={site.heroImages.conclusion} />

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-20">
          <p className="text-lg leading-relaxed text-slate">
            You've gathered strengths, interests, real-world impressions,
            and a sense of the routes available. The last step is turning
            that into a plan you can act on.
          </p>

          <h2 className="mt-10 font-display text-xl font-semibold text-ink">Write your one-page plan</h2>
          <p className="mt-3 leading-relaxed text-slate">
            You don't need certainty — you need a next step. Use what you
            collected in the earlier stages to answer these in a few
            sentences each:
          </p>

          <ol className="mt-6 space-y-4">
            {[
              "What direction feels most worth exploring right now, and why?",
              "What did the practical phase confirm or change about that direction?",
              "Which training route fits that direction and your situation best?",
              "What is the one concrete thing you'll do in the next month?",
            ].map((q, i) => (
              <li key={q} className="flex gap-4 rounded-xl bg-card p-5">
                <span className="font-display text-lg font-bold text-stage-6">{i + 1}</span>
                <span className="text-[15px] leading-relaxed text-ink">{q}</span>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl bg-card px-6 py-12 text-center">
            <h3 className="font-display text-xl font-semibold text-ink">That's the full guide.</h3>
            <p className="max-w-md text-[15px] text-slate">
              Plans change, and that's expected — you can come back to any
              stage as new information comes in.
            </p>
            <Link
              to="/"
              className="btn-pop mt-2 inline-flex items-center gap-2 rounded-md bg-stage-6 px-6 py-3 font-display text-sm font-semibold text-white hover:bg-stage-6/90"
            >
              Back to the overview
            </Link>
          </div>
        </div>
      </section>

      <StageNav prev={{ to: nav[4].to, label: nav[4].label }} />
    </>
  );
}
