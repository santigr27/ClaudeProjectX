import type { DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}

// next-auth v5 beta's own callback signatures (@auth/core/index.d.ts) import
// JWT from "@auth/core/jwt" directly rather than through the "next-auth/jwt"
// re-export, so augmenting only the latter leaves `token` in `jwt`/`session`
// callbacks untouched — augment both module specifiers to be safe.
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}
