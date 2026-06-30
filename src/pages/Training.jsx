import { Hammer, GraduationCap, Layers } from "lucide-react";
import PageHero from "../components/PageHero";
import CategoryRow from "../components/CategoryRow";
import TopicCard from "../components/TopicCard";
import Callout from "../components/Callout";
import StageNav from "../components/StageNav";
import { nav } from "../config/site";

const routes = [
  {
    title: "Apprenticeship / vocational training",
    description:
      "Learn on the job while earning a wage, usually combined with part-time classroom study. Best if you learn well by doing and want to start earning sooner.",
  },
  {
    title: "Further or higher education",
    description:
      "Full-time study toward a qualification before entering the workforce. Best if your target field requires a specific degree or you want more time to explore.",
  },
  {
    title: "Dual study programs",
    description:
      "A hybrid: study and on-the-job training run in parallel with a single employer. Best if you want a degree without stepping away from paid work.",
  },
];

export default function Training() {
  return (
    <>
      <PageHero lines={["FIND", "YOUR", "ROUTE IN!"]} accentIndex={2} color="stage-4" />

      <section className="bg-paper pt-14 md:pt-16">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <CategoryRow label="Routes into work">
            <TopicCard icon={Hammer} title="Apprenticeships" href="#routes" color="stage-4" />
            <TopicCard icon={GraduationCap} title="Further education" href="#routes" color="stage-4" />
            <TopicCard icon={Layers} title="Dual study programs" href="#routes" color="stage-4" />
          </CategoryRow>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-20">
          <p className="text-lg leading-relaxed text-slate">
            Once you have a clearer sense of direction, compare how people
            actually get into that field — there's usually more than one
            route in.
          </p>

          <h2 id="routes" className="mt-10 font-display text-xl font-semibold text-ink">Common routes</h2>
          <div className="mt-6 space-y-4">
            {routes.map((r) => (
              <div key={r.title} className="rounded-xl bg-card p-6">
                <h3 className="font-display text-base font-semibold text-ink">{r.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate">{r.description}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 font-display text-xl font-semibold text-ink">Questions to ask before choosing</h2>
          <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-slate">
            <li className="border-b border-black/5 pb-3">
              What entry requirements does this route actually have, and do you meet them?
            </li>
            <li className="border-b border-black/5 pb-3">
              How long until you're earning a full wage, and does that timeline work for you?
            </li>
            <li className="border-b border-black/5 pb-3">
              Is the qualification recognized by the employers you're interested in?
            </li>
            <li className="pb-1">
              What does someone two years into this route wish they'd known beforehand?
            </li>
          </ul>

          <div className="mt-10">
            <Callout label="Tip">
              Reach out to one person who's already on a route you're
              considering. A 15-minute conversation usually tells you more
              than an hour of reading.
            </Callout>
          </div>
        </div>
      </section>

      <StageNav
        prev={{ to: nav[2].to, label: nav[2].label }}
        next={{ to: nav[4].to, label: nav[4].label }}
      />
    </>
  );
}
