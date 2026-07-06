import Link from "next/link";
import { logoutAction } from "@/lib/actions";

export function AppHeader({ email }: { email?: string }) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          <span className="text-[var(--primary)]">Mekko</span>-Invest
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/portfolio/edit" className="hover:underline">
            Edit portfolio
          </Link>
          {email ? (
            <>
              <span className="text-[var(--muted)] hidden sm:inline">{email}</span>
              <form action={logoutAction}>
                <button className="rounded-md border border-[var(--border)] px-3 py-1 hover:bg-[var(--background)]">
                  Log out
                </button>
              </form>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
