import Link from "next/link";
import { auth, signOut } from "@/auth";
import { ThemeToggle } from "@/app/components/theme-toggle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-r p-4">
        <h2 className="text-lg font-bold">Expense Tracker</h2>
        <p className="text-sm text-gray-500">{session?.user?.email}</p>
        <nav className="mt-6 space-y-2 text-sm">
          <Link className="block rounded px-2 py-1 hover:bg-muted" href="/dashboard">Dashboard</Link>
        </nav>
        <div className="mt-6 flex items-center gap-2">
          <ThemeToggle />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="rounded border px-3 py-2 text-sm" type="submit">Logout</button>
          </form>
        </div>
      </aside>
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
