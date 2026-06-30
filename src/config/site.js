// ─────────────────────────────────────────────────────────────────────────
// SITE CONFIG
// Everything here is what you'll want to change first: organization name,
// logo, contact details, and the partner/supporter logos in the footer.
// Nothing else in the codebase needs to change for a basic rebrand.
// ─────────────────────────────────────────────────────────────────────────

export const site = {
  // Shown in the navbar, browser tab, and footer
  name: "Career Passport",
  shortName: "Passport",

  // Used in the hero subtitle and footer
  tagline: "Your guided path from “what am I good at?” to “what’s next?”",

  // Path to your logo file. Drop your own file into /public/logo/
  // and point this at it, e.g. "/logo/your-logo.svg"
  logoSrc: null, // null = use the built-in stamp wordmark instead

  // Organization that runs/owns this site
  organization: "Your Organization Name",
  contactEmail: "hello@example.org",

  // Footer legal links — point these at real pages before you launch
  legalLinks: [
    { label: "Imprint", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],

  // Logos shown in the "Supported by" strip on the homepage footer.
  // Add your own partners here. Leave empty to hide the strip.
  // Each logo file should go in /public/logo/
  supporters: [
    // { name: "Partner Name", src: "/logo/partner-1.svg", href: "https://example.org" },
  ],

  copyrightHolder: "Your Organization Name",
};

// Main navigation — matches the six stages of the career journey.
// Reorder, rename, or trim these and the navbar + homepage will follow.
export const nav = [
  { to: "/get-started", label: "Get Started" },
  { to: "/potential", label: "Your Potential" },
  { to: "/practical-phases", label: "Practical Phases" },
  { to: "/training", label: "Training & Careers" },
  { to: "/documents", label: "Documents" },
  { to: "/conclusion", label: "Conclusion" },
];
