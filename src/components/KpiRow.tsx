import type { PortfolioSummary } from "@/lib/portfolio";
import { formatMoney, formatPercent } from "@/lib/portfolio";

export function KpiRow({
  summary,
  currency,
}: {
  summary: PortfolioSummary;
  currency: string;
}) {
  const items = [
    { label: "Target capital", value: formatMoney(summary.totalCapital, currency) },
    { label: "Total invested", value: formatMoney(summary.actualTotal, currency) },
    {
      label: "Uninvested",
      value: formatMoney(summary.uninvested, currency),
      tone: summary.uninvested < 0 ? "danger" : undefined,
    },
    { label: "Cash share", value: formatPercent(summary.cashPercent) },
    { label: "Holdings", value: String(summary.holdings.length) },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((it) => (
        <div key={it.label} className="card p-4">
          <div className="text-xs text-[var(--muted)]">{it.label}</div>
          <div
            className={`mt-1 text-xl font-semibold ${
              it.tone === "danger" ? "text-[var(--danger)]" : ""
            }`}
          >
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}
