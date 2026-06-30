import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function StageNav({ prev, next }) {
  return (
    <nav
      aria-label="Stage navigation"
      className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-10 sm:flex-row sm:items-center sm:justify-between md:px-8"
    >
      {prev ? (
        <Link
          to={prev.to}
          className="btn-pop inline-flex items-center gap-2 rounded-md px-3 py-2 font-display text-sm font-medium text-slate hover:text-ink"
        >
          <ArrowLeft size={16} />
          {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          to={next.to}
          className="btn-pop inline-flex items-center gap-2 rounded-md bg-stage-2 px-5 py-2.5 font-display text-sm font-semibold text-white hover:bg-stage-2/90"
        >
          {next.label}
          <ArrowRight size={16} />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
