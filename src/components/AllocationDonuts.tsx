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
 * Target vs actual allocation as two donuts. Every holding gets its own slice;
 * exact figures live in the hover tooltip, the legend, and the breakdown table.
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
  const slices = buildSlices(holdings);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocation — target vs actual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-start justify-center gap-4 sm:gap-8">
          <Donut
            title="Target"
            which="target"
            centerValue={formatMoney(totalCapital, currency)}
            slices={slices}
            currency={currency}
            hovered={hovered}
            onHover={setHovered}
          />
          <Donut
            title="Actual"
            which="actual"
            centerValue={formatMoney(actualTotal, currency)}
            slices={slices}
            currency={currency}
            hovered={hovered}
            onHover={setHovered}
          />
        </div>

        <Legend
          slices={slices}
          currency={currency}
          hovered={hovered}
          onHover={setHovered}
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
  title,
  which,
  centerValue,
  slices,
  currency,
  hovered,
  onHover,
}: {
  title: string;
  which: Which;
  centerValue: string;
  slices: Slice[];
  currency: string;
  hovered: string | null;
  onHover: (key: string | null) => void;
}) {
  const uid = useId().replace(/:/g, "");
  const pctOf = (s: Slice) =>
    which === "target" ? s.targetPercent : s.actualPercent;

  const drawable = slices.filter((s) => pctOf(s) > 0);
  const total = drawable.reduce((sum, s) => sum + pctOf(s), 0);
  const hoveredSlice = slices.find((s) => s.key === hovered) ?? null;

  let cursor = 0;

  return (
    <figure className="relative flex flex-col items-center gap-2 m-0">
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

                const dimmed = hovered !== null && hovered !== s.key;
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
                    strokeWidth={hovered === s.key ? STROKE + HOVER_GROWTH : STROKE}
                    strokeDasharray={`${drawn} ${CIRCUMFERENCE - drawn}`}
                    strokeDashoffset={offset}
                    opacity={dimmed ? 0.35 : 1}
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={() => onHover(s.key)}
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
      className="absolute left-1/2 top-full z-20 -translate-x-1/2 translate-y-2 w-max max-w-[15rem] rounded-lg border bg-popover px-3 py-2 shadow-md pointer-events-none"
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
  hovered,
  onHover,
}: {
  slices: Slice[];
  currency: string;
  hovered: string | null;
  onHover: (key: string | null) => void;
}) {
  return (
    <ul className="space-y-1" onMouseLeave={() => onHover(null)}>
      <li className="grid grid-cols-[1fr_auto_auto] gap-x-4 text-xs text-muted-foreground">
        <span>Holding</span>
        <span className="text-right w-28">Target</span>
        <span className="text-right w-28">Actual</span>
      </li>
      {slices.map((s) => (
        <li
          key={s.key}
          onMouseEnter={() => onHover(s.key)}
          className={`grid grid-cols-[1fr_auto_auto] gap-x-4 items-center text-sm rounded px-1 py-0.5 transition-colors ${
            hovered === s.key ? "bg-muted" : ""
          } ${hovered !== null && hovered !== s.key ? "opacity-60" : ""}`}
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
      ))}
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
