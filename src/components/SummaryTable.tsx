import type { PortfolioSummary } from "@/lib/portfolio";
import { formatMoney, formatPercent } from "@/lib/portfolio";
import { colorFor } from "@/lib/colors";

export function SummaryTable({
  summary,
  currency,
}: {
  summary: PortfolioSummary;
  currency: string;
}) {
  return (
    <div className="card p-5 overflow-x-auto">
      <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-4">
        Breakdown
      </h2>
      <table className="w-full text-sm border-collapse min-w-[640px]">
        <thead>
          <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
            <th className="py-2 pr-3 font-medium">Holding</th>
            <th className="py-2 px-3 font-medium text-right">Target %</th>
            <th className="py-2 px-3 font-medium text-right">Target $</th>
            <th className="py-2 px-3 font-medium text-right">Actual $</th>
            <th className="py-2 px-3 font-medium text-right">Actual %</th>
            <th className="py-2 px-3 font-medium text-right">Drift</th>
            <th className="py-2 pl-3 font-medium text-right">Gap to target</th>
          </tr>
        </thead>
        <tbody>
          {summary.holdings.map((h, i) => {
            const over = h.drift > 0.05;
            const under = h.drift < -0.05;
            return (
              <tr key={h.id} className="border-b border-[var(--border)] last:border-0">
                <td className="py-2 pr-3">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: colorFor(h.type, i) }}
                    />
                    {h.name}
                    {h.ticker ? (
                      <span className="text-[var(--muted)]">· {h.ticker}</span>
                    ) : null}
                  </span>
                </td>
                <td className="py-2 px-3 text-right">{formatPercent(h.targetPercent)}</td>
                <td className="py-2 px-3 text-right">{formatMoney(h.targetAmount, currency)}</td>
                <td className="py-2 px-3 text-right">{formatMoney(h.actualAmount, currency)}</td>
                <td className="py-2 px-3 text-right">{formatPercent(h.actualPercent)}</td>
                <td
                  className={`py-2 px-3 text-right ${
                    over ? "text-[var(--danger)]" : under ? "text-[var(--primary)]" : ""
                  }`}
                >
                  {over ? "+" : ""}
                  {formatPercent(h.drift)}
                </td>
                <td className="py-2 pl-3 text-right">
                  {formatMoney(h.gapAmount, currency)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="font-semibold">
            <td className="py-2 pr-3">Total</td>
            <td className="py-2 px-3 text-right">{formatPercent(summary.targetPercentSum)}</td>
            <td className="py-2 px-3 text-right">{formatMoney(summary.totalCapital, currency)}</td>
            <td className="py-2 px-3 text-right">{formatMoney(summary.actualTotal, currency)}</td>
            <td className="py-2 px-3 text-right">100.0%</td>
            <td className="py-2 px-3"></td>
            <td className="py-2 pl-3"></td>
          </tr>
        </tfoot>
      </table>
      {!summary.isBalanced && (
        <p className="mt-3 text-sm text-[var(--danger)]">
          ⚠ Target percentages sum to {formatPercent(summary.targetPercentSum)} — adjust to
          reach 100%.
        </p>
      )}
    </div>
  );
}
