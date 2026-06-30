# Career Passport

An English-language career-orientation site for students, inspired by the
stage-based structure of [bwp-nrw.de](https://bwp-nrw.de/): six guided
stages from "get started" through to a personal plan. Built as a clean
React + Vite + Tailwind project so you can run it yourself and reshape it
into your own organization's site.

This is an original build — the design, copy, and code are new. Nothing
here was copied from bwp-nrw.de; only the general concept (a multi-stage
career-orientation journey for students) and the six-section structure
were used as a starting point.

## Run it locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
```

This outputs a static site into `dist/`. Deploy `dist/` to any static
host — Netlify, Vercel, GitHub Pages, Cloudflare Pages, your own server,
etc. There's no backend; it's all static HTML/CSS/JS.

## Making it yours

Everything you're likely to want to change first lives in one place:

**`src/config/site.js`**
- `name` — the site name shown in the navbar and tab title
- `logoSrc` — path to your logo (see below)
- `organization`, `contactEmail` — footer details
- `legalLinks` — imprint / privacy policy links
- `supporters` — partner/sponsor logos shown in the footer

**Your logo**
1. Drop your logo file into `public/logo/` (e.g. `public/logo/logo.svg`)
2. In `src/config/site.js`, set `logoSrc: "/logo/logo.svg"`
3. Until you do this, the navbar shows a simple "CP" monogram placeholder

**Your PDFs / documents**
1. Drop PDF files into `public/documents/`
2. Edit `src/data/documents.js` — each entry has a `title`, `description`,
   and `file` path pointing at your PDF. Group them under `category`
   headings however makes sense for you.
3. A placeholder PDF is included so the links work out of the box —
   replace it with real files before launch.

**Colors and fonts**

All design tokens live in `src/index.css` under the `@theme` block at the
top — color values (`--color-ink`, `--color-brass`, etc.) and font
families. Change a value there and it updates everywhere, since every
component uses these tokens rather than hardcoded colors.

**Page copy**

Each stage is its own file in `src/pages/` (`GetStarted.jsx`,
`Potential.jsx`, `PracticalPhases.jsx`, `Training.jsx`, `Documents.jsx`,
`Conclusion.jsx`) plus `Home.jsx` for the landing page. The text is plain
JSX — edit it directly. The navigation labels themselves come from the
`nav` array in `src/config/site.js`.

**Adding, removing, or reordering stages**

Update the `nav` array in `src/config/site.js`, the `stages` array in
`src/pages/Home.jsx`, the routes in `src/App.jsx`, and the `prev`/`next`
props passed to `<StageNav />` at the bottom of each page.

## Project structure

```
src/
  components/   Navbar, Footer, Layout, Stamp (signature graphic),
                PageHero, StageCard, StageNav, Checklist, Callout
  pages/        Home + the six stage pages
  config/       site.js — the file you'll edit most
  data/         documents.js — the downloadable file list
public/
  logo/         put your logo file(s) here
  documents/    put your PDF file(s) here
```

## Tech stack

React 19, React Router 7, Vite, Tailwind CSS v4 (CSS-based config — see
`src/index.css`, no `tailwind.config.js` needed), lucide-react for icons.
