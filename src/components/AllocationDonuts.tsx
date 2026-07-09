"use client";

import { useId, useState } from "react";
import type { HoldingView } from "@/lib/portfolio";
import { formatMoney, formatPercent } from "@/lib/portfolio";
import { buildColorMap, type HoldingStyle } from "@/lib/colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Slice {
  key: string;
  label: string;
  style: HoldingStyle;
  targetPercent: number;
  targetAmount: number;
  actualPercent: number;
  actualAmount: number;
}

type Which = "target" | "actual";

/**
 * Which element the pointer is on. Each donut and the legend hover
 * independently, so only the hovered one reacts — never both donuts at once.
 */
type Hover = { source: Which | "legend"; key: string };

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
  const slices = buildSlices(holdings);
  const [hover, setHover] = useState<Hover | null>(null);

  return (
    <Card className="overflow-visible">
      <CardHeader>
        <CardTitle>Allocation — target vs actual</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col lg:flex-row gap-8">
        <div className="flex justify-center gap-6 sm:gap-8 shrink-0">
          <Donut
            which="target"
            title="Target"
            centerValue={formatMoney(totalCapital, currency)}
            slices={slices}
            currency={currency}
            hover={hover}
            onHover={setHover}
          />
          <Donut
            which="actual"
            title="Actual"
            centerValue={formatMoney(actualTotal, currency)}
            slices={slices}
            currency={currency}
            hover={hover}
            onHover={setHover}
          />
        </div>

        <Legend
          slices={slices}
          currency={currency}
          hover={hover}
          onHover={setHover}
        />
      </CardContent>
    </Card>
  );
}

/** Companies ranked by weight, cash last. */
function buildSlices(holdings: HoldingView[]): Slice[] {
  const colors = buildColorMap(holdings);
  const toSlice = (h: HoldingView): Slice => ({
    key: h.id,
    label: h.name,
    style: colors.get(h.id)!,
    targetPercent: h.targetPercent,
    targetAmount: h.targetAmount,
    actualPercent: h.actualPercent,
    actualAmount: h.actualAmount,
  });

  const companies = holdings
    .filter((h) => h.type === "company")
    .sort(
      (a, b) =>
        Math.max(b.targetPercent, b.actualPercent) -
        Math.max(a.targetPercent, a.actualPercent)
    );
  const cash = holdings.filter((h) => h.type === "cash");

  return [...companies, ...cash].map(toSlice);
}

const SIZE = 168;
const STROKE = 26;
const HOVER_GROWTH = 4;
// Headroom so the thickened hover ring still fits inside the viewBox.
const RADIUS = (SIZE - STROKE) / 2 - HOVER_GROWTH / 2 - 1;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP_PX = 2; // surface gap between adjacent fills

function Donut({
  which,
  title,
  centerValue,
  slices,
  currency,
  hover,
  onHover,
}: {
  which: Which;
  title: string;
  centerValue: string;
  slices: Slice[];
  currency: string;
  hover: Hover | null;
  onHover: (h: Hover | null) => void;
}) {
  const uid = useId().replace(/:/g, "");
  const pctOf = (s: Slice) =>
    which === "target" ? s.targetPercent : s.actualPercent;

  const drawable = slices.filter((s) => pctOf(s) > 0);
  const total = drawable.reduce((sum, s) => sum + pctOf(s), 0);

  // Only this donut reacts to its own pointer; a legend hover highlights the
  // matching slice but raises no tooltip (that would put one on each donut).
  const ownHover = hover?.source === which ? hover.key : null;
  const linkedKey = hover?.source === "legend" ? hover.key : null;
  const activeKey = ownHover ?? linkedKey;
  const hoveredSlice = ownHover ? slices.find((s) => s.key === ownHover) : null;

  let cursor = 0;

  return (
    <figure className="flex flex-col items-center gap-2 m-0">
      <figcaption className="text-xs font-medium text-muted-foreground">{title}</figcaption>
      <div className="relative" onMouseLeave={() => onHover(null)}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`${title} allocation`}
        >
          <defs>
            {drawable
              .filter((s) => s.style.hatch)
              .map((s) => (
                <pattern
                  key={s.key}
                  id={`hatch-${uid}-${s.key}`}
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width="6" height="6" fill={s.style.color} />
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="6"
                    stroke="#ffffff"
                    strokeOpacity="0.6"
                    strokeWidth="2.5"
                  />
                </pattern>
              ))}
          </defs>

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
                const len = (pctOf(s) / total) * CIRCUMFERENCE;
                // Leave a 2px surface gap, but never erase a sliver entirely.
                const drawn = Math.max(len - GAP_PX, 0.75);
                const offset = -cursor;
                cursor += len;

                const isActive = activeKey === s.key;
                const dimmed = activeKey !== null && !isActive;
                const paint = s.style.hatch
                  ? `url(#hatch-${uid}-${s.key})`
                  : s.style.color;

                return (
                  <circle
                    key={s.key}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={paint}
                    strokeWidth={isActive ? STROKE + HOVER_GROWTH : STROKE}
                    strokeDasharray={`${drawn} ${CIRCUMFERENCE - drawn}`}
                    strokeDashoffset={offset}
                    opacity={dimmed ? 0.35 : 1}
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={() => onHover({ source: which, key: s.key })}
                  />
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

        {hoveredSlice && (
          <Tooltip slice={hoveredSlice} currency={currency} emphasis={which} />
        )}
      </div>
    </figure>
  );
}

