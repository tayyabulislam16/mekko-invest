import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { logoutAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";

export function AppHeader({ email }: { email?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
          <TrendingUp className="size-5 text-primary" />
          <span>
            <span className="text-primary">Mekko</span>-Invest
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/portfolio/edit" />}
          >
            Edit portfolio
          </Button>
          {email ? (
            <>
              <span className="text-muted-foreground hidden sm:inline mx-2">{email}</span>
              <form action={logoutAction}>
                <Button variant="outline" size="sm" type="submit">
                  Log out
                </Button>
              </form>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
