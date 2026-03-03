import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getExpenses } from "@/lib/db/expense.repository";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? undefined;
  const expenses = await getExpenses({ month });

  const rows = [
    ["Date", "Description", "Category", "Amount", "PaidBy", "Shared", "Recurring"],
    ...expenses.map((expense) => [
      expense.date.toISOString().slice(0, 10),
      expense.description,
      expense.category,
      Number(expense.amount).toFixed(2),
      expense.paidBy,
      String(expense.isShared),
      String(expense.isRecurring),
    ]),
  ];

  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="expenses-${month ?? "all"}.csv"`,
    },
  });
}
