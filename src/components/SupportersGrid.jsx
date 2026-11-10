import { site } from "../config/site";
import Reveal from "./Reveal";

// Each logo sits in a fixed-height cell so the whole row shares one
// centreline. Per-logo `height` (see site.js) balances wide wordmarks
// against compact emblems; `max-w-full` keeps wide ones inside narrow
// phone columns.
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
        <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
          {site.supporters.map((s, i) => {
            const img = (
              <img
                src={s.src}
                alt={s.name}
                loading="lazy"
                className="w-auto max-w-full object-contain"
                style={{ height: s.height ?? 40 }}
              />
            );
            const cell = "flex h-20 items-center";
            return (
              <Reveal key={s.name} delay={i * 60}>
                {s.href ? (
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`${cell} opacity-90 transition-opacity hover:opacity-100`}
                  >
                    {img}
                  </a>
                ) : (
                  <div className={cell}>{img}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
