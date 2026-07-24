import { cache } from "react";
import { findAllFeatureFlags } from "@/repositories/feature-flag.repository";

/** Recognized flag keys — see prisma/seed.ts for the seeded defaults. */
export const FEATURE_FLAGS = {
  CART: "ENABLE_CART",
  CHECKOUT: "ENABLE_CHECKOUT",
  CONTACT_SELLER: "ENABLE_CONTACT_SELLER",
  FAVORITES: "ENABLE_FAVORITES",
  STORES: "ENABLE_STORES",
  SELLER_APPROVAL: "ENABLE_SELLER_APPROVAL",
  LISTING_MODERATION: "ENABLE_LISTING_MODERATION",
  INVENTORY: "ENABLE_INVENTORY",
  LOCATION: "ENABLE_LOCATION",
  REVIEWS: "ENABLE_REVIEWS",
  AUCTIONS: "ENABLE_AUCTIONS",
} as const;

export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

/** Memoized per request — same rationale as `getMarketplaceConfig`. */
export const getFeatureFlags = cache(async (): Promise<Record<string, boolean>> => {
  const rows = await findAllFeatureFlags();
  return Object.fromEntries(rows.map((row) => [row.key, row.enabled]));
});

export async function isFeatureEnabled(key: FeatureFlagKey): Promise<boolean> {
  const flags = await getFeatureFlags();
  return flags[key] ?? false;
}
