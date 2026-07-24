/**
 * User-facing marketplace vocabulary. Every vertical (real estate, hardware,
 * a farmers market, ...) speaks about the same underlying concepts —
 * listings, sellers, stores, categories — with different words. Components
 * should never hardcode "Propiedad" or "Agente"; they read these keys
 * instead, so a new vertical only needs a different `terminology` value in
 * `MarketplaceConfig`, never a code change.
 */
export interface Terminology {
  listing: string;
  listingPlural: string;
  seller: string;
  sellerPlural: string;
  store: string;
  storePlural: string;
  category: string;
  categoryPlural: string;
  /** Nav label for the "create a listing" entry point, e.g. "Vender" / "Publicar". */
  sellAction: string;
  /** Primary CTA text on the sell form, e.g. "Publicar propiedad" / "Publicar producto". */
  sellCta: string;
}

export const defaultTerminology: Terminology = {
  listing: "Propiedad",
  listingPlural: "Propiedades",
  seller: "Agente",
  sellerPlural: "Agentes",
  store: "Inmobiliaria",
  storePlural: "Inmobiliarias",
  category: "Tipo de propiedad",
  categoryPlural: "Tipos de propiedad",
  sellAction: "Vender",
  sellCta: "Publicar propiedad",
};

/** Fills in any key missing from a partial DB-stored config with the generic default. */
export function resolveTerminology(overrides: Partial<Terminology> | null | undefined): Terminology {
  return { ...defaultTerminology, ...overrides };
}
