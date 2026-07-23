import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { getSessionId } from "@/lib/session";
import { findPropertiesByIds } from "@/repositories/property.repository";
import { listFavoritedPropertyIds } from "@/repositories/favorite.repository";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Favoritos",
};

export default async function FavoritesPage() {
  const sessionId = await getSessionId();
  const propertyIds = sessionId ? await listFavoritedPropertyIds(sessionId) : [];
  const properties = await findPropertiesByIds(propertyIds);
  const favoritedIds = new Set(propertyIds);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-3xl font-semibold text-ink-900">Tus favoritos</h1>

      {properties.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-8" aria-hidden />}
          title="Aún no tienes propiedades favoritas"
          description="Toca el corazón en cualquier propiedad para guardarla aquí y comparar más adelante."
          action={<Button href="/properties">Explorar propiedades</Button>}
        />
      ) : (
        <PropertyGrid properties={properties} favoritedIds={favoritedIds} />
      )}
    </div>
  );
}
