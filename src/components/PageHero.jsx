import Stamp from "./Stamp";

export default function PageHero({ number, eyebrow, title, intro, tone = "brass" }) {
  return (
    <section className="border-b border-paper-line bg-paper-dim">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-14 md:flex-row md:items-center md:gap-10 md:px-8 md:py-20">
        <Stamp number={number} label={eyebrow} tone={tone} size={104} />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-slate">
            Stage {number} of 6 · {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate">{intro}</p>
        </div>
      </div>
    </section>
  );
}
