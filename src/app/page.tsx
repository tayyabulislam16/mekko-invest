import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          <span className="text-[var(--primary)]">Mekko</span>-Invest
        </h1>
        <p className="mt-5 text-lg text-[var(--muted)]">
          Set your target allocation across companies and cash, record what
          you&apos;ve actually invested, and see how your real portfolio compares —
          holding by holding.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--primary)] text-white px-5 py-2.5 font-medium"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-lg bg-[var(--primary)] text-white px-5 py-2.5 font-medium"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-[var(--border)] px-5 py-2.5 font-medium"
              >
                Log in
              </Link>
            </>
          )}
        </div>

        <div className="mt-16 grid sm:grid-cols-3 gap-4 text-left">
          {[
            ["1 · Set targets", "Divide 100% across companies and cash."],
            ["2 · Add actuals", "Enter how much you've really invested."],
            ["3 · See drift", "Mekko chart and bars show over/under vs plan."],
          ].map(([t, d]) => (
            <div key={t} className="card p-5">
              <div className="font-semibold">{t}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
