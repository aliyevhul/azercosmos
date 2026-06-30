// ─────────────────────────────────────────────────────────────────────────
// SITE CONFIG
// Everything here is what you'll want to change first: organization name,
// logo, contact details, and the partner/supporter logos.
// ─────────────────────────────────────────────────────────────────────────

export const site = {
  name: "CAREER GUIDANCE",
  // Three-part tagline shown under the logo, each word in its own accent
  // color — matches the original's "meine Stärken meine Wege meine Ziele"
  // treatment. Replace freely; keep 3 short phrases for the same effect.
  taglineWords: ["my strengths", "my path", "my goals"],

  // Path to your logo file. Drop your own file into /public/logo/
  // and point this at it, e.g. "/logo/your-logo.svg"
  logoSrc: null, // null = use the built-in monogram placeholder instead

  organization: "Your Organization Name",
  contactEmail: "hello@example.org",

  legalLinks: [
    { label: "Imprint", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],

  // The "is an initiative of" band — usually the organization(s) that
  // own/publish the site. 1-3 logos works best. Files go in /public/logo/
  // These are placeholders so the layout previews correctly — replace with
  // your own logo file(s) (use a light/white version, since this band has
  // a dark navy background).
  initiativePartners: [
    { name: "Partner Logo 1", src: "/logo/initiative-1.svg", href: "#" },
    { name: "Partner Logo 2", src: "/logo/initiative-2.svg", href: "#" },
  ],

  // The "supported by" grid further down — sponsors, partner employers, etc.
  // Placeholders below; replace with your own logo files.
  supporters: [
    { name: "Logo 1", src: "/logo/supporter-1.svg", href: "#" },
    { name: "Logo 2", src: "/logo/supporter-2.svg", href: "#" },
    { name: "Logo 3", src: "/logo/supporter-3.svg", href: "#" },
    { name: "Logo 4", src: "/logo/supporter-4.svg", href: "#" },
    { name: "Logo 5", src: "/logo/supporter-5.svg", href: "#" },
    { name: "Logo 6", src: "/logo/supporter-6.svg", href: "#" },
    { name: "Logo 7", src: "/logo/supporter-7.svg", href: "#" },
    { name: "Logo 8", src: "/logo/supporter-8.svg", href: "#" },
  ],

  copyrightHolder: "Your Organization Name",

  // Hero photos shown next to the bold headline on each page. Drop your
  // own photos into /public/photos/ and point these at them, e.g.
  // "/photos/home-hero.jpg". Recommended size: at least 1200x800px,
  // landscape orientation — it's cropped to fill the box automatically.
  // Leave as null to show the "Add your own photo" placeholder.
  heroImages: {
    home: null,
    getStarted: null,
    potential: null,
    practicalPhases: null,
    training: null,
    documents: null,
    conclusion: null,
  },
};

// Main navigation — one entry per stage, each with its own accent color
// token (defined in src/index.css under @theme). Reorder, rename, recolor,
// or trim these and the navbar + homepage will follow.
export const nav = [
  { to: "/get-started", label: "Get Started", color: "stage-1" },
  { to: "/potential", label: "Potential", color: "stage-2" },
  { to: "/practical-phases", label: "Practical Phases", color: "stage-3" },
  { to: "/training", label: "Training", color: "stage-4" },
  { to: "/documents", label: "Documents", color: "stage-5" },
  { to: "/conclusion", label: "Conclusion", color: "stage-6" },
];
