import { ImagePlus } from "lucide-react";

// `bgClass` lets stage pages tint the hero with their own accent color
// instead of the homepage's near-black. `lines` is an array of words/short
// phrases stacked vertically in the marker font, mirroring the original's
// big handwritten-style headline treatment.
export default function Hero({ lines, accentIndex = -1, bgClass = "bg-hero-dark", compact = false }) {
  return (
    <section className={`${bgClass} relative overflow-hidden`}>
      <div
        className={`mx-auto flex max-w-7xl flex-col items-center gap-8 px-5 md:flex-row md:items-center md:gap-10 md:px-8 ${
          compact ? "py-10 md:py-14" : "py-14 md:py-20"
        }`}
      >
        <h1 className={`font-marker leading-[1.15] text-white ${compact ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl"}`}>
          {lines.map((line, i) => (
            <span key={line} className={`block ${i === accentIndex ? "text-lime" : ""}`}>
              {line}
            </span>
          ))}
        </h1>

        <div
          className={`torn-edge flex w-full shrink-0 items-center justify-center bg-white/10 md:w-[420px] ${
            compact ? "h-40 md:h-48" : "h-56 md:h-72"
          }`}
        >
          <div className="flex flex-col items-center gap-2 text-white/50">
            <ImagePlus size={32} strokeWidth={1.5} />
            <span className="font-display text-xs">Add your own photo</span>
          </div>
        </div>
      </div>
    </section>
  );
}
