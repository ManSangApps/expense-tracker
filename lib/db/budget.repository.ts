import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function upsertBudget(month: string, amount: number, userId: string) {
  return prisma.budget.upsert({
    where: { month_userId: { month, userId } },
    update: { amount: new Prisma.Decimal(amount) },
    create: { month, userId, amount: new Prisma.Decimal(amount) },
  });
}

export async function getBudgetByMonth(month: string, userId: string) {
  return prisma.budget.findUnique({ where: { month_userId: { month, userId } } });
}
