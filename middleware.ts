export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/api/expenses/:path*", "/api/reports/:path*"],
};
