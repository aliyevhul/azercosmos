export default function Callout({ label = "Tip", children }) {
  return (
    <div className="rounded-xl border-l-4 border-stamp bg-stamp/5 px-5 py-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stamp">{label}</p>
      <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{children}</p>
    </div>
  );
}
