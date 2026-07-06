import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateDefaultPortfolio } from "@/lib/queries";
import { summarize, formatPercent } from "@/lib/portfolio";
import {
  updateCapitalAction,
  addHoldingAction,
  updateHoldingAction,
  deleteHoldingAction,
} from "@/lib/actions";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const pid = portfolio.id;
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

        {/* Portfolio settings */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio settings</CardTitle>
            <CardDescription>Name, total target capital, and currency.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={updateCapitalAction}
              className="grid sm:grid-cols-3 gap-4 items-end"
            >
              <input type="hidden" name="portfolioId" value={pid} />
              <div className="grid gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={portfolio.name} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="totalCapital">Total target capital</Label>
                <Input
                  id="totalCapital"
                  name="totalCapital"
                  type="number"
                  step="any"
                  min="0"
                  defaultValue={portfolio.totalCapital}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  name="currency"
                  defaultValue={portfolio.currency}
                  maxLength={3}
                  className="uppercase"
                />
              </div>
              <div className="sm:col-span-3">
                <Button type="submit">Save settings</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Ideal portfolio */}
        <Card>
          <CardHeader>
            <CardTitle>Ideal portfolio (target allocation)</CardTitle>
            <CardDescription>
              Define each company by name, ticker, and target %. Target should total 100%
              (companies + cash). Enter the actual amount you&apos;ve invested to track drift.
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
          <CardContent className="space-y-4">
            {/* Column headers (desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-2 px-1 text-xs font-medium text-muted-foreground">
              <div className="col-span-4">Company</div>
              <div className="col-span-2">Ticker</div>
              <div className="col-span-2">Target %</div>
              <div className="col-span-2">Actual {portfolio.currency}</div>
              <div className="col-span-2" />
            </div>

            {holdings.map((h) => (
              <form
                key={h.id}
                action={updateHoldingAction}
                className="grid grid-cols-12 gap-2 items-end border-b pb-3 last:border-0"
              >
                <input type="hidden" name="portfolioId" value={pid} />
                <input type="hidden" name="holdingId" value={h.id} />
                <div className="col-span-6 md:col-span-4 grid gap-1">
                  <Label className="md:hidden text-xs text-muted-foreground">
                    {h.type === "cash" ? "Cash" : "Company"}
                  </Label>
                  <Input
                    name="name"
                    defaultValue={h.name}
                    readOnly={h.type === "cash"}
                    className={h.type === "cash" ? "opacity-70" : ""}
                  />
                </div>
                <div className="col-span-6 md:col-span-2 grid gap-1">
                  <Label className="md:hidden text-xs text-muted-foreground">Ticker</Label>
                  <Input
                    name="ticker"
                    defaultValue={h.ticker ?? ""}
                    disabled={h.type === "cash"}
                    placeholder={h.type === "cash" ? "—" : ""}
                  />
                </div>
                <div className="col-span-4 md:col-span-2 grid gap-1">
                  <Label className="md:hidden text-xs text-muted-foreground">Target %</Label>
                  <Input
                    name="targetPercent"
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    defaultValue={h.targetPercent}
                  />
                </div>
                <div className="col-span-4 md:col-span-2 grid gap-1">
                  <Label className="md:hidden text-xs text-muted-foreground">
                    Actual {portfolio.currency}
                  </Label>
                  <Input
                    name="actualAmount"
                    type="number"
                    step="any"
                    min="0"
                    defaultValue={h.actualAmount}
                  />
                </div>
                <div className="col-span-4 md:col-span-2 flex gap-2">
                  <Button type="submit" size="sm">
                    Save
                  </Button>
                  {h.type !== "cash" && (
                    <Button
                      type="submit"
                      variant="destructive"
                      size="sm"
                      formAction={deleteHoldingAction}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </form>
            ))}

            {/* Add company */}
            <form
              action={addHoldingAction}
              className="grid grid-cols-12 gap-2 items-end pt-2"
            >
              <input type="hidden" name="portfolioId" value={pid} />
              <div className="col-span-6 md:col-span-4 grid gap-1">
                <Label className="text-xs text-muted-foreground">Add company</Label>
                <Input name="name" placeholder="Company name" required />
              </div>
              <div className="col-span-6 md:col-span-2 grid gap-1">
                <Label className="text-xs text-muted-foreground">Ticker</Label>
                <Input name="ticker" placeholder="AAPL" />
              </div>
              <div className="col-span-4 md:col-span-2 grid gap-1">
                <Label className="text-xs text-muted-foreground">Target %</Label>
                <Input
                  name="targetPercent"
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  defaultValue={0}
                />
              </div>
              <div className="col-span-4 md:col-span-2 grid gap-1">
                <Label className="text-xs text-muted-foreground">
                  Actual {portfolio.currency}
                </Label>
                <Input name="actualAmount" type="number" step="any" min="0" defaultValue={0} />
              </div>
              <div className="col-span-4 md:col-span-2">
                <Button type="submit" variant="outline" className="w-full">
                  <Plus /> Add
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
