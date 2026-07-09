import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateDefaultPortfolio } from "@/lib/queries";
import { summarize, formatPercent } from "@/lib/portfolio";
import { AppHeader } from "@/components/AppHeader";
import { HoldingsEditor } from "@/components/HoldingsEditor";
import { PortfolioSettingsForm } from "@/components/PortfolioSettingsForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function EditPortfolioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { portfolio, holdings } = await getOrCreateDefaultPortfolio(user.id);
  const summary = summarize(portfolio, holdings);
  const remaining = 100 - summary.targetPercentSum;

  return (
    <>
      <AppHeader email={user.email} />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Edit portfolio</h1>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            <ArrowLeft /> Back to dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio settings</CardTitle>
            <CardDescription>Name, total target capital, and currency.</CardDescription>
          </CardHeader>
          <CardContent>
            <PortfolioSettingsForm portfolio={portfolio} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ideal portfolio (target allocation)</CardTitle>
            <CardDescription>
              Define each company by name, ticker, and target %. Drag the handle to
              reorder. Target should total 100% (companies + cash); enter the actual
              amount you&apos;ve invested to track drift.
            </CardDescription>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant={summary.isBalanced ? "secondary" : "destructive"}>
                Target total: {formatPercent(summary.targetPercentSum)}
              </Badge>
              {summary.isBalanced ? (
                <span className="text-sm text-success">✓ balanced at 100%</span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {remaining > 0
                    ? `${formatPercent(remaining)} left to allocate`
                    : `${formatPercent(-remaining)} over 100%`}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <HoldingsEditor
              portfolioId={portfolio.id}
              holdings={holdings}
              currency={portfolio.currency}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
