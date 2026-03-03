# Personal Expense Tracker (Next.js + Neon + Prisma)

Production-ready, private-by-design expense tracker for two predefined users.

## Tech Stack
- Next.js 14 (App Router, Server Components)
- TypeScript + Tailwind CSS
- NextAuth (Credentials + optional Google)
- Prisma + PostgreSQL (Neon)
- Zod validation + server actions

## Folder Structure

```txt
app/
  (auth)/login/page.tsx
  (dashboard)/dashboard/{layout,page}.tsx
  api/
    auth/[...nextauth]/route.ts
    expenses/export-csv/route.ts
    reports/monthly/route.ts
  actions.ts
components/
  charts/{category-pie-chart,monthly-bar-chart}.tsx
  forms/expense-form.tsx
lib/
  auth/
  calculations/{dashboard,settlement}.ts
  db/{prisma,expense.repository,budget.repository}.ts
  validations/expense.ts
prisma/schema.prisma
auth.ts
middleware.ts
types/next-auth.d.ts
```

## Domain Highlights
- **Users limited to two people** via `ALLOWED_USER_EMAILS` allowlist + DB-backed users.
- **Expense fields**: amount, category, description, date, paidBy, splitType, custom split, shared flag, recurring metadata.
- **Settlement algorithm** in `lib/calculations/settlement.ts` (pure, testable).
- **Mutations in server actions** (`app/actions.ts`), no business logic in UI components.

## Local Setup
1. `npm install`
2. Copy env file: `cp .env.example .env.local`
3. Set Neon `DATABASE_URL`, auth secrets, allowed emails.
4. `npx prisma generate`
5. `npx prisma migrate dev --name init`
6. Seed two users manually (or via script) with hashed passwords.
7. `npm run dev`
8. Open `http://localhost:3000/login`

## Recommended Seed (example)
Use a one-off script with `bcryptjs.hash(password, 12)` and insert two users with roles `PARTNER1` and `PARTNER2`.

## Features
- Secure route protection with middleware + NextAuth
- Dashboard metrics + pie/bar charts
- Expense add/delete (server actions); update action scaffold included
- Budget setting per month
- Month/category/paidBy-ready repository filters
- CSV export: `/api/expenses/export-csv?month=2026-01`
- Monthly JSON report: `/api/reports/monthly?month=2026-01`
- Dark/light mode with persistent theme

## Notes for Production
- Add CSRF-safe UX flows, toasts, and optimistic updates.
- Add automated tests for settlement algorithm and server actions.
- Enforce stricter recurring rule format (RRULE).
