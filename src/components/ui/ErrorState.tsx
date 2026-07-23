import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

export function ErrorState({
  title = "Algo salió mal",
  description = "No pudimos completar esta acción. Inténtalo de nuevo en unos minutos.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 px-6 py-14 text-center">
      <TriangleAlert className="size-8 text-red-500" aria-hidden />
      <h3 className="font-display text-lg font-semibold text-ink-800">{title}</h3>
      <p className="max-w-sm text-sm text-ink-500">{description}</p>
      {action}
    </div>
  );
}
