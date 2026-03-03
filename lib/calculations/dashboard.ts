import { Expense, ExpenseCategory, PaidBy } from "@prisma/client";
import { calculateSettlement } from "@/lib/calculations/settlement";

export function buildDashboardMetrics(expenses: Expense[], budgetAmount = 0) {
  const normalized = expenses.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
    customSplitAmount: expense.customSplitAmount ? Number(expense.customSplitAmount) : null,
  }));

  const totalExpenses = normalized.reduce((sum, expense) => sum + expense.amount, 0);
  const individual = {
    PARTNER1: normalized.filter((e) => e.paidBy === PaidBy.PARTNER1).reduce((acc, e) => acc + e.amount, 0),
    PARTNER2: normalized.filter((e) => e.paidBy === PaidBy.PARTNER2).reduce((acc, e) => acc + e.amount, 0),
  };

  const sharedSpending = normalized.filter((e) => e.isShared).reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = budgetAmount - totalExpenses;

  const categoryDistribution = Object.values(ExpenseCategory).map((category) => ({
    category,
    amount: normalized.filter((e) => e.category === category).reduce((sum, e) => sum + e.amount, 0),
  }));

  const monthlyTrend = normalized
    .reduce<Record<string, number>>((acc, e) => {
      const key = e.date.toISOString().slice(0, 7);
      acc[key] = (acc[key] ?? 0) + e.amount;
      return acc;
    }, {})
    ;

  return {
    totalExpenses,
    individual,
    sharedSpending,
    remainingBudget,
    categoryDistribution,
    monthlyTrend: Object.entries(monthlyTrend).map(([month, amount]) => ({ month, amount })),
    settlement: calculateSettlement(normalized),
  };
}
