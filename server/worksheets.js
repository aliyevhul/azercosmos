// The fill-in fields of each worksheet (generated from the PDFs by
// scripts/worksheets/build.py) and validation of what students submit.

import worksheets from "../shared/worksheet-fields.js";
import { HttpError } from "./http.js";

export const MAX_TEXT_LENGTH = 2000;

const fieldTypes = new Map(
  Object.entries(worksheets).map(([docId, doc]) => [
    docId,
    new Map(doc.pages.flatMap((p) => p.fields.map((f) => [f.id, f.type]))),
  ]),
);

export function worksheetIds() {
  return Object.keys(worksheets).filter((id) => worksheets[id].fieldCount > 0);
}

export function totalFor(docId) {
  return worksheets[docId]?.fieldCount ?? 0;
}

export function assertWorksheet(docId) {
  if (!fieldTypes.has(docId)) throw new HttpError(404, "Unknown worksheet.");
  if (totalFor(docId) === 0) throw new HttpError(400, "This document has nothing to fill in.");
}

// Keeps only known fields with the right kind of value; drops empty ones.
// Returns { answers, filled, total }.
export function cleanAnswers(docId, input) {
  assertWorksheet(docId);
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new HttpError(400, "Answers must be an object.");
  }
  const types = fieldTypes.get(docId);
  const answers = {};
  for (const [id, value] of Object.entries(input)) {
    const type = types.get(id);
    if (!type) continue; // field no longer exists — ignore rather than fail the whole save
    if (type === "checkbox") {
      if (value === true) answers[id] = true;
    } else if (typeof value === "string") {
      if (value.length > MAX_TEXT_LENGTH) throw new HttpError(400, `An answer is longer than ${MAX_TEXT_LENGTH} characters.`);
      if (value.trim()) answers[id] = value;
    }
  }
  return { answers, filled: Object.keys(answers).length, total: totalFor(docId) };
}
