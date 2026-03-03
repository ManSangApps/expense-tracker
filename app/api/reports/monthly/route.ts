import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildDashboardMetrics } from "@/lib/calculations/dashboard";
import { getBudgetByMonth } from "@/lib/db/budget.repository";
import { getExpenses } from "@/lib/db/expense.repository";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
  const expenses = await getExpenses({ month });
  const budget = await getBudgetByMonth(month, session.user.id);

  const metrics = buildDashboardMetrics(expenses, Number(budget?.amount ?? 0));

  return NextResponse.json({
    month,
    totals: {
      expenses: metrics.totalExpenses,
      shared: metrics.sharedSpending,
      remainingBudget: metrics.remainingBudget,
    },
    individual: metrics.individual,
    settlement: metrics.settlement,
    categories: metrics.categoryDistribution,
  });
}
