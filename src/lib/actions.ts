"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users, portfolios, holdings } from "@/db/schema";
import { hashPassword, verifyPassword, newId } from "./crypto";
import { createSession, destroySession, getCurrentUser } from "./auth";
import { getPortfolioForUser } from "./queries";

// ---------------- Auth ----------------

export async function registerAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/register?error=Missing+fields");
  if (password.length < 8) redirect("/register?error=Password+too+short");

  const db = await getDb();
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) redirect("/register?error=Email+already+registered");

  const id = newId();
  await db.insert(users).values({
    id,
    email,
    passwordHash: await hashPassword(password),
    createdAt: new Date(),
  });
  await createSession(id);
  redirect("/dashboard");
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const db = await getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/login?error=Invalid+credentials");
  }
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

// ---------------- Portfolio ----------------

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function updateCapitalAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const portfolioId = String(formData.get("portfolioId") ?? "");
  const totalCapital = Number(formData.get("totalCapital") ?? 0);
  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "USD").trim() || "USD";

  const p = await getPortfolioForUser(portfolioId, user.id);
  if (!p) redirect("/dashboard");

  const db = await getDb();
  await db
    .update(portfolios)
    .set({
      totalCapital: isFinite(totalCapital) ? totalCapital : 0,
      name: name || p.name,
      currency,
    })
    .where(eq(portfolios.id, portfolioId));

  revalidatePath("/dashboard");
  revalidatePath("/portfolio/edit");
}

export async function addHoldingAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const portfolioId = String(formData.get("portfolioId") ?? "");
  const p = await getPortfolioForUser(portfolioId, user.id);
  if (!p) redirect("/dashboard");

  const db = await getDb();
  await db.insert(holdings).values({
    id: newId(),
    portfolioId,
    type: "company",
    name: String(formData.get("name") ?? "New Company").trim() || "New Company",
    ticker: String(formData.get("ticker") ?? "").trim() || null,
    targetPercent: Number(formData.get("targetPercent") ?? 0) || 0,
    actualAmount: Number(formData.get("actualAmount") ?? 0) || 0,
    sortOrder: Date.now() % 1_000_000,
  });

  revalidatePath("/dashboard");
  revalidatePath("/portfolio/edit");
}

export async function updateHoldingAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const portfolioId = String(formData.get("portfolioId") ?? "");
  const holdingId = String(formData.get("holdingId") ?? "");
  const p = await getPortfolioForUser(portfolioId, user.id);
  if (!p) redirect("/dashboard");

  const db = await getDb();
  await db
    .update(holdings)
    .set({
      name: String(formData.get("name") ?? "").trim() || "Untitled",
      ticker: String(formData.get("ticker") ?? "").trim() || null,
      targetPercent: Number(formData.get("targetPercent") ?? 0) || 0,
      actualAmount: Number(formData.get("actualAmount") ?? 0) || 0,
    })
    .where(eq(holdings.id, holdingId));

  revalidatePath("/dashboard");
  revalidatePath("/portfolio/edit");
}

export async function deleteHoldingAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const portfolioId = String(formData.get("portfolioId") ?? "");
  const holdingId = String(formData.get("holdingId") ?? "");
  const p = await getPortfolioForUser(portfolioId, user.id);
  if (!p) redirect("/dashboard");

  const db = await getDb();
  await db.delete(holdings).where(eq(holdings.id, holdingId));

  revalidatePath("/dashboard");
  revalidatePath("/portfolio/edit");
}
