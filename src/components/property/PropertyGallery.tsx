"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

interface GalleryImage {
  imageUrl: string;
  alt: string | null;
}

export function PropertyGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length],
  );
  const showNext = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, close, showPrev, showNext]);

  if (images.length === 0) {
    return <div className="aspect-16/9 w-full rounded-2xl bg-ink-100" />;
  }

  const [main, ...rest] = images;
  const gridThumbs = rest.slice(0, 4);

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:gap-3">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="group relative col-span-1 aspect-16/10 overflow-hidden rounded-2xl bg-ink-100 sm:col-span-2 sm:row-span-2"
        >
          <Image
            src={main.imageUrl}
            alt={main.alt ?? title}
            fill
            priority
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </button>

        {gridThumbs.map((image, index) => (
          <button
            key={image.imageUrl + index}
            type="button"
            onClick={() => setLightboxIndex(index + 1)}
            className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-ink-100"
          >
            <Image
              src={image.imageUrl}
              alt={image.alt ?? title}
              fill
              sizes="25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {index === gridThumbs.length - 1 && images.length > 5 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                +{images.length - 5} más
              </div>
            )}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="col-span-full flex items-center justify-center gap-2 rounded-full border border-ink-200 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 sm:col-span-1 sm:col-start-4"
        >
          <Expand className="size-4" aria-hidden />
          Ver todas las fotos
        </button>
      </div>

      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galería de ${title}`}
          className="fixed inset-0 z-[1000] flex flex-col bg-black/95"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar galería"
            className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="size-5" aria-hidden />
          </button>

          <div className="relative flex flex-1 items-center justify-center px-4">
            <button
              type="button"
              onClick={showPrev}
              aria-label="Foto anterior"
              className="absolute left-2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft className="size-6" aria-hidden />
            </button>

            <div className="relative h-[70vh] w-full max-w-4xl">
              <Image
                src={images[lightboxIndex].imageUrl}
                alt={images[lightboxIndex].alt ?? title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            <button
              type="button"
              onClick={showNext}
              aria-label="Foto siguiente"
              className="absolute right-2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
            >
              <ChevronRight className="size-6" aria-hidden />
            </button>
          </div>

          <p className="pb-6 text-center text-sm text-white/70">
            {lightboxIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}
