import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateDefaultPortfolio } from "@/lib/queries";
import { summarize } from "@/lib/portfolio";
import { AppHeader } from "@/components/AppHeader";
import { KpiRow } from "@/components/KpiRow";
import { MekkoChart } from "@/components/MekkoChart";
import { HoldingBars } from "@/components/HoldingBars";
import { SummaryTable } from "@/components/SummaryTable";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { portfolio, holdings } = await getOrCreateDefaultPortfolio(user.id);
  const summary = summarize(portfolio, holdings);

  return (
    <>
      <AppHeader email={user.email} />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{portfolio.name}</h1>
            <p className="text-sm text-[var(--muted)]">
              Target vs actual allocation overview.
            </p>
          </div>
          <Link
            href="/portfolio/edit"
            className="rounded-lg bg-[var(--primary)] text-white px-4 py-2 text-sm font-medium"
          >
            Edit portfolio
          </Link>
        </div>

        <KpiRow summary={summary} currency={portfolio.currency} />

        <div className="grid lg:grid-cols-2 gap-6">
          <MekkoChart holdings={summary.holdings} />
          <HoldingBars holdings={summary.holdings} />
        </div>

        <SummaryTable summary={summary} currency={portfolio.currency} />
      </main>
    </>
  );
}
