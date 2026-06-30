// The site's signature element: a passport-style ink stamp.
// Used on the hero, on stage cards, and to mark completed sections.
// `tone` switches the ink color; `label` is the small curved text inside.

const tones = {
  brass: { ring: "var(--color-brass)", text: "var(--color-brass)" },
  stamp: { ring: "var(--color-stamp)", text: "var(--color-stamp)" },
  forest: { ring: "var(--color-forest)", text: "var(--color-forest)" },
};

export default function Stamp({ number, label, tone = "brass", size = 88, className = "" }) {
  const c = tones[tone] ?? tones.brass;
  const id = `stamp-arc-${number ?? label ?? "x"}`;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      role="img"
      aria-label={label ? `Stage ${number}: ${label}` : `Stage ${number}`}
    >
      <defs>
        <path id={id} d="M 16,60 A 44,44 0 1,1 104,60" fill="none" />
      </defs>
      <circle cx="60" cy="60" r="52" fill="none" stroke={c.ring} strokeWidth="2" strokeDasharray="2 4" opacity="0.55" />
      <circle cx="60" cy="60" r="44" fill="none" stroke={c.ring} strokeWidth="2.5" />
      <text fill={c.text} fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2">
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
          {(label ?? "").toUpperCase()}
        </textPath>
      </text>
      <text
        x="60"
        y="70"
        textAnchor="middle"
        fill={c.text}
        fontFamily="Space Grotesk, sans-serif"
        fontWeight="700"
        fontSize="34"
      >
        {number}
      </text>
    </svg>
  );
}
