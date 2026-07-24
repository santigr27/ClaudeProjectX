import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";

// Uses the edge-safe config (no Credentials provider) so this proxy never
// bundles bcrypt/Prisma into the Edge runtime — only an optimistic JWT
// cookie check, per Next's guidance for auth in proxy.ts. The `authorized`
// callback in authConfig decides which routes require a session and
// Auth.js handles the redirect to /login (with callbackUrl) automatically.
const { auth } = NextAuth(authConfig);

// `auth`'s public types model calling it with zero args (Server Components)
// or with a custom middleware callback to wrap — not Next's actual runtime
// convention of invoking the proxy/middleware export directly with a
// request. It works correctly that way regardless (verified: unauthenticated
// requests to protected routes 307 to /login with the right callbackUrl),
// this cast just bridges next-auth v5 beta's incomplete edge typings for it.
const authProxy = auth as unknown as (request: NextRequest) => ReturnType<typeof auth>;

// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts` and
// requires the exported function to literally be named/declared `proxy`
// (a destructured-and-renamed const, `export const { auth: proxy } = ...`,
// doesn't satisfy its build-time check even though it's a function at
// runtime) — so this thin wrapper exists purely to give it that shape.
export function proxy(request: NextRequest) {
  return authProxy(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/sell", "/sell/:path*", "/admin/:path*"],
};
