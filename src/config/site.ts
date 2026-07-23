export const siteConfig = {
  name: "Raíz",
  tagline: "Encuentra tu próxima propiedad en Bogotá",
  description:
    "Marketplace inmobiliario para comprar, arrendar y valorar propiedades en Bogotá, Colombia.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locale: "es-CO",
  currency: "COP",
};

export const navigation = [
  { label: "Comprar", href: "/properties?listingType=sale" },
  { label: "Arrendar", href: "/properties?listingType=rent" },
  { label: "Vender", href: "/sell" },
  { label: "Estimar propiedad", href: "/estimate" },
  { label: "Favoritos", href: "/favorites" },
] as const;

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
