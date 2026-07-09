/**
 * Categorical palette for holdings.
 *
 * These six hues are the validated categorical set (lightness band, chroma floor,
 * and colorblind separation all pass; worst adjacent CVD ΔE 24.2 on light).
 * Two slots sit under 3:1 contrast on the light surface, so every chart using
 * them must ship direct labels or a table view — both are present on the
 * dashboard (donut legend + breakdown table).
 *
 * Cash is deliberately a de-emphasis neutral, not a categorical slot: it is the
 * "not deployed into equities" bucket, and reading gray is the point.
 */
const CATEGORICAL = [
  "#2a78d6", // blue
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

export const CASH_COLOR = "#94a3b8";
export const OTHER_COLOR = "#64748b";

/** Donuts stay legible only at a small segment count; the tail folds into "Other". */
export const MAX_DONUT_COMPANIES = 5;

export interface ColorableHolding {
  id: string;
  type: "company" | "cash";
}

/**
 * Colour follows the entity, not its rank: a holding keeps its hue regardless of
 * where it sorts in a given chart. Companies take categorical slots in list
 * order; cash always takes the neutral.
 */
export function buildColorMap(holdings: ColorableHolding[]): Map<string, string> {
  const map = new Map<string, string>();
  let slot = 0;
  for (const h of holdings) {
    if (h.type === "cash") {
      map.set(h.id, CASH_COLOR);
    } else {
      map.set(h.id, CATEGORICAL[slot % CATEGORICAL.length]);
      slot++;
    }
  }
  return map;
}
