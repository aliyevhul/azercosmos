# Career Passport

An English-language career-orientation site for students, built to match
the layout and visual structure of [bwp-nrw.de](https://bwp-nrw.de/):
white header with color-coded section buttons, a dark hero with a bold
headline and photo, an "initiative of" partner band, a "supported by"
logo grid, and icon-card content sections on each stage page.

This is an original build — the code, copy, and any photos are new (the
hero photo is a placeholder you fill in yourself, since reusing a stock
photo of real people would raise its own rights issues). Only the layout,
structure, and six-section color scheme were used as a starting point;
no text or logos were copied from bwp-nrw.de.

## Run it locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

Outputs a static site into `dist/` — deploy it to Vercel, Netlify, GitHub
Pages, Cloudflare Pages, or any static host.

## Making it yours

**`src/config/site.js`**
- `name`, `taglineWords` — site name and the three-word tagline under the logo
- `logoSrc` — path to your logo (see below)
- `nav` — the six sections, each with a `color` token (`stage-1` … `stage-6`)
- `initiativePartners`, `supporters` — the two logo strips on the homepage
  (currently filled with placeholder boxes so the layout previews fully —
  swap these out first)

**Your logo**
1. Drop your logo file into `public/logo/`
2. Set `logoSrc` in `site.js` to its path. Until then, the navbar shows a
   text wordmark + tagline placeholder.

**Your photos**
The hero sections (`src/components/Hero.jsx`) currently show a dashed
placeholder box. Replace the placeholder markup with an `<img>` once you
have your own photo — using a real photo of real people requires their
permission, so this is left for you to fill in deliberately rather than
auto-filled with a stock image.

**Colors**
All six section colors, plus the navy/dark-hero tones, live in
`src/index.css` under `@theme`. Each stage's color is referenced via a
token (`stage-1` … `stage-6`) in `src/config/colors.js` — change the hex
value in `index.css` and it updates everywhere that stage is used (nav
button, page hero, cards, links).

**Your PDFs**
Drop files into `public/documents/` and list them in
`src/data/documents.js`.

**Page copy and cards**
Each stage page in `src/pages/` builds its topic cards (`TopicCard` +
`CategoryRow`) and supporting content directly in JSX — edit titles,
icons (from `lucide-react`), and paragraph text there.

## Project structure

```
src/
  components/   Navbar, Footer, Hero, PageHero, PartnerBand,
                SupportersGrid, CategoryRow, TopicCard, StageNav,
                Checklist, Callout, Layout
  pages/        Home + the six stage pages
  config/       site.js (content/branding) + colors.js (stage color map)
  data/         documents.js — the downloadable file list
public/
  logo/         your logo + partner/supporter logo files
  documents/    your PDF files
```

## Tech stack

React 19, React Router 7, Vite, Tailwind CSS v4 (CSS-based config — see
`src/index.css`), lucide-react for icons.

