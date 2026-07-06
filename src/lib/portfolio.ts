import type { Holding, Portfolio } from "@/db/schema";

export interface HoldingView extends Holding {
  targetAmount: number; // totalCapital * targetPercent / 100
  actualPercent: number; // share of actual total
  drift: number; // actualPercent - targetPercent
  gapAmount: number; // targetAmount - actualAmount
}

export interface PortfolioSummary {
  holdings: HoldingView[];
  totalCapital: number;
  actualTotal: number;
  targetPercentSum: number;
  isBalanced: boolean; // target percentages sum to ~100
  uninvested: number; // totalCapital - actualTotal
  cashActual: number;
  cashPercent: number;
}

const EPS = 0.01;

export function summarize(
  portfolio: Pick<Portfolio, "totalCapital">,
  holdings: Holding[]
): PortfolioSummary {
  const totalCapital = portfolio.totalCapital ?? 0;
  const actualTotal = holdings.reduce((s, h) => s + (h.actualAmount ?? 0), 0);
  const targetPercentSum = holdings.reduce(
    (s, h) => s + (h.targetPercent ?? 0),
    0
  );

  const views: HoldingView[] = holdings.map((h) => {
    const targetAmount = (totalCapital * (h.targetPercent ?? 0)) / 100;
    const actualPercent =
      actualTotal > 0 ? ((h.actualAmount ?? 0) / actualTotal) * 100 : 0;
    return {
      ...h,
      targetAmount,
      actualPercent,
      drift: actualPercent - (h.targetPercent ?? 0),
      gapAmount: targetAmount - (h.actualAmount ?? 0),
    };
  });

  const cash = holdings.filter((h) => h.type === "cash");
  const cashActual = cash.reduce((s, h) => s + (h.actualAmount ?? 0), 0);

  return {
    holdings: views,
    totalCapital,
    actualTotal,
    targetPercentSum,
    isBalanced: Math.abs(targetPercentSum - 100) < EPS,
    uninvested: totalCapital - actualTotal,
    cashActual,
    cashPercent: actualTotal > 0 ? (cashActual / actualTotal) * 100 : 0,
  };
}

export function formatMoney(n: number, currency = "PKR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export function formatPercent(n: number): string {
  return `${(n || 0).toFixed(1)}%`;
}
