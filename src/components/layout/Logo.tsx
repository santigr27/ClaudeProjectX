import Link from "next/link";

/**
 * Original mark: a rooftop silhouette resolving into a root/branch line,
 * nodding to the brand name "Raíz" (root) without referencing any
 * third-party real estate brand.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`} aria-label="Raíz, inicio">
      <svg
        viewBox="0 0 32 32"
        className="size-8 shrink-0 text-brand-600"
        fill="none"
        aria-hidden
      >
        <path
          d="M16 3 L28 13 H23 V26 H9 V13 H4 Z"
          fill="currentColor"
        />
        <path
          d="M16 26 C16 21 12 20 9 22 M16 26 C16 20 20 18 23 20"
          stroke="var(--color-accent-600)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight text-ink-900">Raíz</span>
    </Link>
  );
}
