import { ExpenseCategory, PaidBy, SplitType } from "@prisma/client";
import { z } from "zod";

export const expenseSchema = z
  .object({
    id: z.string().optional(),
    amount: z.coerce.number().positive("Amount must be greater than zero"),
    category: z.nativeEnum(ExpenseCategory),
    description: z.string().min(2).max(200),
    date: z.string(),
    paidBy: z.nativeEnum(PaidBy),
    splitType: z.nativeEnum(SplitType),
    customSplitAmount: z.coerce.number().optional(),
    isShared: z.coerce.boolean().default(true),
    isRecurring: z.coerce.boolean().default(false),
    recurringRule: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.splitType === SplitType.CUSTOM && (!value.customSplitAmount || value.customSplitAmount <= 0)) {
      ctx.addIssue({
        code: "custom",
        message: "Custom split amount required for custom split",
        path: ["customSplitAmount"],
      });
    }
  });

export const budgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  amount: z.coerce.number().positive(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
