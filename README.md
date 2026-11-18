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
server/              shared code: database, sessions, password hashing
public/login.html    the sign-in page
src/pages/Admin.jsx  the admin panel
src/auth/            checks the session in the browser, Log out
```

The database tables (`app_users`, `app_login_failures`) are created
automatically the first time the API runs.

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
(route: `/privacy-policy`, linked from the footer). It's a general-purpose
template written for a static, student-facing site — review it with a
qualified lawyer before publishing, especially given the site's student
audience, and update the sections on analytics/cookies once you know
exactly what tools (if any) will run on the deployed site.

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
                Checklist, Callout, Layout, AccountBar
  pages/        Home + the six stage pages, Admin
  auth/         session check in the browser
  config/       site.js (content/branding) + colors.js (stage color map)
  data/         documents.js — the downloadable file list
public/
  login.html    the sign-in page
  logo/         your logo + partner/supporter logo files
  documents/    your PDF files
api/            backend endpoints (Vercel Functions)
server/         backend shared code (database, sessions, passwords)
middleware.js   sign-in check in front of every page and file
scripts/        local-server.mjs — run the full site with login locally
```

## Tech stack

React 19, React Router 7, Vite, Tailwind CSS v4 (CSS-based config — see
`src/index.css`), lucide-react for icons. Backend: Vercel Functions and
Routing Middleware, Postgres via `pg`, sessions via `jose`.

