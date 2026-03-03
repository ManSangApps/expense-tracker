import { PaidBy, SplitType } from "@prisma/client";

export type SettlementExpense = {
  amount: number;
  paidBy: PaidBy;
  splitType: SplitType;
  customSplitAmount?: number | null;
  isShared: boolean;
};

export type SettlementResult = {
  paid: Record<PaidBy, number>;
  shouldPay: Record<PaidBy, number>;
  delta: number;
  message: string;
};

export function calculateSettlement(expenses: SettlementExpense[]): SettlementResult {
  const paid = { PARTNER1: 0, PARTNER2: 0 } as Record<PaidBy, number>;
  const shouldPay = { PARTNER1: 0, PARTNER2: 0 } as Record<PaidBy, number>;

  for (const expense of expenses) {
    paid[expense.paidBy] += expense.amount;

    if (!expense.isShared || expense.splitType === SplitType.FULL) {
      shouldPay[expense.paidBy] += expense.amount;
      continue;
    }

    if (expense.splitType === SplitType.EQUAL) {
      shouldPay.PARTNER1 += expense.amount / 2;
      shouldPay.PARTNER2 += expense.amount / 2;
      continue;
    }

    const p1Share = Math.min(expense.customSplitAmount ?? 0, expense.amount);
    shouldPay.PARTNER1 += p1Share;
    shouldPay.PARTNER2 += expense.amount - p1Share;
  }

  const partner1Diff = paid.PARTNER1 - shouldPay.PARTNER1;
  const delta = Math.abs(partner1Diff);

  const message =
    delta < 0.01
      ? "All settled up."
      : partner1Diff > 0
        ? `Partner2 owes Partner1 ₹${delta.toFixed(2)}`
        : `Partner1 owes Partner2 ₹${delta.toFixed(2)}`;

  return { paid, shouldPay, delta, message };
}
