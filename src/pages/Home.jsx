import Hero from "../components/Hero";
import PartnerBand from "../components/PartnerBand";
import SupportersGrid from "../components/SupportersGrid";
import Reveal from "../components/Reveal";
import { site } from "../config/site";

export default function Home() {
  return (
    <>
      <Hero lines={["YOUR", "FUTURE", "STARTS", "NOW!"]} image={site.heroImages.home} />

      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-20">
          <Reveal as="h1" className="font-display text-2xl font-semibold text-ink md:text-3xl">
            Welcome to {site.name}!
          </Reveal>
          <Reveal delay={100} as="p" className="mt-5 text-lg leading-relaxed text-slate">
            Alongside any career materials you already have, you'll find the most
            important information and content here to support you in
            choosing a career. Discover your strengths, explore exciting
            career fields, and find out which path fits you best.
          </Reveal>
          <Reveal delay={200} as="p" className="mt-5 font-display text-lg font-semibold text-ink">
            Have fun, and good luck!
          </Reveal>
        </div>
      </section>

      <PartnerBand />
      <SupportersGrid />
    </>
  );
}
