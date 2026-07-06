import { eq, asc } from "drizzle-orm";
import { getDb } from "@/db";
import { portfolios, holdings, type Portfolio, type Holding } from "@/db/schema";
import { newId } from "./crypto";

/**
 * Returns the user's default portfolio, creating a starter one (with a cash
 * line) if none exists. MVP is single-portfolio; the schema allows more later.
 */
export async function getOrCreateDefaultPortfolio(
  userId: string
): Promise<{ portfolio: Portfolio; holdings: Holding[] }> {
  const db = await getDb();
  let portfolio = await db.query.portfolios.findFirst({
    where: eq(portfolios.userId, userId),
  });

  if (!portfolio) {
    const id = newId();
    const now = new Date();
    await db.insert(portfolios).values({
      id,
      userId,
      name: "My Portfolio",
      totalCapital: 100000,
      currency: "USD",
      createdAt: now,
    });
    await db.insert(holdings).values({
      id: newId(),
      portfolioId: id,
      type: "cash",
      name: "Cash",
      ticker: null,
      targetPercent: 100,
      actualAmount: 0,
      sortOrder: 1000,
    });
    portfolio = await db.query.portfolios.findFirst({
      where: eq(portfolios.id, id),
    });
  }

  const rows = await db.query.holdings.findMany({
    where: eq(holdings.portfolioId, portfolio!.id),
    orderBy: [asc(holdings.sortOrder)],
  });

  return { portfolio: portfolio!, holdings: rows };
}

export async function getPortfolioForUser(
  portfolioId: string,
  userId: string
): Promise<Portfolio | null> {
  const db = await getDb();
  const p = await db.query.portfolios.findFirst({
    where: eq(portfolios.id, portfolioId),
  });
  if (!p || p.userId !== userId) return null;
  return p;
}
