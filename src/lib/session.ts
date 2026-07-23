import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const SESSION_COOKIE = "raiz_session";

/**
 * Anonymous session id used to scope favorites without requiring
 * authentication. Swappable for a real user id once auth is added.
 */
export async function getOrCreateSessionId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const sessionId = randomUUID();
  store.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return sessionId;
}

export async function getSessionId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}
