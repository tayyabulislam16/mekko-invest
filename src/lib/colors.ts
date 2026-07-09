/**
 * Categorical palette for holdings.
 *
 * These eight hues are the validated categorical set (lightness band, chroma
 * floor and colourblind separation all pass; worst adjacent CVD ΔE 24.2 on the
 * light surface). Three slots sit under 3:1 contrast against the surface, so
 * every chart that uses them must ship direct labels or a table view — the
 * dashboard has both (donut legend + breakdown table).
 *
 * Past eight holdings we never invent a ninth hue (a generated hue is
 * indistinguishable from an existing one under CVD). Instead the palette wraps
 * and the repeated hue is marked with a diagonal hatch, so identity is carried
 * by hue x texture rather than hue alone.
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
  "#e87ba4", // magenta
  "#eb6834", // orange
];

export const CASH_COLOR = "#94a3b8";

export interface HoldingStyle {
  color: string;
  /** True when the hue is a repeat and needs texture to stay distinguishable. */
  hatch: boolean;
}

export interface ColorableHolding {
  id: string;
  type: "company" | "cash";
}

/**
 * Colour follows the entity, not its rank: a holding keeps its hue wherever it
 * sorts. Companies take categorical slots in list order; cash always takes the
 * neutral.
 */
export function buildColorMap(
  holdings: ColorableHolding[]
): Map<string, HoldingStyle> {
  const map = new Map<string, HoldingStyle>();
  let slot = 0;
  for (const h of holdings) {
    if (h.type === "cash") {
      map.set(h.id, { color: CASH_COLOR, hatch: false });
    } else {
      map.set(h.id, {
        color: CATEGORICAL[slot % CATEGORICAL.length],
        hatch: slot >= CATEGORICAL.length,
      });
      slot++;
    }
  }
  return map;
}
