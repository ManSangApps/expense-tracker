import { ExpenseCategory, PaidBy, Prisma, SplitType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type ExpenseFilter = {
  month?: string;
  category?: ExpenseCategory;
  paidBy?: PaidBy;
};

export async function getExpenses(filters: ExpenseFilter = {}) {
  const where: Prisma.ExpenseWhereInput = {};

  if (filters.month) {
    const start = new Date(`${filters.month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    where.date = { gte: start, lt: end };
  }
  if (filters.category) where.category = filters.category;
  if (filters.paidBy) where.paidBy = filters.paidBy;

  return prisma.expense.findMany({ where, orderBy: { date: "desc" } });
}

export async function createExpense(input: {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  paidBy: PaidBy;
  splitType: SplitType;
  customSplitAmount?: number;
  isShared: boolean;
  isRecurring?: boolean;
  recurringRule?: string;
  userId: string;
}) {
  return prisma.expense.create({
    data: {
      ...input,
      amount: new Prisma.Decimal(input.amount),
      customSplitAmount: input.customSplitAmount
        ? new Prisma.Decimal(input.customSplitAmount)
        : null,
    },
  });
}

export async function updateExpense(id: string, input: Parameters<typeof createExpense>[0]) {
  return prisma.expense.update({
    where: { id },
    data: {
      ...input,
      amount: new Prisma.Decimal(input.amount),
      customSplitAmount: input.customSplitAmount
        ? new Prisma.Decimal(input.customSplitAmount)
        : null,
    },
  });
}

export async function deleteExpense(id: string) {
  return prisma.expense.delete({ where: { id } });
}
