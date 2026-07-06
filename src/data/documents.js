// ─────────────────────────────────────────────────────────────────────────
// DOCUMENTS
// Organized by the page they belong to. Each stage page pulls its own
// section here; the central Documents page shows everything.
//
// To add your own:
//   1. Drop the PDF into /public/documents/
//   2. Add an entry in the relevant section below.
// ─────────────────────────────────────────────────────────────────────────

export const documentsByPage = {

  getStarted: [
    {
      title: "Icons & orientation guide",
      description: "The four career-orientation process icons and the four working-method icons explained — your key to reading every worksheet in this program.",
      file: "/documents/01-intro-icons-guide.pdf",
      pages: "pp. 1–2",
    },
    {
      title: "Welcome to your career orientation",
      description: "An overview of how the program works, what the Career Choice Pass folder contains, and your path into the professional future.",
      file: "/documents/02-welcome-career-orientation.pdf",
      pages: "pp. 3–4",
    },
  ],

  potential: [
    {
      title: "Self-perception & perception by others",
      description: "Worksheet for the positive-traits exercise: collect traits alphabetically, answer role-based prompts, choose your top 5, and give compliments to classmates.",
      file: "/documents/03-self-perception-worksheet.pdf",
      pages: "pp. 5–6",
    },
    {
      title: "Potential analysis — paper airplane task",
      description: "The group practical task used in the potential analysis, with an observer sheet, reflection prompts, and a self-assessment fill-in.",
      file: "/documents/04-potential-analysis-task.pdf",
      pages: "pp. 7–9",
    },
    {
      title: "My potential — at a glance",
      description: "A quick-reference overview of the My Potential stage: what the workshops cover, when they happen, and what goes into your career choice folder.",
      file: "/documents/12-my-potential-at-a-glance.pdf",
      pages: "p. 81",
    },
  ],

  practicalPhases: [
    {
      title: "My researches — career field worksheet",
      description: "Guided research worksheet for exploring career fields: where to look, what to find out, and the 'Wanted' poster-style career field info template.",
      file: "/documents/05-practical-research-worksheet.pdf",
      pages: "pp. 21–24",
    },
    {
      title: "My practice elements — at a glance",
      description: "Overview of the practical elements stage: what internships and taster days involve, when they happen, and what to file in your folder.",
      file: "/documents/13-practice-elements-at-a-glance.pdf",
      pages: "p. 83",
    },
  ],

  training: [
    {
      title: "Planning my internship — steps 1–6",
      description: "Full checklist and step-by-step guide for planning, researching, applying for, and documenting an internship, including application tips and CV guidance.",
      file: "/documents/06-planning-my-internship.pdf",
      pages: "pp. 43–48",
    },
    {
      title: "My application for an apprenticeship",
      description: "Research overview and profile worksheet for investigating apprenticeship programs and preparing an application.",
      file: "/documents/07-apprenticeship-application.pdf",
      pages: "p. 67",
    },
    {
      title: "Job interview preparation",
      description: "12 typical job-interview questions with space to prepare your own answers, plus a documentation table for recording your application efforts.",
      file: "/documents/08-job-interview-preparation.pdf",
      pages: "pp. 68–71",
    },
    {
      title: "My studies — at a glance",
      description: "Overview of the study-orientation stage: what university exploration involves, who can help, and what to keep in your career choice folder.",
      file: "/documents/14-my-studies-at-a-glance.pdf",
      pages: "p. 85",
    },
  ],

  documents: [
    {
      title: "Checklist — my documents",
      description: "A structured checklist of every certificate and document to collect: potential analysis certificate, career exploration certificates, internship certificates, and further evidence.",
      file: "/documents/09-documents-checklist.pdf",
      pages: "p. 75",
    },
    {
      title: "Further evidence log",
      description: "A table to record all additional activities and qualifications — sports, clubs, volunteer work, competitions, courses — that strengthen your application.",
      file: "/documents/10-further-evidence-log.pdf",
      pages: "p. 76",
    },
  ],

  conclusion: [
    {
      title: "Upper secondary — at a glance",
      description: "Overview of the career guidance process in upper secondary education: what happens at each stage, and your path into the professional future.",
      file: "/documents/11-upper-secondary-overview.pdf",
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
