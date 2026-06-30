import { site } from "../config/site";
import Reveal from "./Reveal";

export default function PartnerBand() {
  if (site.initiativePartners.length === 0) return null;

  return (
    <section className="bg-navy">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
        <Reveal>
          <p className="font-display text-lg font-medium text-white">
            This passport is an initiative of:
          </p>
        </Reveal>
        <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
          {site.initiativePartners.map((p, i) => (
            <Reveal key={p.name} delay={i * 100}>
              <a href={p.href ?? "#"} target="_blank" rel="noreferrer">
                <img src={p.src} alt={p.name} className="h-12 w-auto" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
