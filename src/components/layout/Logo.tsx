import Image from "next/image";
import Link from "next/link";

/**
 * Falls back to an original rooftop/root mark + the marketplace name when no
 * `logoUrl` is configured (see /admin/branding). Once a real logo is
 * uploaded, it fully replaces the mark — no code change needed to rebrand.
 */
export function Logo({
  className,
  name = "Raíz",
  logoUrl,
}: {
  className?: string;
  name?: string;
  logoUrl?: string | null;
}) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`} aria-label={`${name}, inicio`}>
      {logoUrl ? (
        <Image src={logoUrl} alt={name} width={32} height={32} className="size-8 shrink-0 object-contain" />
      ) : (
        <svg viewBox="0 0 32 32" className="size-8 shrink-0 text-brand-600" fill="none" aria-hidden>
          <path d="M16 3 L28 13 H23 V26 H9 V13 H4 Z" fill="currentColor" />
          <path
            d="M16 26 C16 21 12 20 9 22 M16 26 C16 20 20 18 23 20"
            stroke="var(--color-accent-600)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
      <span className="font-display text-xl font-semibold tracking-tight text-ink-900">{name}</span>
    </Link>
  );
}
