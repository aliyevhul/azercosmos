import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Stamp from "./Stamp";

export default function StageCard({ to, number, label, title, description, tone = "brass" }) {
  return (
    <Link
      to={to}
      className="group relative flex gap-5 rounded-2xl border border-paper-line bg-paper p-6 transition-all hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-[0_8px_24px_-12px_rgba(20,35,61,0.25)] md:p-7"
    >
      <Stamp number={number} label={label} tone={tone} size={68} className="mt-1" />
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-slate">{description}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-medium text-ink">
          Open this stage
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
