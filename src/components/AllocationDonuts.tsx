import type { HoldingView } from "@/lib/portfolio";
import { formatMoney, formatPercent } from "@/lib/portfolio";
import { buildColorMap, MAX_DONUT_COMPANIES, OTHER_COLOR } from "@/lib/colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Slice {
  key: string;
  label: string;
  color: string;
  target: number;
  actual: number;
}

/**
 * Target vs actual allocation as two donuts. Part-to-whole at a glance; the
 * exact numbers live in the legend and the breakdown table below.
 */
export function AllocationDonuts({
  holdings,
  currency,
  totalCapital,
  actualTotal,
}: {
  holdings: HoldingView[];
  currency: string;
  totalCapital: number;
  actualTotal: number;
}) {
  const { slices, foldedCount } = buildSlices(holdings);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocation — target vs actual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-start justify-center gap-4 sm:gap-8">
          <Donut
            title="Target"
            centerValue={formatMoney(totalCapital, currency)}
            segments={slices.map((s) => ({ ...s, pct: s.target }))}
          />
          <Donut
            title="Actual"
            centerValue={formatMoney(actualTotal, currency)}
            segments={slices.map((s) => ({ ...s, pct: s.actual }))}
          />
        </div>

        <Legend slices={slices} />

        {foldedCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {foldedCount} smaller {foldedCount === 1 ? "holding" : "holdings"} grouped into
            &ldquo;Other&rdquo; to keep the donuts readable — all of them are listed
            individually in the breakdown table.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/** Keeps the biggest companies as their own slices, folds the tail into "Other". */
function buildSlices(holdings: HoldingView[]): {
  slices: Slice[];
  foldedCount: number;
} {
  const colors = buildColorMap(holdings);
  const companies = holdings.filter((h) => h.type === "company");
  const cash = holdings.filter((h) => h.type === "cash");

  const ranked = [...companies].sort(
    (a, b) =>
      Math.max(b.targetPercent, b.actualPercent) -
      Math.max(a.targetPercent, a.actualPercent)
  );
  const kept = ranked.slice(0, MAX_DONUT_COMPANIES);
  let folded = ranked.slice(MAX_DONUT_COMPANIES);
  // Folding a single holding into "Other" hides a name to save no space.
  if (folded.length === 1) {
    kept.push(folded[0]);
    folded = [];
  }

  const slices: Slice[] = kept.map((h) => ({
    key: h.id,
    label: h.name,
    color: colors.get(h.id)!,
    target: h.targetPercent,
    actual: h.actualPercent,
  }));

  if (folded.length > 0) {
    slices.push({
      key: "__other",
      label: `Other (${folded.length})`,
      color: OTHER_COLOR,
      target: folded.reduce((s, h) => s + h.targetPercent, 0),
      actual: folded.reduce((s, h) => s + h.actualPercent, 0),
    });
  }

  for (const c of cash) {
    slices.push({
      key: c.id,
      label: c.name,
      color: colors.get(c.id)!,
      target: c.targetPercent,
      actual: c.actualPercent,
    });
  }

  return { slices, foldedCount: folded.length };
}

const SIZE = 168;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP_PX = 2; // surface gap between adjacent fills

function Donut({
  title,
  centerValue,
  segments,
}: {
  title: string;
  centerValue: string;
  segments: (Slice & { pct: number })[];
}) {
  const drawable = segments.filter((s) => s.pct > 0);
  const total = drawable.reduce((s, x) => s + x.pct, 0);

  let cursor = 0;

  return (
    <figure className="flex flex-col items-center gap-2 m-0">
      <figcaption className="text-xs font-medium text-muted-foreground">{title}</figcaption>
      <div className="relative">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`${title} allocation donut`}
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-muted"
          />
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            {total > 0 &&
              drawable.map((s) => {
                const len = (s.pct / total) * CIRCUMFERENCE;
                // Leave a 2px surface gap, but never erase a sliver entirely.
                const drawn = Math.max(len - GAP_PX, 0.75);
                const offset = -cursor;
                cursor += len;
                return (
                  <circle
                    key={s.key}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={STROKE}
                    strokeDasharray={`${drawn} ${CIRCUMFERENCE - drawn}`}
                    strokeDashoffset={offset}
                  >
                    <title>{`${s.label} · ${formatPercent(s.pct)}`}</title>
                  </circle>
                );
              })}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {total > 0 ? (
            <>
              <span className="text-[11px] text-muted-foreground">{title}</span>
              <span className="text-sm font-semibold tabular-nums">{centerValue}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">No data</span>
          )}
        </div>
      </div>
    </figure>
  );
}

function Legend({ slices }: { slices: Slice[] }) {
  return (
    <ul className="space-y-1.5">
      <li className="grid grid-cols-[1fr_auto_auto] gap-x-4 text-xs text-muted-foreground">
        <span>Holding</span>
        <span className="text-right w-16">Target</span>
        <span className="text-right w-16">Actual</span>
      </li>
      {slices.map((s) => (
        <li
          key={s.key}
          className="grid grid-cols-[1fr_auto_auto] gap-x-4 items-center text-sm"
        >
          <span className="flex items-center gap-2 min-w-0">
            <span
              className="inline-block h-3 w-3 rounded-sm shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="truncate">{s.label}</span>
          </span>
          <span className="text-right tabular-nums w-16">{formatPercent(s.target)}</span>
          <span className="text-right tabular-nums w-16">{formatPercent(s.actual)}</span>
        </li>
      ))}
    </ul>
  );
}
