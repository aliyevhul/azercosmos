import { ArrowRight } from "lucide-react";
import { stageClasses } from "../config/colors";

export default function TopicCard({ icon: Icon, title, href, color = "stage-2" }) {
  const c = stageClasses[color];
  return (
    <a
      href={href}
      className="flex items-center justify-between gap-4 rounded-xl bg-card p-6 transition-colors hover:bg-card-icon"
    >
      <div>
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">{title}</h3>
        <span className={`mt-2 inline-flex items-center gap-1.5 font-display text-sm font-medium ${c.text}`}>
          View now
          <ArrowRight size={14} />
        </span>
      </div>
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-card-icon">
        <Icon size={26} strokeWidth={1.5} className="text-ink" />
      </span>
    </a>
  );
}
