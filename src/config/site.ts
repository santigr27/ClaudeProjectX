export const siteConfig = {
  name: "Raíz",
  tagline: "Encuentra tu próxima propiedad en Bogotá",
  description:
    "Marketplace inmobiliario para comprar, arrendar y valorar propiedades en Bogotá, Colombia.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "es-CO",
  currency: "COP",
};

import type { Terminology } from "./terminology";

/**
 * Real-estate vertical's nav entries. "Comprar"/"Arrendar"/"Estimar" stay
 * fixed for now — a fully category-driven nav is Phase 4 territory, once
 * the generic Category model exists. Only the "sell" label is already
 * terminology-driven, proving the mechanism end to end.
 */
export function getNavigation(terminology: Terminology) {
  return [
    { label: "Comprar", href: "/properties?listingType=sale" },
    { label: "Arrendar", href: "/properties?listingType=rent" },
    { label: terminology.sellAction, href: "/sell" },
    { label: "Estimar propiedad", href: "/estimate" },
    { label: "Favoritos", href: "/favorites" },
  ] as const;
}

export const mapConfig = {
  bogotaCenter: { lat: 4.65, lng: -74.1 } as const,
  defaultZoom: 12,
  minZoom: 10,
  maxZoom: 18,
  tileUrl:
    process.env.NEXT_PUBLIC_MAP_TILE_URL ??
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  tileAttribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

export const searchConfig = {
  pageSize: 12,
  maxPageSize: 48,
};

export const propertyTypeLabels: Record<string, string> = {
  APARTMENT: "Apartamento",
  HOUSE: "Casa",
  STUDIO: "Estudio",
  PENTHOUSE: "Penthouse",
  COMMERCIAL: "Local comercial",
  LOT: "Lote",
};

export const listingTypeLabels: Record<string, string> = {
  SALE: "Venta",
  RENT: "Arriendo",
};

export const amenityCatalog = [
  "Balcón",
  "Ascensor",
  "Vigilancia 24 horas",
  "Gimnasio",
  "Piscina",
  "Terraza",
  "Depósito",
  "Parqueadero de visitantes",
  "Admite mascotas",
] as const;
