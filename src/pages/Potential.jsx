import { Lightbulb, FileBarChart, ClipboardEdit } from "lucide-react";
import PageHero from "../components/PageHero";
import CategoryRow from "../components/CategoryRow";
import TopicCard from "../components/TopicCard";
import Callout from "../components/Callout";
import StageNav from "../components/StageNav";
import Reveal from "../components/Reveal";
import { nav, site } from "../config/site";

export default function Potential() {
  return (
    <>
      <PageHero lines={["DISCOVER", "YOUR", "STRENGTHS!"]} accentIndex={2} color="stage-2" image={site.heroImages.potential} />

      <section className="bg-paper pt-14 md:pt-16">
        <div className="mx-auto max-w-5xl space-y-5 px-5 md:px-8">
          <CategoryRow label="Lower Secondary">
            <TopicCard icon={Lightbulb} title="Assess yourself" href="#assess-yourself" color="stage-2" />
            <TopicCard icon={FileBarChart} title="How the assessment works" href="#assessment" color="stage-2" />
          </CategoryRow>
          <CategoryRow label="Upper Secondary">
            <TopicCard icon={ClipboardEdit} title="Plan your next steps" href="#next-steps" color="stage-2" />
          </CategoryRow>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl space-y-12 px-5 py-16 md:px-8 md:py-20">
          <Reveal as="div" id="assess-yourself">
            <h2 className="font-display text-xl font-semibold text-ink">Three angles worth checking</h2>
            <p className="mt-3 leading-relaxed text-slate">
              Strengths, interests, and working style don't always point to
              the same job — but together they narrow things down a lot
              faster than guessing from a list of career names.
            </p>
            <div className="mt-6 space-y-4">
              <Reveal delay={0} className="rounded-xl bg-card p-6">
                <h3 className="font-display text-base font-semibold text-ink">Strengths</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate">
                  What do people consistently ask you for help with? What
                  comes more easily to you than to most people around you?
                  Strengths are often invisible to the person who has them —
                  ask someone who knows you well.
                </p>
              </Reveal>
              <Reveal delay={100} className="rounded-xl bg-card p-6">
                <h3 className="font-display text-base font-semibold text-ink">Interests</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate">
                  What do you read about, watch, or do without anyone
                  telling you to? Interests point at subject areas; they
                  don't have to map directly onto a job title yet.
                </p>
              </Reveal>
              <Reveal delay={200} className="rounded-xl bg-card p-6">
                <h3 className="font-display text-base font-semibold text-ink">Working style</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate">
                  Do you prefer working with people, data, objects, or
                  ideas? Indoors or outdoors? Alone or in a team? This
                  shapes whether a job that matches your interests will
                  actually feel good day to day.
                </p>
              </Reveal>
            </div>
          </Reveal>

          <Reveal as="div" id="assessment">
            <h2 className="font-display text-xl font-semibold text-ink">A short exercise</h2>
            <p className="mt-3 leading-relaxed text-slate">
              Grab the worksheet from the documents page, then answer these
              before you fill it in:
            </p>
            <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-slate">
              <li className="border-b border-black/5 pb-3">List three things people thank you for</li>
              <li className="border-b border-black/5 pb-3">List three subjects or activities you'd choose freely</li>
              <li className="border-b border-black/5 pb-3">Describe your ideal Tuesday afternoon at work</li>
              <li className="pb-1">Name one thing you definitely don't want in a job</li>
            </ul>
          </Reveal>

          <Reveal as="div" id="next-steps">
            <Callout label="Tip">
              Don't filter your answers by what sounds impressive. "I'm good
              at calming people down" is just as useful here as "I'm good at
              math."
            </Callout>
          </Reveal>
        </div>
      </section>

      <StageNav
        prev={{ to: nav[0].to, label: nav[0].label }}
        next={{ to: nav[2].to, label: nav[2].label }}
      />
    </>
  );
}
