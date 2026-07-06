import type { PortfolioSummary } from "@/lib/portfolio";
import { formatMoney, formatPercent } from "@/lib/portfolio";
import { Card } from "@/components/ui/card";

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
      tone: summary.uninvested < 0 ? "destructive" : undefined,
    },
    { label: "Cash share", value: formatPercent(summary.cashPercent) },
    { label: "Holdings", value: String(summary.holdings.length) },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((it) => (
        <Card key={it.label} className="p-4 gap-1">
          <div className="text-xs text-muted-foreground">{it.label}</div>
          <div
            className={`text-xl font-semibold tabular-nums ${
              it.tone === "destructive" ? "text-destructive" : ""
            }`}
          >
            {it.value}
          </div>
        </Card>
      ))}
    </div>
  );
}
