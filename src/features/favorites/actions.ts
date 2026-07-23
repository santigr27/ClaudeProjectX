"use server";

import { revalidatePath } from "next/cache";
import { addFavorite, isFavorited, removeFavorite } from "@/repositories/favorite.repository";
import { getOrCreateSessionId } from "@/lib/session";

export async function toggleFavoriteAction(propertyId: string): Promise<{ favorited: boolean }> {
  const sessionId = await getOrCreateSessionId();
  const currentlyFavorited = await isFavorited(propertyId, sessionId);

  if (currentlyFavorited) {
    await removeFavorite(propertyId, sessionId);
  } else {
    await addFavorite(propertyId, sessionId);
  }

  revalidatePath("/favorites");
  return { favorited: !currentlyFavorited };
}
