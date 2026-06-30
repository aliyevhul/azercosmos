import { site } from "../config/site";
import Reveal from "./Reveal";

export default function SupportersGrid() {
  if (site.supporters.length === 0) return null;

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <Reveal>
          <p className="mb-8 font-display text-lg font-medium text-ink">
            This website is supported by:
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
          {site.supporters.map((s, i) => (
            <Reveal key={s.name} delay={i * 60}>
              <a
                href={s.href ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center opacity-90 transition-opacity hover:opacity-100"
              >
                <img src={s.src} alt={s.name} className="h-10 w-auto" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
