"use client";

import { useState } from "react";
import { Plus, X, ImageIcon } from "lucide-react";

/**
 * MVP image input: property photos are provided as URLs rather than
 * uploaded files, since there is no object-storage service (S3/Cloudinary)
 * wired up yet. Swapping this for a real upload widget only requires
 * changing how each row's value is produced — the surrounding form still
 * just needs a list of `images[]` URL strings.
 */
export function ImageUrlListInput({
  initialValues = [],
  minRows = 3,
}: {
  initialValues?: string[];
  minRows?: number;
}) {
  const [urls, setUrls] = useState<string[]>(() => {
    const rows = initialValues.length > 0 ? [...initialValues] : [];
    while (rows.length < minRows) rows.push("");
    return rows;
  });

  return (
    <div className="flex flex-col gap-2">
      {urls.map((url, index) => (
        <div key={index} className="flex items-center gap-2">
          <ImageIcon className="size-4 shrink-0 text-ink-400" aria-hidden />
          <input
            type="url"
            name="images"
            value={url}
            onChange={(event) =>
              setUrls((prev) => prev.map((item, i) => (i === index ? event.target.value : item)))
            }
            placeholder="https://ejemplo.com/foto.jpg"
            className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
          />
          {urls.length > 1 && (
            <button
              type="button"
              onClick={() => setUrls((prev) => prev.filter((_, i) => i !== index))}
              aria-label="Quitar imagen"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-ink-100 hover:text-ink-600"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => setUrls((prev) => [...prev, ""])}
        className="flex w-fit items-center gap-1.5 rounded-full border border-dashed border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-ink-400"
      >
        <Plus className="size-3.5" aria-hidden />
        Agregar otra foto
      </button>
    </div>
  );
}
