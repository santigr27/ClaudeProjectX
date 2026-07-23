import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Uses the edge-safe config (no Credentials provider) so this proxy never
// bundles bcrypt/Prisma into the Edge runtime — only an optimistic JWT
// cookie check, per Next's guidance for auth in proxy.ts. The `authorized`
// callback in authConfig decides which routes require a session and
// Auth.js handles the redirect to /login (with callbackUrl) automatically.
//
// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`,
// requiring a function named `proxy` (default or named export) — this
// project targets Next 16, so this file must be named/exported that way.
export const { auth: proxy } = NextAuth(authConfig);

export const config = {
  matcher: ["/dashboard/:path*", "/sell", "/sell/:path*"],
};
