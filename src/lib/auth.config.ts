import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe subset of the Auth.js config: no Credentials provider (which
 * pulls in bcrypt + Prisma/pg) so this file is safe to import from
 * middleware, which runs on the Edge runtime. The full config in `auth.ts`
 * spreads this and adds the provider for use in route handlers/Server
 * Actions/Server Components, which run on Node.
 */
export const authConfig: NextAuthConfig = {
  // Self-hosted (not deployed on Vercel), so Auth.js needs an explicit
  // opt-in to trust the request's Host header — otherwise every request
  // outside `next dev` fails with UntrustedHost. NEXTAUTH_URL/AUTH_URL
  // already pin the canonical origin, so this doesn't widen what's trusted.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const { pathname } = request.nextUrl;
      const requiresAuth = pathname.startsWith("/dashboard") || pathname.startsWith("/sell");
      return requiresAuth ? isLoggedIn : true;
    },
  },
  providers: [],
};
