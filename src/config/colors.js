// Tailwind v4 only generates classes that appear literally in source files,
// so dynamic strings like `bg-${color}` won't work. This lookup maps each
// stage's color token to the literal classes used across components.

export const stageClasses = {
  "stage-1": {
    bg: "bg-stage-1",
    bgHover: "hover:bg-stage-1/90",
    text: "text-stage-1",
    border: "border-stage-1",
    iconBg: "bg-stage-1/10",
  },
  "stage-2": {
    bg: "bg-stage-2",
    bgHover: "hover:bg-stage-2/90",
    text: "text-stage-2",
    border: "border-stage-2",
    iconBg: "bg-stage-2/10",
  },
  "stage-3": {
    bg: "bg-stage-3",
    bgHover: "hover:bg-stage-3/90",
    text: "text-stage-3",
    border: "border-stage-3",
    iconBg: "bg-stage-3/10",
  },
  "stage-4": {
    bg: "bg-stage-4",
    bgHover: "hover:bg-stage-4/90",
    text: "text-stage-4",
    border: "border-stage-4",
    iconBg: "bg-stage-4/10",
  },
  "stage-5": {
    bg: "bg-stage-5",
    bgHover: "hover:bg-stage-5/90",
    text: "text-stage-5",
    border: "border-stage-5",
    iconBg: "bg-stage-5/10",
  },
  "stage-6": {
    bg: "bg-stage-6",
    bgHover: "hover:bg-stage-6/90",
    text: "text-stage-6",
    border: "border-stage-6",
    iconBg: "bg-stage-6/10",
  },
};
