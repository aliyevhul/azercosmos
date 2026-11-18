// ─────────────────────────────────────────────────────────────────────────
// DOCUMENTS
// Organized by the page they belong to. Each stage page pulls its own
// section here; the central Documents page shows everything.
//
// Documents open inside the site (/worksheets/<id>) as page images with
// fill-in fields; the PDFs themselves are not published. To add one:
//   1. Put the PDF in /worksheets/source/ (its file name, without .pdf,
//      is the id)
//   2. Run `python3 scripts/worksheets/build.py --preview` and check the
//      detected fields (fix any in scripts/worksheets/overrides.json)
//   3. Add an entry in the relevant section below.
// ─────────────────────────────────────────────────────────────────────────

export const documentsByPage = {

  getStarted: [
    {
      title: "Icons & orientation guide",
      description: "The four career-orientation process icons and the four working-method icons explained — your key to reading every worksheet in this program.",
      id: "01-intro-icons-guide",
      pages: "pp. 1–2",
    },
    {
      title: "Welcome to your career orientation",
      description: "An overview of how the program works, what the Career Choice Pass folder contains, and your path into the professional future.",
      id: "02-welcome-career-orientation",
      pages: "pp. 3–4",
    },
  ],

  potential: [
    {
      title: "Self-perception & perception by others",
      description: "Worksheet for the positive-traits exercise: collect traits alphabetically, answer role-based prompts, choose your top 5, and give compliments to classmates.",
      id: "03-self-perception-worksheet",
      pages: "pp. 5–6",
    },
    {
      title: "Potential analysis — paper airplane task",
      description: "The group practical task used in the potential analysis, with an observer sheet, reflection prompts, and a self-assessment fill-in.",
      id: "04-potential-analysis-task",
      pages: "pp. 7–9",
    },
    {
      title: "My potential — at a glance",
      description: "A quick-reference overview of the My Potential stage: what the workshops cover, when they happen, and what goes into your career choice folder.",
      id: "12-my-potential-at-a-glance",
      pages: "p. 81",
    },
  ],

  practicalPhases: [
    {
      title: "My researches — career field worksheet",
      description: "Guided research worksheet for exploring career fields: where to look, what to find out, and the 'Wanted' poster-style career field info template.",
      id: "05-practical-research-worksheet",
      pages: "pp. 21–24",
    },
    {
      title: "My practice elements — at a glance",
      description: "Overview of the practical elements stage: what internships and taster days involve, when they happen, and what to file in your folder.",
      id: "13-practice-elements-at-a-glance",
      pages: "p. 83",
    },
  ],

  training: [
    {
      title: "Planning my internship — steps 1–6",
      description: "Full checklist and step-by-step guide for planning, researching, applying for, and documenting an internship, including application tips and CV guidance.",
      id: "06-planning-my-internship",
      pages: "pp. 43–48",
    },
    {
      title: "My application for an apprenticeship",
      description: "Research overview and profile worksheet for investigating apprenticeship programs and preparing an application.",
      id: "07-apprenticeship-application",
      pages: "p. 67",
    },
    {
      title: "Job interview preparation",
      description: "12 typical job-interview questions with space to prepare your own answers, plus a documentation table for recording your application efforts.",
      id: "08-job-interview-preparation",
      pages: "pp. 68–71",
    },
    {
      title: "My studies — at a glance",
      description: "Overview of the study-orientation stage: what university exploration involves, who can help, and what to keep in your career choice folder.",
      id: "14-my-studies-at-a-glance",
      pages: "p. 85",
    },
  ],

  documents: [
    {
      title: "Checklist — my documents",
      description: "A structured checklist of every certificate and document to collect: potential analysis certificate, career exploration certificates, internship certificates, and further evidence.",
      id: "09-documents-checklist",
      pages: "p. 75",
    },
    {
      title: "Further evidence log",
      description: "A table to record all additional activities and qualifications — sports, clubs, volunteer work, competitions, courses — that strengthen your application.",
      id: "10-further-evidence-log",
      pages: "p. 76",
    },
  ],

  conclusion: [
    {
      title: "Upper secondary — at a glance",
      description: "Overview of the career guidance process in upper secondary education: what happens at each stage, and your path into the professional future.",
      id: "11-upper-secondary-overview",
      pages: "pp. 79–80",
    },
  ],
};

// Flat list used on the central Documents page (all items in one place)
export const documents = Object.entries(documentsByPage).map(([key, items]) => ({
  category: {
    getStarted: "Get Started",
    potential: "Potential",
    practicalPhases: "Practical Phases",
    training: "Training & Careers",
    documents: "Documents",
    conclusion: "Conclusion",
  }[key],
  items,
}));

const stageLinks = {
  getStarted: "/get-started",
  potential: "/potential",
  practicalPhases: "/practical-phases",
  training: "/training",
  documents: "/documents",
  conclusion: "/conclusion",
};

// id → { ...doc, stage: <category label>, stagePath }
export const documentById = Object.fromEntries(
  Object.entries(documentsByPage).flatMap(([key, items]) =>
    items.map((doc) => [
      doc.id,
      { ...doc, stage: documents.find((g) => g.items === items)?.category, stagePath: stageLinks[key] },
    ]),
  ),
);
