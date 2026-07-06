import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground">
          <TrendingUp className="size-4 text-primary" />
          Portfolio target vs actual
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight">
          <span className="text-primary">Mekko</span>-Invest
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Set your target allocation across companies and cash, record what
          you&apos;ve actually invested, and see how your real portfolio compares —
          holding by holding.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          {user ? (
            <Button size="lg" nativeButton={false} render={<Link href="/dashboard" />}>
              Go to dashboard
            </Button>
          ) : (
            <>
              <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
                Get started
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Log in
              </Button>
            </>
          )}
        </div>

        <div className="mt-16 grid sm:grid-cols-3 gap-4 text-left">
          {[
            ["1 · Set targets", "Divide 100% across companies and cash."],
            ["2 · Add actuals", "Enter how much you've really invested."],
            ["3 · See drift", "Mekko chart and bars show over/under vs plan."],
          ].map(([t, d]) => (
            <Card key={t}>
              <CardContent>
                <div className="font-semibold">{t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{d}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
