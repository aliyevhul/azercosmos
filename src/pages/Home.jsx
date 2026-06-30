import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Stamp from "../components/Stamp";
import StageCard from "../components/StageCard";
import { site } from "../config/site";

const stages = [
  {
    to: "/get-started",
    number: 1,
    label: "Get Started",
    title: "Get started",
    description:
      "Understand how the passport works, what you'll fill in, and why each stage builds on the last.",
    tone: "brass",
  },
  {
    to: "/potential",
    number: 2,
    label: "Potential",
    title: "Discover your potential",
    description:
      "Map out what you're already good at and what you enjoy, before worrying about job titles.",
    tone: "stamp",
  },
  {
    to: "/practical-phases",
    number: 3,
    label: "Practice",
    title: "Practical phases",
    description:
      "Try things out in the real world — internships, work experience, and job shadowing.",
    tone: "forest",
  },
  {
    to: "/training",
    number: 4,
    label: "Training",
    title: "Training & careers",
    description:
      "Compare apprenticeships, vocational training, and study routes once you know what fits.",
    tone: "brass",
  },
  {
    to: "/documents",
    number: 5,
    label: "Documents",
    title: "Documents",
    description:
      "Worksheets, forms, and checklists you can download, print, and keep with your passport.",
    tone: "stamp",
  },
  {
    to: "/conclusion",
    number: 6,
    label: "Conclusion",
    title: "Conclusion",
    description:
      "Pull everything together into a plan, and know what your next concrete step is.",
    tone: "forest",
  },
];

export default function Home() {
  return (
    <>
      <section className="overflow-hidden border-b border-paper-line bg-paper-dim">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-8 md:py-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-stamp">
              Career orientation, stage by stage
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
              Find out what fits —<br className="hidden md:block" /> one stage at a time.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">
              {site.tagline} Work through six short stages, collect a stamp for
              each one, and end up with a real plan instead of a guess.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/get-started"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-display text-sm font-semibold text-paper transition-colors hover:bg-ink-light"
              >
                Start with stage one
                <ArrowRight size={16} />
              </Link>
              <a
                href="#journey"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-display text-sm font-semibold text-ink underline decoration-paper-line decoration-2 underline-offset-4 hover:decoration-ink"
              >
                See all six stages
              </a>
            </div>
          </div>

          <div className="relative mx-auto flex h-64 w-64 items-center justify-center md:h-80 md:w-80">
            <div className="absolute inset-0 rounded-full border border-paper-line" />
            <div className="absolute inset-6 rounded-full border border-dashed border-paper-line" />
            <Stamp number={1} label="Get Started" tone="stamp" size={180} />
          </div>
        </div>
      </section>

      <section id="journey" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            The six stages
          </h2>
          <p className="mt-3 text-slate">
            Each stage stands on its own, but they're designed to be worked
            through in order — start at stage one and follow the thread
            through to a plan you can act on.
          </p>
        </div>

        <div className="relative mt-10 grid gap-5 md:grid-cols-2">
          {stages.map((s) => (
            <StageCard key={s.to} {...s} />
          ))}
        </div>
      </section>

      <section className="border-t border-paper-line bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-paper md:text-3xl">
              Ready to get your first stamp?
            </h2>
            <p className="mt-2 max-w-md text-paper/70">
              Stage one takes about ten minutes and sets up everything that
              follows.
            </p>
          </div>
          <Link
            to="/get-started"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brass px-6 py-3 font-display text-sm font-semibold text-ink transition-colors hover:bg-brass-light"
          >
            Start with stage one
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
