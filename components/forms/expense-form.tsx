"use client";

import { ExpenseCategory, PaidBy, SplitType } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, ExpenseInput } from "@/lib/validations/expense";

type Props = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<ExpenseInput>;
};

export function ExpenseForm({ action, defaultValues }: Props) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues,
  });

  const splitType = watch("splitType");

  return (
    <form
      className="grid gap-3 rounded-xl border p-4"
      onSubmit={handleSubmit(async (values) => {
        const fd = new FormData();
        Object.entries(values).forEach(([k, v]) => fd.append(k, String(v ?? "")));
        await action(fd);
      })}
    >
      <input className="rounded border p-2" placeholder="Description" {...register("description")} />
      {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      <input className="rounded border p-2" type="number" step="0.01" {...register("amount")} placeholder="Amount" />
      <input className="rounded border p-2" type="date" {...register("date")} />
      <select className="rounded border p-2" {...register("category")}>
        {Object.values(ExpenseCategory).map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      <select className="rounded border p-2" {...register("paidBy")}>
        {Object.values(PaidBy).map((value) => (
          <option key={value} value={value}>{value}</option>
        ))}
      </select>
      <select className="rounded border p-2" {...register("splitType")}>
        {Object.values(SplitType).map((value) => (
          <option key={value} value={value}>{value}</option>
        ))}
      </select>
      {splitType === SplitType.CUSTOM && (
        <input className="rounded border p-2" type="number" step="0.01" {...register("customSplitAmount")} placeholder="Partner1 custom share" />
      )}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("isShared")} /> Shared Expense</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register("isRecurring")} /> Recurring</label>
      <input className="rounded border p-2" placeholder="Recurring rule (e.g. monthly)" {...register("recurringRule")} />
      <button className="rounded bg-blue-600 px-4 py-2 text-white" type="submit" disabled={isSubmitting}>Save Expense</button>
    </form>
  );
}
