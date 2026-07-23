import { getSessionId } from "@/lib/session";
import { listFavoritedPropertyIds } from "@/repositories/favorite.repository";

export async function getFavoritedIdsForCurrentSession(): Promise<Set<string>> {
  const sessionId = await getSessionId();
  if (!sessionId) return new Set();
  const ids = await listFavoritedPropertyIds(sessionId);
  return new Set(ids);
}
