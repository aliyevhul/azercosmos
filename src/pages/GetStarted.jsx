import PageHero from "../components/PageHero";
import Checklist from "../components/Checklist";
import Callout from "../components/Callout";
import StageNav from "../components/StageNav";
import { nav } from "../config/site";

export default function GetStarted() {
  return (
    <>
      <PageHero
        number={1}
        eyebrow="Get Started"
        tone="brass"
        title="Welcome to your career passport"
        intro="This site walks alongside the paper or digital passport you already have. Use it to understand each stage, see examples, and download anything you need along the way."
      />

      <section className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <h2 className="font-display text-xl font-semibold text-ink">How this works</h2>
        <p className="mt-3 leading-relaxed text-slate">
          The passport is built around six stages. You don't need to finish
          them in one sitting, and it's fine to revisit earlier stages as
          your thinking changes — that's normal, not a sign you're behind.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-paper-line bg-paper-dim p-5">
            <p className="font-display text-2xl font-semibold text-ink">1–2</p>
            <p className="mt-1 text-sm text-slate">Stages to figure out your strengths and interests</p>
          </div>
          <div className="rounded-xl border border-paper-line bg-paper-dim p-5">
            <p className="font-display text-2xl font-semibold text-ink">3–4</p>
            <p className="mt-1 text-sm text-slate">Stages to test ideas against the real world</p>
          </div>
          <div className="rounded-xl border border-paper-line bg-paper-dim p-5">
            <p className="font-display text-2xl font-semibold text-ink">5–6</p>
            <p className="mt-1 text-sm text-slate">Stages to organize everything into a plan</p>
          </div>
        </div>

        <h2 className="mt-12 font-display text-xl font-semibold text-ink">Before you start</h2>
        <p className="mt-3 leading-relaxed text-slate">
          A little preparation makes the rest of the passport go faster.
        </p>
        <div className="mt-5">
          <Checklist
            items={[
              "Get a folder or notebook (paper or digital) to keep your passport pages together",
              "Set aside about 30 minutes for the first two stages",
              "Ask a teacher, mentor, or family member if they'd be willing to give feedback later",
              "Keep an open mind — early answers are a starting point, not a final decision",
            ]}
          />
        </div>

        <div className="mt-10">
          <Callout label="Tip">
            There's no wrong way to begin. If you already have a career idea
            in mind, jump to stage two and use it as a hypothesis to test
            rather than a fixed answer.
          </Callout>
        </div>
      </section>

      <StageNav next={{ to: nav[1].to, label: nav[1].label }} />
    </>
  );
}
