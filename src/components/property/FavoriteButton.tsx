"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { clsx } from "clsx";
import { toggleFavoriteAction } from "@/features/favorites/actions";

export function FavoriteButton({
  propertyId,
  initialFavorited = false,
  className,
}: {
  propertyId: string;
  initialFavorited?: boolean;
  className?: string;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={favorited}
      aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
      disabled={isPending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setFavorited((prev) => !prev);
        startTransition(async () => {
          const result = await toggleFavoriteAction(propertyId);
          setFavorited(result.favorited);
        });
      }}
      className={clsx(
        "flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-105 disabled:opacity-70",
        className,
      )}
    >
      <Heart
        className={clsx("size-4.5 transition-colors", favorited ? "fill-brand-600 text-brand-600" : "text-ink-600")}
        aria-hidden
      />
    </button>
  );
}
