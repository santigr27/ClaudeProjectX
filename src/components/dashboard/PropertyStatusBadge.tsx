import type { PropertyStatus } from "@/generated/prisma/client";

const STATUS_LABELS: Record<PropertyStatus, string> = {
  PUBLISHED: "Publicada",
  PENDING_REVIEW: "En revisión",
  DRAFT: "Borrador",
  REJECTED: "Rechazada",
};

const STATUS_CLASSES: Record<PropertyStatus, string> = {
  PUBLISHED: "bg-accent-100 text-accent-800",
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  DRAFT: "bg-ink-100 text-ink-700",
  REJECTED: "bg-red-100 text-red-800",
};

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
