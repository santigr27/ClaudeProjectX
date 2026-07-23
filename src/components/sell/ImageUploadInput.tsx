"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGES_PER_PROPERTY,
  MAX_IMAGE_SIZE_BYTES,
} from "@/config/image-upload";

interface ExistingImage {
  id: string;
  imageUrl: string;
}

/**
 * Real file upload (no more URL text fields): pictures are validated and
 * previewed client-side, then sent as actual files under `imageFiles` for
 * the server action to persist via PropertyImageService. Existing photos
 * (edit mode) are shown read-only — this MVP only supports adding new
 * photos, not removing individual existing ones (see SellPropertyForm's
 * "edit" mode docs for that documented limitation).
 */
export function ImageUploadInput({ existingImages = [] }: { existingImages?: ExistingImage[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const remainingSlots = MAX_IMAGES_PER_PROPERTY - existingImages.length - previews.length;

  function syncInputFiles(files: File[]) {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    if (inputRef.current) inputRef.current.files = dataTransfer.files;
  }

  function handleFilesPicked(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const incoming = Array.from(fileList);
    const accepted: File[] = [];

    for (const file of incoming) {
      if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
        setError(`"${file.name}" no es un formato permitido (usa JPEG, PNG o WebP).`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError(`"${file.name}" supera el tamaño máximo de 5 MB.`);
        continue;
      }
      accepted.push(file);
    }

    const merged = [...previews.map((p) => p.file), ...accepted].slice(
      0,
      MAX_IMAGES_PER_PROPERTY - existingImages.length,
    );

    if (merged.length < previews.length + accepted.length) {
      setError(`Puedes tener máximo ${MAX_IMAGES_PER_PROPERTY} fotos por propiedad.`);
    }

    setPreviews(merged.map((file) => ({ file, url: URL.createObjectURL(file) })));
    syncInputFiles(merged);
  }

  function removePreview(index: number) {
    const next = previews.filter((_, i) => i !== index);
    setPreviews(next);
    syncInputFiles(next.map((p) => p.file));
  }

  return (
    <div className="flex flex-col gap-3">
      {existingImages.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-ink-700">Fotos actuales</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {existingImages.map((image) => (
              <div key={image.id} className="relative aspect-square overflow-hidden rounded-xl bg-ink-100">
                <Image src={image.imageUrl} alt="" fill sizes="120px" className="object-cover" />
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-ink-400">Las fotos nuevas se agregan a las actuales.</p>
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {previews.map((preview, index) => (
            <div key={preview.url} className="relative aspect-square overflow-hidden rounded-xl bg-ink-100">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL, not an optimizable remote asset */}
              <img src={preview.url} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => removePreview(index)}
                aria-label="Quitar foto"
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-dashed border-ink-300 px-4 py-2 text-sm font-medium text-ink-600 hover:border-ink-400">
        <ImagePlus className="size-4" aria-hidden />
        Agregar fotos
        <input
          ref={inputRef}
          type="file"
          name="imageFiles"
          multiple
          accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
          onChange={(event) => handleFilesPicked(event.target.files)}
          disabled={remainingSlots <= 0}
          className="sr-only"
        />
      </label>

      <p className="text-xs text-ink-400">
        JPEG, PNG o WebP. Máximo 5 MB por foto, {MAX_IMAGES_PER_PROPERTY} fotos por propiedad.
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
