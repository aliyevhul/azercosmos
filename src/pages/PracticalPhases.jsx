import { Eye, Briefcase, Building2 } from "lucide-react";
import PageHero from "../components/PageHero";
import CategoryRow from "../components/CategoryRow";
import TopicCard from "../components/TopicCard";
import Checklist from "../components/Checklist";
import Callout from "../components/Callout";
import StageNav from "../components/StageNav";
import { nav } from "../config/site";

const phases = [
  {
    title: "Job shadowing",
    length: "Half a day to a day",
    description:
      "Follow someone through a normal working day without taking on tasks yourself. Low commitment, high information.",
  },
  {
    title: "Short work experience",
    length: "1–2 weeks",
    description:
      "Take on light real tasks under supervision. Good for testing whether an industry feels right before committing further.",
  },
  {
    title: "Extended internship",
    length: "Several weeks or more",
    description:
      "Work close to a real role with real responsibility. Best attempted once you've already narrowed down a direction.",
  },
];

export default function PracticalPhases() {
  return (
    <>
      <PageHero lines={["TIME", "TO GET", "PRACTICAL!"]} accentIndex={2} color="stage-3" />

      <section className="bg-paper pt-14 md:pt-16">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <CategoryRow label="Ways to get experience">
            <TopicCard icon={Eye} title="Job shadowing" href="#phases" color="stage-3" />
            <TopicCard icon={Briefcase} title="Short work experience" href="#phases" color="stage-3" />
            <TopicCard icon={Building2} title="Extended internship" href="#phases" color="stage-3" />
          </CategoryRow>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-20">
          <p className="text-lg leading-relaxed text-slate">
            Reading about a job and doing it for a day are completely
            different experiences. This stage is about getting real
            information from real workplaces.
          </p>

          <h2 id="phases" className="mt-10 font-display text-xl font-semibold text-ink">
            Ways to get hands-on experience
          </h2>
          <div className="mt-6 space-y-4">
            {phases.map((p) => (
              <div key={p.title} className="flex flex-col gap-1 rounded-xl bg-card p-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div>
                  <h3 className="font-display text-base font-semibold text-ink">{p.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate">{p.description}</p>
                </div>
                <span className="mt-2 inline-block shrink-0 rounded-full bg-stage-3/15 px-3 py-1 font-display text-xs font-semibold text-stage-3 sm:mt-0">
                  {p.length}
                </span>
              </div>
            ))}
          </div>

          <h2 className="mt-12 font-display text-xl font-semibold text-ink">Before you go in</h2>
          <div className="mt-5">
            <Checklist
              items={[
                "Write down two or three questions you want answered by the end",
                "Confirm dress code, start time, and what to bring the day before",
                "Bring a notebook — small details fade fast once you're back home",
                "Ask if a supervisor would be willing to fill in feedback afterward",
              ]}
            />
          </div>

          <h2 className="mt-12 font-display text-xl font-semibold text-ink">After it's over</h2>
          <p className="mt-3 leading-relaxed text-slate">
            The placement itself is only half the value — what you write
            down afterward is what actually informs your next decision. Use
            the reflection log from the documents page to capture what
            surprised you, what you'd want more of, and what you'd want to
            avoid.
          </p>

          <div className="mt-10">
            <Callout label="Tip">
              A placement that confirms a job isn't for you is just as
              useful as one that confirms it is. Both are progress.
            </Callout>
          </div>
        </div>
      </section>

      <StageNav
        prev={{ to: nav[1].to, label: nav[1].label }}
        next={{ to: nav[3].to, label: nav[3].label }}
      />
    </>
  );
}
