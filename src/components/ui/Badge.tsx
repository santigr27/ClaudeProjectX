import { clsx } from "clsx";
import type { ReactNode } from "react";

type BadgeVariant = "brand" | "accent" | "neutral" | "outline";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  brand: "bg-brand-600 text-white",
  accent: "bg-accent-600 text-white",
  neutral: "bg-ink-100 text-ink-700",
  outline: "border border-white/70 bg-black/35 text-white backdrop-blur-sm",
};

export function Badge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
