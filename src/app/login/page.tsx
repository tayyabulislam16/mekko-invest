import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { error } = await searchParams;

  return (
    <main className="flex-1 grid place-items-center px-4 py-16">
      <div className="card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center">Log in</h1>
        <p className="mt-1 text-center text-sm text-[var(--muted)]">
          Welcome back to Mekko-Invest.
        </p>
        {error ? (
          <p className="mt-4 rounded-md bg-[var(--danger)]/10 text-[var(--danger)] text-sm px-3 py-2">
            {error}
          </p>
        ) : null}
        <form action={loginAction} className="mt-6 space-y-4">
          <Field label="Email" name="email" type="email" autoComplete="email" />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
          />
          <button className="w-full rounded-lg bg-[var(--primary)] text-white px-4 py-2.5 font-medium">
            Log in
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          No account?{" "}
          <Link href="/register" className="text-[var(--primary)] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--primary)]"
      />
    </label>
  );
}