/** Name + PKR amount + share, for target and actual; the hovered ring is emphasised. */
function Tooltip({
  slice,
  currency,
  emphasis,
}: {
  slice: Slice;
  currency: string;
  emphasis: Which;
}) {
  const rows: { which: Which; label: string; amount: number; pct: number }[] = [
    {
      which: "target",
      label: "Target",
      amount: slice.targetAmount,
      pct: slice.targetPercent,
    },
    {
      which: "actual",
      label: "Actual",
      amount: slice.actualAmount,
      pct: slice.actualPercent,
    },
  ];

  return (
    <div
      role="tooltip"
      className="absolute left-1/2 top-full z-30 -translate-x-1/2 translate-y-2 w-max max-w-[15rem] rounded-lg border bg-popover px-3 py-2 shadow-md pointer-events-none"
    >
      <div className="flex items-center gap-2 font-medium text-sm">
        <span
          className="inline-block h-3 w-3 rounded-sm shrink-0"
          style={swatchStyle(slice.style)}
        />
        <span className="truncate">{slice.label}</span>
      </div>
      <dl className="mt-1.5 space-y-0.5">
        {rows.map((r) => (
          <div
            key={r.which}
            className={`flex items-baseline justify-between gap-4 text-xs ${
              r.which === emphasis ? "font-semibold" : "text-muted-foreground"
            }`}
          >
            <dt>{r.label}</dt>
            <dd className="tabular-nums">
              {formatMoney(r.amount, currency)}{" "}
              <span className="text-muted-foreground">({formatPercent(r.pct)})</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Legend doubles as the direct-label relief for the low-contrast palette slots. */
function Legend({
  slices,
  currency,
  hover,
  onHover,
}: {
  slices: Slice[];
  currency: string;
  hover: Hover | null;
  onHover: (h: Hover | null) => void;
}) {
  return (
    <ul className="flex-1 min-w-0 space-y-1" onMouseLeave={() => onHover(null)}>
      <li className="grid grid-cols-[1fr_auto_auto] gap-x-4 text-xs text-muted-foreground px-1">
        <span>Holding</span>
        <span className="text-right w-28">Target</span>
        <span className="text-right w-28">Actual</span>
      </li>
      {slices.map((s) => {
        const isHovered = hover?.source === "legend" && hover.key === s.key;
        return (
          <li
            key={s.key}
            onMouseEnter={() => onHover({ source: "legend", key: s.key })}
            className={`grid grid-cols-[1fr_auto_auto] gap-x-4 items-center text-sm rounded px-1 py-0.5 transition-colors ${
              isHovered ? "bg-muted" : ""
            }`}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="inline-block h-3 w-3 rounded-sm shrink-0"
                style={swatchStyle(s.style)}
              />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="text-right tabular-nums w-28">
              {formatPercent(s.targetPercent)}
              <span className="block text-[11px] text-muted-foreground">
                {formatMoney(s.targetAmount, currency)}
              </span>
            </span>
            <span className="text-right tabular-nums w-28">
              {formatPercent(s.actualPercent)}
              <span className="block text-[11px] text-muted-foreground">
                {formatMoney(s.actualAmount, currency)}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function swatchStyle(style: HoldingStyle): React.CSSProperties {
  if (!style.hatch) return { backgroundColor: style.color };
  return {
    backgroundColor: style.color,
    backgroundImage:
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0 2px, transparent 2px 5px)",
  };
}
