import type { PortfolioSummary } from "@/lib/portfolio";
import { formatMoney, formatPercent } from "@/lib/portfolio";
import { colorFor } from "@/lib/colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function SummaryTable({
  summary,
  currency,
}: {
  summary: PortfolioSummary;
  currency: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Holding</TableHead>
              <TableHead className="text-right">Target %</TableHead>
              <TableHead className="text-right">Target {currency}</TableHead>
              <TableHead className="text-right">Actual {currency}</TableHead>
              <TableHead className="text-right">Actual %</TableHead>
              <TableHead className="text-right">Drift</TableHead>
              <TableHead className="text-right">Gap to target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.holdings.map((h, i) => {
              const over = h.drift > 0.05;
              const under = h.drift < -0.05;
              return (
                <TableRow key={h.id}>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ backgroundColor: colorFor(h.type, i) }}
                      />
                      {h.name}
                      {h.ticker ? (
                        <span className="text-muted-foreground">· {h.ticker}</span>
                      ) : null}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPercent(h.targetPercent)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(h.targetAmount, currency)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(h.actualAmount, currency)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPercent(h.actualPercent)}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${
                      over ? "text-destructive" : under ? "text-primary" : ""
                    }`}
                  >
                    {over ? "+" : ""}
                    {formatPercent(h.drift)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(h.gapAmount, currency)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatPercent(summary.targetPercentSum)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatMoney(summary.totalCapital, currency)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatMoney(summary.actualTotal, currency)}
              </TableCell>
              <TableCell className="text-right tabular-nums">100.0%</TableCell>
              <TableCell />
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
        {!summary.isBalanced && (
          <p className="mt-3 text-sm text-destructive">
            ⚠ Target percentages sum to {formatPercent(summary.targetPercentSum)} — adjust to
            reach 100%.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
