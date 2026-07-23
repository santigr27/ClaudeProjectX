import {
  countImagesByPropertyId,
  createImage,
  deleteImageById,
  findImageById,
  findImagesByPropertyId,
} from "@/repositories/property-image.repository";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGES_PER_PROPERTY,
} from "@/config/image-upload";

/**
 * Postgres-backed property photo storage (no S3/Cloudinary/etc. for this
 * MVP — see prisma/schema.prisma PropertyImage.imageData). Callers outside
 * this module never touch `imageData`/mimeType/fileSize directly, so the
 * storage strategy can change later (e.g. to disk or object storage)
 * without touching property/business logic — only this file and the
 * serving route (src/app/api/property-images/[id]/route.ts) would move.
 */

export class InvalidImageError extends Error {}

// TS 5.7+ generic-parametrizes typed arrays over their backing buffer
// (`Uint8Array<ArrayBuffer>` vs the looser `Uint8Array<ArrayBufferLike>`,
// which also covers SharedArrayBuffer). Both Prisma's `Bytes` field and the
// DOM `Response` body type want the narrower one specifically, but neither
// `new Uint8Array(arrayBuffer)` nor Prisma's own runtime value are typed
// that narrowly in practice — this alias + single cast point documents
// that gap instead of scattering `as` casts across the file.
type StoredBytes = Uint8Array<ArrayBuffer>;

async function toStoredBytes(file: File): Promise<StoredBytes> {
  return new Uint8Array(await file.arrayBuffer()) as StoredBytes;
}

function assertValidImageFile(file: File): void {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    throw new InvalidImageError(`"${file.name}" no es un formato permitido (usa JPEG, PNG o WebP).`);
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new InvalidImageError(`"${file.name}" supera el tamaño máximo de 5 MB.`);
  }
}

/**
 * Validates every file up front (type, size, and total count against the
 * property's current image count) before any is persisted, so a bad file
 * never leaves a partially-saved set of photos.
 */
export async function assertCanAddImages(propertyId: string | null, newFiles: File[]): Promise<void> {
  newFiles.forEach(assertValidImageFile);

  const existingCount = propertyId ? await countImagesByPropertyId(propertyId) : 0;
  if (existingCount + newFiles.length > MAX_IMAGES_PER_PROPERTY) {
    throw new InvalidImageError(`Puedes tener máximo ${MAX_IMAGES_PER_PROPERTY} fotos por propiedad.`);
  }
}

export async function saveImage(propertyId: string, file: File, sortOrder: number) {
  assertValidImageFile(file);
  const imageData = await toStoredBytes(file);

  return createImage({
    propertyId,
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
    imageData,
    sortOrder,
  });
}

export async function getImage(id: string): Promise<{ data: StoredBytes; mimeType: string } | null> {
  const image = await findImageById(id);
  if (!image?.imageData || !image.mimeType) return null;
  return { data: image.imageData as StoredBytes, mimeType: image.mimeType };
}

export async function getPropertyImages(propertyId: string) {
  return findImagesByPropertyId(propertyId);
}

export async function deleteImage(id: string): Promise<void> {
  await deleteImageById(id);
}
