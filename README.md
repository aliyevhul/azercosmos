# Career Guidance

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

`npm run dev` skips the login (you're treated as a pretend admin) so you
can work on the pages without a database. To run the real thing with the
login wall and admin panel, see [Testing the login locally](#testing-the-login-locally).

## Build for production

```bash
npm run build
```

The site is hosted on Vercel. Besides the static pages in `dist/`, it now
has a small backend (Vercel Functions in `api/` plus `middleware.js`) and a
Postgres database for accounts, so it needs Vercel (or a host with the same
features) rather than a plain static host.

## Login and admin panel

Every page, image bundle and PDF is behind a sign-in. Accounts are created
by the Space Academy in the admin panel; there is no public sign-up.

- **`/login`** — sign-in page (`public/login.html`, standalone so nothing of
  the site loads before sign-in).
- **`/admin`** — admins only. Add one account, paste a whole list of
  students (`email, name, password` per line — passwords are generated
  when left out, and the result can be downloaded as a CSV), reset
  passwords, change roles, disable or delete accounts.
- **Roles** — `student` can view the site; `admin` can also manage accounts.
- Disabling an account, resetting its password or changing its role signs
  that person out immediately.
- Passwords are stored as scrypt hashes, so nobody (admins included) can
  read them later. Sessions are a signed, HttpOnly cookie valid for 7 days
  and renewed while the person keeps using the site.
- After 8 wrong passwords for an email (or 30 from one network) sign-in is
  paused for 15 minutes.

### How it fits together

```
middleware.js        runs before every page/file: no valid session → /login,
                     non-admins → away from /admin
api/auth/login.js    POST  sign in, sets the session cookie
api/auth/logout.js   POST  sign out
api/auth/me.js       GET   who am I (checks the account is still active)
api/admin/users.js   GET/POST/PATCH/DELETE  account management (admins only)
api/worksheets.js    GET/PUT  load and save worksheet answers, progress
api/admin/progress.js GET   every student's progress (admins only)
server/              shared code: database, sessions, password hashing
public/login.html    the sign-in page
src/pages/Admin.jsx  the admin panel
src/auth/            checks the session in the browser, Log out
```

The database tables (`app_users`, `app_login_failures`,
`app_worksheet_answers`) are created automatically the first time the API
runs. Deleting an account also deletes that student's answers.

### Setting it up on Vercel (once)

1. **Database.** In the Vercel project, open **Storage → Create Database →
   Neon (Postgres)**, choose the **Frankfurt (eu-central-1)** region, and
   connect it to this project for all environments. This adds
   `DATABASE_URL` automatically. (The API runs in Frankfurt too — see
   `regions` in `vercel.json`.)
2. **First admin.** In **Settings → Environment Variables**, add:

   | Name | Value |
   | --- | --- |
   | `ADMIN_EMAIL` | the email the first admin will sign in with |
   | `ADMIN_PASSWORD` | their password (at least 8 characters) |
   | `AUTH_SECRET` | optional — a random string of 32+ characters used to sign sessions. If left out, a key is derived from `DATABASE_URL`. |

   The first admin is created the first time someone opens the site after
   deploying, and only while there is no admin yet. After signing in,
   change that password from the admin panel, and you can then delete
   `ADMIN_PASSWORD` from Vercel.
3. **Redeploy** (Deployments → ⋯ → Redeploy) so the new variables are used.

Until `DATABASE_URL` is set the site stays locked and the sign-in page
answers "The login system isn't set up yet", so set up the database before
this goes to production.

### Testing the login locally

You need a Postgres database (a local one, or a free Neon branch):

```bash
npm run build
DATABASE_URL=postgres://user:pass@localhost:5432/dbname \
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=change-me-123 \
npm run serve:local
```

Then open http://localhost:3000. `scripts/local-server.mjs` serves the
built site the way Vercel does (middleware, API functions, clean URLs).

## Worksheets (fill in online)

The worksheets open inside the site at `/worksheets/<id>` instead of being
downloaded. Each page is shown as an image with typing boxes and tick boxes
placed over its blanks; answers save to the student's account as they type.
There is no download or print button, and the PDFs themselves aren't
published (they live in `worksheets/source/`, outside `public/`).

- **Students** see "x/y filled" on every worksheet and their overall
  progress on the Documents page.
- **Admins** get a **Progress** tab next to Accounts (`/admin/progress`):
  every student × every worksheet as a percentage, downloadable as CSV.
  Clicking a percentage opens that student's worksheet read-only.
- Documents with nothing to fill in (overviews, "at a glance" pages) open
  read-only.

Blocking downloads is a deterrent, not a lock: anyone who can view a page
can still take a screenshot of it.

**Adding or changing a worksheet**

```bash
pip install pymupdf opencv-python-headless numpy
# put the PDF in worksheets/source/  (file name without .pdf = its id)
python3 scripts/worksheets/build.py --preview
```

`build.py` renders each page to `public/worksheet-pages/<id>/<n>.webp`,
finds the blanks (writing lines, empty boxes and table cells, small
squares, speech bubbles) and writes `shared/worksheet-fields.js`.
`--preview` writes overlay images to `.worksheet-preview/` so you can check
every field (orange = line, green = box, purple = tick box). Fix anything
it gets wrong in `scripts/worksheets/overrides.json` — skip a page, remove
a field by id, or add one in PDF points. Then add the document to
`src/data/documents.js`.

Answers are stored per field id. Once students have started a worksheet,
check `git diff shared/worksheet-fields.js` after a rebuild: if a field's
id changes, answers saved under the old id are no longer shown.

## Making it yours

**`src/config/site.js`**
- `name`, `taglineWords` — site name and the three-word tagline under the logo
- `logoSrc` — path to your logo (see below)
- `nav` — the six sections, each with a `color` token (`stage-1` … `stage-6`)
- `initiativePartners`, `supporters` — the two logo strips on the homepage.
  `supporters` holds the real partner logos (files in
  `public/logo/supporters/`, each with a display `height` that balances
  wide wordmarks against compact emblems). `initiativePartners` is empty,
  which hides the navy "initiative of" band — add a light/white logo
  there to bring it back.

**Your logo**
1. Drop your logo file into `public/logo/`
2. Set `logoSrc` in `site.js` to its path. Currently set to the Space
   Academy logo (`/logo/space-academy-logo.png`) — it appears next to the
   "Career Guidance" wordmark in the navbar. Replace the file (and update
   `organization` in `site.js`) to rebrand.

**Privacy Policy**
A full Privacy Policy page lives at `src/pages/PrivacyPolicy.jsx`
(route: `/privacy-policy`, linked from the footer). It describes the
accounts, saved worksheet answers, the sign-in cookie and where data is
stored — review it with a qualified lawyer before students use the site,
especially given that some may be minors.

**Your photos**
Each page's hero photo is a config slot, just like the logo and PDFs.
Drop your photos into `public/photos/`, then point `heroImages` in
`src/config/site.js` at them — e.g. `home: "/photos/home-hero.jpg"`.
Recommended size: at least 1200×800px, landscape orientation — it's
cropped automatically to fill the box (≈420×288px on the homepage,
≈420×192px on stage pages, both at desktop width). Leave a slot `null`
to keep the "Add your own photo" placeholder. A slot can also be an
object — `{ src, alt, position }` — where `position` is a CSS
object-position such as `"center 30%"` that keeps faces in frame after
cropping. The current photos are free Unsplash photos; their source
links are listed next to `heroImages` in `site.js`.

**Colors**
All six section colors, plus the navy/dark-hero tones, live in
`src/index.css` under `@theme`. Each stage's color is referenced via a
token (`stage-1` … `stage-6`) in `src/config/colors.js` — change the hex
value in `index.css` and it updates everywhere that stage is used (nav
button, page hero, cards, links).

**Your PDFs**
See [Worksheets](#worksheets-fill-in-online) above.

**Page copy and cards**
Each stage page in `src/pages/` builds its topic cards (`TopicCard` +
`CategoryRow`) and supporting content directly in JSX — edit titles,
icons (from `lucide-react`), and paragraph text there.

## Project structure

```
src/
  components/   Navbar, Footer, Hero, PageHero, PartnerBand,
                SupportersGrid, CategoryRow, TopicCard, StageNav,
                Checklist, Callout, Layout, AccountBar, AdminTabs,
                DocumentCard
  pages/        Home + the six stage pages, Worksheet, Admin, AdminProgress
  auth/         session check in the browser
  worksheets/   worksheet API calls and progress helpers
  config/       site.js (content/branding) + colors.js (stage color map)
  data/         documents.js — the document list
public/
  login.html    the sign-in page
  logo/         your logo + partner/supporter logo files
  worksheet-pages/  page images of each worksheet (generated)
worksheets/source/  the original PDFs (not published)
shared/         worksheet-fields.js — field positions (generated)
api/            backend endpoints (Vercel Functions)
server/         backend shared code (database, sessions, passwords)
middleware.js   sign-in check in front of every page and file
scripts/        local-server.mjs — run the full site with login locally
                worksheets/build.py — turn PDFs into pages + fields
```

## Tech stack

React 19, React Router 7, Vite, Tailwind CSS v4 (CSS-based config — see
`src/index.css`), lucide-react for icons. Backend: Vercel Functions and
Routing Middleware, Postgres via `pg`, sessions via `jose`.

