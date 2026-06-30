import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { site, nav } from "../config/site";
import { stageClasses } from "../config/colors";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const tagColors = ["text-stage-2", "text-stage-3", "text-stage-1"];

  return (
    <header className="border-b border-black/5 bg-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 md:px-8">
        <Link to="/" className="flex flex-col" onClick={() => setOpen(false)}>
          {site.logoSrc ? (
            <img src={site.logoSrc} alt={site.name} className="h-10 w-auto" />
          ) : (
            <>
              <span className="font-display text-xl font-bold tracking-tight text-ink">
                {site.name}
              </span>
              <span className="font-display text-xs font-medium tracking-wide text-slate">
                {site.taglineWords.map((w, i) => (
                  <span key={w} className={i > 0 ? "ml-1" : ""}>
                    <span className={tagColors[i % tagColors.length]}>{w}</span>
                  </span>
                ))}
              </span>
            </>
          )}
        </Link>

        <nav className="hidden lg:block">
          <ul className="flex items-center gap-2">
            {nav.map((item) => {
              const c = stageClasses[item.color];
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `btn-pop inline-flex items-center rounded-md px-5 py-2.5 font-display text-sm font-semibold text-white transition-opacity ${c.bg} ${
                        isActive ? "opacity-100 ring-2 ring-offset-2 ring-black/10" : "opacity-90 hover:opacity-100"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          className="rounded-md p-2 text-ink hover:bg-card lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-black/5 bg-paper lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-4">
            {nav.map((item) => {
              const c = stageClasses[item.color];
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`btn-pop block rounded-md px-4 py-2.5 text-center font-display text-sm font-semibold text-white ${c.bg}`}
                  >
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
