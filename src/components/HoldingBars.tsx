import type { HoldingView } from "@/lib/portfolio";
import { formatPercent } from "@/lib/portfolio";
import { buildColorMap } from "@/lib/colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Per-holding target vs actual bars with over/under drift indicator. */
export function HoldingBars({ holdings }: { holdings: HoldingView[] }) {
  const colors = buildColorMap(holdings);
  const max = Math.max(
    10,
    ...holdings.map((h) => Math.max(h.targetPercent, h.actualPercent))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Target vs actual by holding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {holdings.map((h) => {
          const color = colors.get(h.id)!.color;
          const over = h.drift > 0.05;
          const under = h.drift < -0.05;
          return (
            <div key={h.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{h.name}</span>
                <span
                  className={
                    over
                      ? "text-destructive"
                      : under
                        ? "text-primary"
                        : "text-muted-foreground"
                  }
                >
                  {over ? "+" : ""}
                  {formatPercent(h.drift)} {over ? "over" : under ? "under" : "on target"}
                </span>
              </div>
              <div className="relative h-5 rounded bg-muted/50 border">
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
              <div className="flex gap-4 text-xs text-muted-foreground mt-0.5">
                <span>target {formatPercent(h.targetPercent)}</span>
                <span>actual {formatPercent(h.actualPercent)}</span>
              </div>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground">
          Faded bar = target share · solid bar = actual share.
        </p>
      </CardContent>
    </Card>
  );
}
