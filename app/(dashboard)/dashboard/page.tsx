import { ExpenseCategory, PaidBy } from "@prisma/client";
import { auth } from "@/auth";
import { createExpenseAction, deleteExpenseAction, setBudgetAction } from "@/app/actions";
import { MonthlyBarChart } from "@/components/charts/monthly-bar-chart";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { ExpenseForm } from "@/components/forms/expense-form";
import { buildDashboardMetrics } from "@/lib/calculations/dashboard";
import { getBudgetByMonth } from "@/lib/db/budget.repository";
import { getExpenses } from "@/lib/db/expense.repository";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string; category?: ExpenseCategory; paidBy?: PaidBy };
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const month = searchParams.month ?? new Date().toISOString().slice(0, 7);
  const expenses = await getExpenses(searchParams);
  const budget = await getBudgetByMonth(month, session.user.id);
  const metrics = buildDashboardMetrics(expenses, Number(budget?.amount ?? 0));

  return (
    <section className="space-y-6">
      <div className="grid gap-3 md:grid-cols-5">
        <MetricCard label="Total" value={metrics.totalExpenses} />
        <MetricCard label="Partner1 Paid" value={metrics.individual.PARTNER1} />
        <MetricCard label="Partner2 Paid" value={metrics.individual.PARTNER2} />
        <MetricCard label="Shared" value={metrics.sharedSpending} />
        <MetricCard label="Remaining Budget" value={metrics.remainingBudget} />
      </div>

      <div className="rounded-xl border p-4 text-sm">Settlement: {metrics.settlement.message}</div>


      <form className="flex flex-wrap gap-3 rounded-xl border p-4" method="get">
        <input className="rounded border p-2" type="month" name="month" defaultValue={month} />
        <select className="rounded border p-2" name="category" defaultValue={searchParams.category ?? ""}>
          <option value="">All Categories</option>
          {Object.values(ExpenseCategory).map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select className="rounded border p-2" name="paidBy" defaultValue={searchParams.paidBy ?? ""}>
          <option value="">Both</option>
          {Object.values(PaidBy).map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        <button className="rounded border px-4 py-2" type="submit">Apply Filters</button>
        <a className="rounded border px-4 py-2" href={`/api/expenses/export-csv?month=${month}`}>Export CSV</a>
        <a className="rounded border px-4 py-2" href={`/api/reports/monthly?month=${month}`}>View Monthly Report JSON</a>
      </form>

      <form action={setBudgetAction} className="flex flex-wrap items-end gap-3 rounded-xl border p-4">
        <label className="grid gap-1 text-sm">Month<input className="rounded border p-2" type="month" name="month" defaultValue={month} /></label>
        <label className="grid gap-1 text-sm">Budget<input className="rounded border p-2" type="number" name="amount" step="0.01" /></label>
        <button className="rounded bg-slate-800 px-4 py-2 text-white">Save Budget</button>
      </form>

      <ExpenseForm action={createExpenseAction} defaultValues={{
        date: new Date().toISOString().slice(0, 10),
        category: ExpenseCategory.GROCERIES,
        paidBy: PaidBy.PARTNER1,
        splitType: "EQUAL",
        isShared: true,
      }} />

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryPieChart data={metrics.categoryDistribution} />
        <MonthlyBarChart data={metrics.monthlyTrend} />
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Paid By</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-t">
                <td className="p-2">{expense.date.toISOString().slice(0, 10)}</td>
                <td className="p-2">{expense.description}</td>
                <td className="p-2">{expense.category}</td>
                <td className="p-2">₹{Number(expense.amount).toFixed(2)}</td>
                <td className="p-2">{expense.paidBy}</td>
                <td className="p-2">
                  <form action={deleteExpenseAction.bind(null, expense.id)}>
                    <button className="rounded border px-2 py-1">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-xl border p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold">₹{value.toFixed(2)}</p>
    </article>
  );
}
