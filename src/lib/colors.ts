// Categorical palette for holdings. Cash always renders in a neutral slate.
const PALETTE = [
  "#2f6df6", // blue
  "#16a34a", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#ef4444", // red
  "#84cc16", // lime
  "#f97316", // orange
  "#14b8a6", // teal
];

const CASH_COLOR = "#94a3b8";

export function colorFor(
  type: "company" | "cash",
  index: number
): string {
  if (type === "cash") return CASH_COLOR;
  return PALETTE[index % PALETTE.length];
}
