import Image from "next/image";
import { HeroSearch } from "./HeroSearch";
import { getMarketplaceConfig } from "@/features/marketplace/config";

/**
 * Text comes entirely from MarketplaceConfig now — a new vertical only
 * needs to change its tagline/description/country, not this file. The
 * background photo is still a fixed asset (swap
 * public/placeholders/hero-bogota.png for your own vertical's hero image);
 * making that admin-configurable too is a natural follow-up once
 * /admin/branding supports image uploads.
 */
export async function Hero() {
  const config = await getMarketplaceConfig();

  return (
    <section className="relative isolate overflow-hidden bg-ink-900">
      <Image
        src="/placeholders/hero-bogota.png"
        alt=""
        fill
        priority
        className="object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/60 to-ink-900/20" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-start px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        {config.country && (
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-300">
            {config.country}
          </p>
        )}
        <h1 className="max-w-2xl font-display text-4xl font-semibold text-white sm:text-5xl">
          {config.tagline}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/80">{config.description}</p>

        <div className="mt-8 w-full">
          <HeroSearch />
        </div>
      </div>
    </section>
  );
}
