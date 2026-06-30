// ─────────────────────────────────────────────────────────────────────────
// DOCUMENTS
// Each entry is one downloadable file on the Documents page.
//
// To add your own:
//   1. Drop the PDF into /public/documents/
//   2. Add an entry below pointing `file` at it, e.g. "/documents/my-form.pdf"
//
// `category` groups documents under a heading on the page — use whatever
// categories make sense for your organization.
// ─────────────────────────────────────────────────────────────────────────

export const documents = [
  {
    category: "Getting started",
    items: [
      {
        title: "Career Guidance — overview sheet",
        description: "A one-page summary of how the passport works and what to fill in at each stage.",
        file: "/documents/placeholder.pdf",
        sizeLabel: "PDF",
      },
    ],
  },
  {
    category: "Self-assessment",
    items: [
      {
        title: "Strengths & interests worksheet",
        description: "A short worksheet to capture what you're good at and what you enjoy.",
        file: "/documents/placeholder.pdf",
        sizeLabel: "PDF",
      },
    ],
  },
  {
    category: "Work experience",
    items: [
      {
        title: "Internship reflection log",
        description: "A page to fill in after each work-experience placement.",
        file: "/documents/placeholder.pdf",
        sizeLabel: "PDF",
      },
      {
        title: "Employer feedback form",
        description: "Hand this to a supervisor to get written feedback on a placement.",
        file: "/documents/placeholder.pdf",
        sizeLabel: "PDF",
      },
    ],
  },
];
