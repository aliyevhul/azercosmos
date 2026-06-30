import { Check } from "lucide-react";

export default function Checklist({ items }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 rounded-xl border border-paper-line bg-paper p-4">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
            <Check size={13} strokeWidth={3} />
          </span>
          <span className="text-[15px] leading-snug text-ink">{item}</span>
        </li>
      ))}
    </ul>
  );
}
