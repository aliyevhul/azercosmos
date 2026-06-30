import PageHero from "../components/PageHero";
import Checklist from "../components/Checklist";
import Callout from "../components/Callout";
import StageNav from "../components/StageNav";
import { nav } from "../config/site";

export default function Potential() {
  return (
    <>
      <PageHero
        number={2}
        eyebrow="Potential"
        tone="stamp"
        title="Discover your potential"
        intro="Before exploring job titles, get clear on what you're already good at, what you enjoy, and what kind of work actually energizes you."
      />

      <section className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <h2 className="font-display text-xl font-semibold text-ink">Three angles worth checking</h2>
        <p className="mt-3 leading-relaxed text-slate">
          Strengths, interests, and working style don't always point to the
          same job — but together they narrow things down a lot faster than
          guessing from a list of career names.
        </p>

        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-paper-line p-6">
            <h3 className="font-display text-base font-semibold text-ink">Strengths</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-slate">
              What do people consistently ask you for help with? What
              comes more easily to you than to most people around you?
              Strengths are often invisible to the person who has them —
              ask someone who knows you well.
            </p>
          </div>
          <div className="rounded-xl border border-paper-line p-6">
            <h3 className="font-display text-base font-semibold text-ink">Interests</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-slate">
              What do you read about, watch, or do without anyone telling
              you to? Interests point at subject areas; they don't have to
              map directly onto a job title yet.
            </p>
          </div>
          <div className="rounded-xl border border-paper-line p-6">
            <h3 className="font-display text-base font-semibold text-ink">Working style</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-slate">
              Do you prefer working with people, data, objects, or ideas?
              Indoors or outdoors? Alone or in a team? This shapes whether
              a job that matches your interests will actually feel good
              day to day.
            </p>
          </div>
        </div>

        <h2 className="mt-12 font-display text-xl font-semibold text-ink">A short exercise</h2>
        <p className="mt-3 leading-relaxed text-slate">
          Grab the worksheet from the documents page, then answer these
          before you fill it in:
        </p>
        <div className="mt-5">
          <Checklist
            items={[
              "List three things people thank you for",
              "List three subjects or activities you'd choose freely",
              "Describe your ideal Tuesday afternoon at work",
              "Name one thing you definitely don't want in a job",
            ]}
          />
        </div>

        <div className="mt-10">
          <Callout label="Tip">
            Don't filter your answers by what sounds impressive. "I'm good
            at calming people down" is just as useful here as "I'm good at
            math."
          </Callout>
        </div>
      </section>

      <StageNav
        prev={{ to: nav[0].to, label: nav[0].label }}
        next={{ to: nav[2].to, label: nav[2].label }}
      />
    </>
  );
}
