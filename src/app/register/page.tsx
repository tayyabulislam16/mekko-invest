import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <main className="flex-1 grid place-items-center px-4 py-16">
      <div className="card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center">Create account</h1>
        <p className="mt-1 text-center text-sm text-[var(--muted)]">
          Start planning your target portfolio.
        </p>
        {error ? (
          <p className="mt-4 rounded-md bg-[var(--danger)]/10 text-[var(--danger)] text-sm px-3 py-2">
            {error}
          </p>
        ) : null}
        <form action={registerAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--primary)]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--primary)]"
            />
            <span className="text-xs text-[var(--muted)]">At least 8 characters.</span>
          </label>
          <button className="w-full rounded-lg bg-[var(--primary)] text-white px-4 py-2.5 font-medium">
            Create account
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--primary)] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
