import { cache } from "react";
import { findMarketplaceConfig } from "@/repositories/marketplace-config.repository";
import { resolveTerminology, type Terminology } from "@/config/terminology";
import { siteConfig } from "@/config/site";

export interface ResolvedMarketplaceConfig {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  currency: string;
  locale: string;
  country: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  terminology: Terminology;
}

const FALLBACK: ResolvedMarketplaceConfig = {
  name: siteConfig.name,
  slug: "raiz",
  tagline: siteConfig.tagline,
  description: siteConfig.description,
  logoUrl: null,
  faviconUrl: null,
  primaryColor: "#1d4ed8",
  secondaryColor: "#0f172a",
  accentColor: "#2f7d57",
  backgroundColor: "#f8fafc",
  currency: siteConfig.currency,
  locale: siteConfig.locale,
  country: "Colombia",
  supportEmail: null,
  supportPhone: null,
  terminology: resolveTerminology(null),
};

/**
 * Memoized per request (React `cache`), same pattern as `auth()` — every
 * server component that needs branding/terminology can call this freely
 * without issuing repeat queries in the same render pass. Falls back to the
 * original Raíz defaults if the config row is ever missing (fresh DB before
 * seeding, or a deployment that hasn't run the seed yet).
 */
export const getMarketplaceConfig = cache(async (): Promise<ResolvedMarketplaceConfig> => {
  const row = await findMarketplaceConfig();
  if (!row) return FALLBACK;

  return {
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    description: row.description,
    logoUrl: row.logoUrl,
    faviconUrl: row.faviconUrl,
    primaryColor: row.primaryColor,
    secondaryColor: row.secondaryColor,
    accentColor: row.accentColor,
    backgroundColor: row.backgroundColor,
    currency: row.defaultCurrency,
    locale: row.defaultLocale,
    country: row.country,
    supportEmail: row.supportEmail,
    supportPhone: row.supportPhone,
    terminology: resolveTerminology((row.terminology as Partial<Terminology> | null) ?? undefined),
  };
});
