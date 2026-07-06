import type { HoldingView } from "@/lib/portfolio";
import { formatPercent } from "@/lib/portfolio";
import { colorFor } from "@/lib/colors";

/**
 * Two side-by-side allocation columns — Target vs Actual. Each segment's height
 * encodes its percentage. A Marimekko-style comparison of intent vs reality.
 */
export function MekkoChart({ holdings }: { holdings: HoldingView[] }) {
  const ordered = holdings.map((h, i) => ({ h, color: colorFor(h.type, i) }));

  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide">
        Allocation — target vs actual
      </h2>
      <div className="mt-4 flex gap-6">
        <Column
          title="Target"
          segments={ordered.map(({ h, color }) => ({
            key: h.id,
            label: h.name,
            pct: h.targetPercent,
            color,
          }))}
        />
        <Column
          title="Actual"
          segments={ordered.map(({ h, color }) => ({
            key: h.id,
            label: h.name,
            pct: h.actualPercent,
            color,
          }))}
        />
        <Legend items={ordered.map(({ h, color }) => ({ label: h.name, color }))} />
      </div>
    </div>
  );
}

function Column({
  title,
  segments,
}: {
  title: string;
  segments: { key: string; label: string; pct: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + Math.max(0, x.pct), 0);
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-medium text-[var(--muted)] mb-2">{title}</div>
      <div className="w-24 h-72 rounded-lg overflow-hidden border border-[var(--border)] flex flex-col-reverse bg-[var(--background)]">
        {total <= 0 ? (
          <div className="flex-1 grid place-items-center text-[10px] text-[var(--muted)] text-center px-1">
            No data
          </div>
        ) : (
          segments
            .filter((s) => s.pct > 0)
            .map((s) => (
              <div
                key={s.key}
                title={`${s.label} · ${formatPercent(s.pct)}`}
                style={{
                  height: `${(s.pct / total) * 100}%`,
                  backgroundColor: s.color,
                }}
                className="w-full flex items-center justify-center text-[10px] font-semibold text-white/95 overflow-hidden"
              >
                {s.pct >= 8 ? `${Math.round(s.pct)}%` : ""}
              </div>
            ))
        )}
      </div>
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex-1 space-y-1.5 self-center">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-3 w-3 rounded-sm shrink-0"
            style={{ backgroundColor: it.color }}
          />
          <span className="truncate">{it.label}</span>
        </li>
      ))}
    </ul>
  );
}
