import { site } from "../config/site";

export default function Footer() {
  return (
    <footer className="bg-navy">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p>
          © {new Date().getFullYear()} {site.copyrightHolder}
        </p>
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {site.legalLinks.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="hover:text-white">
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${site.contactEmail}`} className="hover:text-white">
              {site.contactEmail}
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
