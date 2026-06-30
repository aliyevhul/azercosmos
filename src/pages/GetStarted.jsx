import { Compass, ClipboardList, Lightbulb } from "lucide-react";
import PageHero from "../components/PageHero";
import CategoryRow from "../components/CategoryRow";
import TopicCard from "../components/TopicCard";
import Checklist from "../components/Checklist";
import Callout from "../components/Callout";
import StageNav from "../components/StageNav";
import { nav } from "../config/site";

export default function GetStarted() {
  return (
    <>
      <PageHero lines={["LET'S", "GET", "STARTED!"]} accentIndex={2} color="stage-1" />

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-16">
          <p className="text-lg leading-relaxed text-slate">
            This site walks alongside the paper or digital passport you
            already have. Use it to understand how each stage works, see
            examples, and download anything you need along the way.
          </p>
        </div>
      </section>

      <section className="bg-paper pb-16 md:pb-20">
        <div className="mx-auto max-w-5xl space-y-6 px-5 md:px-8">
          <CategoryRow label="Overview">
            <TopicCard icon={Compass} title="How the passport works" href="#how-it-works" color="stage-1" />
            <TopicCard icon={Lightbulb} title="Tips before you begin" href="#tips" color="stage-1" />
          </CategoryRow>
          <CategoryRow label="Preparation">
            <TopicCard icon={ClipboardList} title="What to do first" href="#checklist" color="stage-1" />
          </CategoryRow>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl space-y-12 px-5 pb-16 md:px-8 md:pb-20">
          <div id="how-it-works">
            <h2 className="font-display text-xl font-semibold text-ink">How this works</h2>
            <p className="mt-3 leading-relaxed text-slate">
              The passport is built around six stages. You don't need to
              finish them in one sitting, and it's fine to revisit earlier
              stages as your thinking changes — that's normal, not a sign
              you're behind.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-card p-5">
                <p className="font-display text-2xl font-bold text-stage-1">1–2</p>
                <p className="mt-1 text-sm text-slate">Stages to figure out your strengths and interests</p>
              </div>
              <div className="rounded-xl bg-card p-5">
                <p className="font-display text-2xl font-bold text-stage-1">3–4</p>
                <p className="mt-1 text-sm text-slate">Stages to test ideas against the real world</p>
              </div>
              <div className="rounded-xl bg-card p-5">
                <p className="font-display text-2xl font-bold text-stage-1">5–6</p>
                <p className="mt-1 text-sm text-slate">Stages to organize everything into a plan</p>
              </div>
            </div>
          </div>

          <div id="checklist">
            <h2 className="font-display text-xl font-semibold text-ink">Before you start</h2>
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
          </div>

          <div id="tips">
            <Callout label="Tip">
              There's no wrong way to begin. If you already have a career
              idea in mind, jump to the next stage and use it as a
              hypothesis to test rather than a fixed answer.
            </Callout>
          </div>
        </div>
      </section>

      <StageNav next={{ to: nav[1].to, label: nav[1].label }} />
    </>
  );
}
