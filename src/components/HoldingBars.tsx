import type { HoldingView } from "@/lib/portfolio";
import { formatPercent } from "@/lib/portfolio";
import { colorFor } from "@/lib/colors";

/** Per-holding target vs actual bars with over/under drift indicator. */
export function HoldingBars({ holdings }: { holdings: HoldingView[] }) {
  const max = Math.max(
    10,
    ...holdings.map((h) => Math.max(h.targetPercent, h.actualPercent))
  );

  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide">
        Target vs actual by holding
      </h2>
      <div className="mt-4 space-y-4">
        {holdings.map((h, i) => {
          const color = colorFor(h.type, i);
          const over = h.drift > 0.05;
          const under = h.drift < -0.05;
          return (
            <div key={h.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{h.name}</span>
                <span
                  className={
                    over
                      ? "text-[var(--danger)]"
                      : under
                        ? "text-[var(--primary)]"
                        : "text-[var(--muted)]"
                  }
                >
                  {over ? "+" : ""}
                  {formatPercent(h.drift)} {over ? "over" : under ? "under" : "on target"}
                </span>
              </div>
              {/* Target track (light) with actual fill overlaid */}
              <div className="relative h-5 rounded bg-[var(--background)] border border-[var(--border)]">
                <div
                  className="absolute inset-y-0 left-0 rounded opacity-30"
                  style={{ width: `${(h.targetPercent / max) * 100}%`, backgroundColor: color }}
                  title={`Target ${formatPercent(h.targetPercent)}`}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded"
                  style={{ width: `${(h.actualPercent / max) * 100}%`, backgroundColor: color }}
                  title={`Actual ${formatPercent(h.actualPercent)}`}
                />
              </div>
              <div className="flex gap-4 text-xs text-[var(--muted)] mt-0.5">
                <span>target {formatPercent(h.targetPercent)}</span>
                <span>actual {formatPercent(h.actualPercent)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-[var(--muted)]">
        Faded bar = target share · solid bar = actual share.
      </p>
    </div>
  );
}
