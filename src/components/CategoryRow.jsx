import { Children } from "react";
import Reveal from "./Reveal";

export default function CategoryRow({ label, children }) {
  return (
    <Reveal as="div" className="grid gap-5 md:grid-cols-[220px_1fr] md:items-stretch">
      <div className="flex items-center justify-center rounded-xl bg-card px-6 py-8 text-center md:py-0">
        <h2 className="font-display text-xl font-semibold text-ink">{label}</h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {Children.map(children, (child, i) => (
          <Reveal delay={i * 90}>{child}</Reveal>
        ))}
      </div>
    </Reveal>
  );
}
