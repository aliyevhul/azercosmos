export default function Callout({ label = "Tip", children }) {
  return (
    <div className="rounded-xl border-l-4 border-stage-4 bg-stage-4/5 px-5 py-4">
      <p className="font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-stage-4">
        {label}
      </p>
      <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{children}</p>
    </div>
  );
}
