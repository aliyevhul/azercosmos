import { site } from "../config/site";

export default function Footer() {
  return (
    <footer className="border-t border-paper-line bg-ink text-paper">
      {site.supporters.length > 0 && (
        <div className="border-b border-white/10">
          <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-brass-light">
              Supported by
            </p>
            <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
              {site.supporters.map((s) => (
                <a
                  key={s.name}
                  href={s.href ?? "#"}
                  className="opacity-80 transition-opacity hover:opacity-100"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={s.src} alt={s.name} className="h-7 w-auto" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-sm text-paper/70 md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          © {new Date().getFullYear()} {site.copyrightHolder}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {site.legalLinks.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="hover:text-paper">
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${site.contactEmail}`} className="hover:text-paper">
              {site.contactEmail}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
