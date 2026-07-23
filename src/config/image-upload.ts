/**
 * Shared between the client-side upload widget and the server-side
 * validation service — kept dependency-free (no Prisma/Node imports) so
 * it's safe to import from a "use client" component.
 */
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_IMAGES_PER_PROPERTY = 10;
