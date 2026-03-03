import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const allowedEmails = (process.env.ALLOWED_USER_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const providers: Provider[] = [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = signInSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        if (!allowedEmails.includes(email)) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: false,
      }),
    );
  }

  return {
    pages: { signIn: "/login" },
    session: { strategy: "jwt" as const },
    providers,
    callbacks: {
      async signIn({ user, account }) {
        if (!user.email) return false;
        if (!allowedEmails.includes(user.email.toLowerCase())) return false;

        if (account?.provider === "google") {
          const existing = await prisma.user.findUnique({ where: { email: user.email } });
          return Boolean(existing);
        }
        return true;
      },
      async jwt({ token, user }) {
        if (user) token.role = (user as { role?: string }).role;
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.sub ?? "";
          session.user.role = typeof token.role === "string" ? token.role : "";
        }
        return session;
      },
    },
  };
});
