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
  logoSrc: "/logo/space-academy-logo.png",

  organization: "Space Academy",
  contactEmail: "Info.SpaceAcademy@azercosmos.az",

  legalLinks: [
    { label: "Imprint", href: "#" },
    { label: "Privacy Policy", href: "/privacy-policy" },
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

  copyrightHolder: "Space Academy",

  // Hero photos shown next to the bold headline on each page. Drop your
  // own photos into /public/photos/ and point these at them, e.g.
  // "/photos/home-hero.jpg". Recommended size: at least 1200x800px,
  // landscape orientation — it's cropped to fill the box automatically.
  // Leave as null to show the "Add your own photo" placeholder.
  // Each entry can also be { src, alt, position } — `position` is a CSS
  // object-position that keeps faces in frame when the photo is cropped.
  //
  // Current photos are from Unsplash (free to use under the Unsplash
  // License, no attribution required):
  //   home        https://unsplash.com/photos/iQPr1XkF5F0
  //   practical   https://unsplash.com/photos/yEgqA9WydWU
  //   training    https://unsplash.com/photos/r-W9R70iY5c
  //   conclusion  https://unsplash.com/photos/138SbPvRzaQ
  //   getStarted  https://unsplash.com/photos/8VRfnLvCryY
  //   documents   https://unsplash.com/photos/n4_Q2dDYy80
  //   potential   supplied by the site owner
  heroImages: {
    home: {
      src: "/photos/home-hero.jpg",
      alt: "Students in a classroom, one standing with her textbooks and backpack",
      position: "center 35%",
    },
    getStarted: {
      src: "/photos/get-started-hero.jpg",
      alt: "Teenage students sitting around a table, listening during a class session",
      position: "center",
    },
    potential: {
      src: "/photos/potential-hero.jpg",
      alt: "Pupils gathered around a table watching a hands-on science experiment",
      position: "center 35%",
    },
    practicalPhases: {
      src: "/photos/practical-hero.jpg",
      alt: "A young student doing a lab experiment alongside a mentor",
      position: "center 35%",
    },
    training: {
      src: "/photos/training-hero.jpg",
      alt: "A student with a laptop talking with an advisor",
      position: "center 35%",
    },
    documents: {
      src: "/photos/documents-hero.jpg",
      alt: "A student in a suit reviewing documents in his folder",
      position: "center 30%",
    },
    conclusion: {
      src: "/photos/conclusion-hero.jpg",
      alt: "Graduating students throwing their caps into the air",
      position: "center 40%",
    },
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
