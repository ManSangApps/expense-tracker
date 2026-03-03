"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createExpense, deleteExpense, getExpenses, updateExpense } from "@/lib/db/expense.repository";
import { budgetSchema, expenseSchema } from "@/lib/validations/expense";
import { upsertBudget } from "@/lib/db/budget.repository";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user;
}

export async function createExpenseAction(formData: FormData) {
  const user = await requireUser();
  const parsed = expenseSchema.parse(Object.fromEntries(formData.entries()));

  await createExpense({
    amount: parsed.amount,
    category: parsed.category,
    description: parsed.description,
    date: new Date(parsed.date),
    paidBy: parsed.paidBy,
    splitType: parsed.splitType,
    customSplitAmount: parsed.customSplitAmount,
    isShared: parsed.isShared,
    isRecurring: parsed.isRecurring,
    recurringRule: parsed.recurringRule,
    userId: user.id,
  });

  revalidatePath("/dashboard");
}

export async function updateExpenseAction(id: string, formData: FormData) {
  const user = await requireUser();
  const parsed = expenseSchema.parse(Object.fromEntries(formData.entries()));

  await updateExpense(id, {
    amount: parsed.amount,
    category: parsed.category,
    description: parsed.description,
    date: new Date(parsed.date),
    paidBy: parsed.paidBy,
    splitType: parsed.splitType,
    customSplitAmount: parsed.customSplitAmount,
    isShared: parsed.isShared,
    isRecurring: parsed.isRecurring,
    recurringRule: parsed.recurringRule,
    userId: user.id,
  });

  revalidatePath("/dashboard");
}

export async function deleteExpenseAction(id: string) {
  await requireUser();
  await deleteExpense(id);
  revalidatePath("/dashboard");
}

export async function setBudgetAction(formData: FormData) {
  const user = await requireUser();
  const parsed = budgetSchema.parse(Object.fromEntries(formData.entries()));

  await upsertBudget(parsed.month, parsed.amount, user.id);
  revalidatePath("/dashboard");
}

export async function getFilteredExpenses(month?: string, category?: string, paidBy?: string) {
  await requireUser();
  return getExpenses({
    month,
    category: category as never,
    paidBy: paidBy as never,
  });
}
