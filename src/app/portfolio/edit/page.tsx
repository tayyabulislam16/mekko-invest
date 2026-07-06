import Link from "next/link";
import { redirect } from "next/navigation";
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

export default async function EditPortfolioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { portfolio, holdings } = await getOrCreateDefaultPortfolio(user.id);
  const summary = summarize(portfolio, holdings);
  const pid = portfolio.id;

  return (
    <>
      <AppHeader email={user.email} />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit portfolio</h1>
          <Link href="/dashboard" className="text-sm text-[var(--primary)] hover:underline">
            ← Back to dashboard
          </Link>
        </div>

        {/* Portfolio settings */}
        <section className="card p-5">
          <h2 className="font-semibold mb-4">Portfolio settings</h2>
          <form action={updateCapitalAction} className="grid sm:grid-cols-3 gap-4 items-end">
            <input type="hidden" name="portfolioId" value={pid} />
            <label className="block">
              <span className="text-sm font-medium">Name</span>
              <input
                name="name"
                defaultValue={portfolio.name}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Total target capital</span>
              <input
                name="totalCapital"
                type="number"
                step="any"
                min="0"
                defaultValue={portfolio.totalCapital}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Currency</span>
              <input
                name="currency"
                defaultValue={portfolio.currency}
                maxLength={3}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 uppercase"
              />
            </label>
            <div className="sm:col-span-3">
              <button className="rounded-lg bg-[var(--primary)] text-white px-4 py-2 text-sm font-medium">
                Save settings
              </button>
            </div>
          </form>
        </section>

        {/* Holdings */}
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Holdings</h2>
            <span
              className={`text-sm ${
                summary.isBalanced ? "text-[var(--success)]" : "text-[var(--danger)]"
              }`}
            >
              Target total: {formatPercent(summary.targetPercentSum)}
              {summary.isBalanced ? " ✓" : " (should be 100%)"}
            </span>
          </div>

          <div className="space-y-3">
            {holdings.map((h) => (
              <form
                key={h.id}
                action={updateHoldingAction}
                className="grid grid-cols-12 gap-2 items-end border-b border-[var(--border)] pb-3"
              >
                <input type="hidden" name="portfolioId" value={pid} />
                <input type="hidden" name="holdingId" value={h.id} />
                <label className="col-span-4 sm:col-span-4 block">
                  <span className="text-xs text-[var(--muted)]">
                    {h.type === "cash" ? "Cash" : "Company"}
                  </span>
                  <input
                    name="name"
                    defaultValue={h.name}
                    readOnly={h.type === "cash"}
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="col-span-3 sm:col-span-2 block">
                  <span className="text-xs text-[var(--muted)]">Ticker</span>
                  <input
                    name="ticker"
                    defaultValue={h.ticker ?? ""}
                    disabled={h.type === "cash"}
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm disabled:opacity-50"
                  />
                </label>
                <label className="col-span-2 block">
                  <span className="text-xs text-[var(--muted)]">Target %</span>
                  <input
                    name="targetPercent"
                    type="number"
                    step="any"
                    min="0"
                    max="100"
                    defaultValue={h.targetPercent}
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                  />
                </label>
                <label className="col-span-3 sm:col-span-2 block">
                  <span className="text-xs text-[var(--muted)]">Actual $</span>
                  <input
                    name="actualAmount"
                    type="number"
                    step="any"
                    min="0"
                    defaultValue={h.actualAmount}
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
                  />
                </label>
                <div className="col-span-12 sm:col-span-2 flex gap-2">
                  <button className="rounded-lg bg-[var(--primary)] text-white px-3 py-1.5 text-sm">
                    Save
                  </button>
                  {h.type !== "cash" && (
                    <button
                      formAction={deleteHoldingAction}
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--danger)]"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </form>
            ))}
          </div>

          {/* Add new company */}
          <form action={addHoldingAction} className="mt-5 grid grid-cols-12 gap-2 items-end">
            <input type="hidden" name="portfolioId" value={pid} />
            <label className="col-span-4 block">
              <span className="text-xs text-[var(--muted)]">Add company</span>
              <input
                name="name"
                placeholder="Company name"
                required
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
              />
            </label>
            <label className="col-span-2 block">
              <span className="text-xs text-[var(--muted)]">Ticker</span>
              <input
                name="ticker"
                placeholder="AAPL"
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
              />
            </label>
            <label className="col-span-2 block">
              <span className="text-xs text-[var(--muted)]">Target %</span>
              <input
                name="targetPercent"
                type="number"
                step="any"
                min="0"
                max="100"
                defaultValue={0}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
              />
            </label>
            <label className="col-span-2 block">
              <span className="text-xs text-[var(--muted)]">Actual $</span>
              <input
                name="actualAmount"
                type="number"
                step="any"
                min="0"
                defaultValue={0}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm"
              />
            </label>
            <div className="col-span-2">
              <button className="w-full rounded-lg border border-[var(--primary)] text-[var(--primary)] px-3 py-1.5 text-sm font-medium">
                + Add
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
