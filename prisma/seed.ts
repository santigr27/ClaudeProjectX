/**
 * Seeds the database with realistic MOCK Bogotá real estate data:
 * neighborhood market averages, agents, amenities, and 50+ properties.
 * Run with `npm run db:seed` (wraps `prisma db seed`).
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { mockNeighborhoodMarketData } from "../src/config/market-data.mock";
import { amenityCatalog } from "../src/config/site";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Deterministic PRNG so the seed produces the same dataset on every run.
function mulberry32(seed: number) {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(20240601);

function pickN<T>(items: readonly T[], min: number, max: number): T[] {
  const count = Math.min(items.length, min + Math.floor(random() * (max - min + 1)));
  const pool = [...items];
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    const index = Math.floor(random() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }
  return result;
}

function randomInt(min: number, max: number): number {
  return Math.floor(min + random() * (max - min + 1));
}

function roundTo(value: number, nearest: number): number {
  return Math.round(value / nearest) * nearest;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Approximate coordinates per neighborhood, used only to give the map
// realistic marker positions. Not surveyed/official geodata.
const NEIGHBORHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  "Chicó": { lat: 4.6685, lng: -74.054 },
  "Chicó Norte": { lat: 4.674, lng: -74.051 },
  Rosales: { lat: 4.657, lng: -74.053 },
  "Chapinero Alto": { lat: 4.647, lng: -74.06 },
  "La Cabrera": { lat: 4.664, lng: -74.055 },
  "El Nogal": { lat: 4.665, lng: -74.049 },
  "Parque de la 93": { lat: 4.6765, lng: -74.053 },
  "Chapinero Central": { lat: 4.644, lng: -74.064 },
  Cedritos: { lat: 4.716, lng: -74.035 },
  "Santa Bárbara": { lat: 4.692, lng: -74.033 },
  "Usaquén": { lat: 4.696, lng: -74.03 },
  "Bella Suiza": { lat: 4.704, lng: -74.039 },
  "Country Club": { lat: 4.71, lng: -74.045 },
  "Santa Ana": { lat: 4.72, lng: -74.04 },
  "Colina Campestre": { lat: 4.698, lng: -74.07 },
  Niza: { lat: 4.715, lng: -74.073 },
  "Suba Rincón": { lat: 4.745, lng: -74.093 },
  "Batán": { lat: 4.7, lng: -74.068 },
  Salitre: { lat: 4.658, lng: -74.106 },
  Modelia: { lat: 4.662, lng: -74.115 },
  "Fontibón Centro": { lat: 4.678, lng: -74.145 },
  Teusaquillo: { lat: 4.639, lng: -74.089 },
  "Quinta Camacho": { lat: 4.654, lng: -74.063 },
  "La Soledad": { lat: 4.642, lng: -74.094 },
  "Los Andes": { lat: 4.668, lng: -74.072 },
  "Doce de Octubre": { lat: 4.672, lng: -74.079 },
  "Engativá": { lat: 4.708, lng: -74.115 },
  Bolivia: { lat: 4.715, lng: -74.105 },
  "Santa Cecilia": { lat: 4.7, lng: -74.12 },
  "Kennedy Central": { lat: 4.628, lng: -74.152 },
  Timiza: { lat: 4.618, lng: -74.158 },
  "Puente Aranda": { lat: 4.632, lng: -74.108 },
  "Muzú": { lat: 4.622, lng: -74.115 },
  "La Candelaria": { lat: 4.596, lng: -74.074 },
  "Centro Internacional": { lat: 4.614, lng: -74.07 },
  Lucero: { lat: 4.555, lng: -74.16 },
  "Diana Turbay": { lat: 4.565, lng: -74.1 },
};

const PROPERTY_TYPE_WEIGHTS: { type: "APARTMENT" | "HOUSE" | "STUDIO" | "PENTHOUSE" | "COMMERCIAL" | "LOT"; weight: number }[] = [
  { type: "APARTMENT", weight: 55 },
  { type: "HOUSE", weight: 20 },
  { type: "STUDIO", weight: 10 },
  { type: "PENTHOUSE", weight: 8 },
  { type: "COMMERCIAL", weight: 5 },
  { type: "LOT", weight: 2 },
];

function pickPropertyType() {
  const total = PROPERTY_TYPE_WEIGHTS.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = random() * total;
  for (const entry of PROPERTY_TYPE_WEIGHTS) {
    if (roll < entry.weight) return entry.type;
    roll -= entry.weight;
  }
  return "APARTMENT" as const;
}

const TYPE_LABELS_ES: Record<string, string> = {
  APARTMENT: "Apartamento",
  HOUSE: "Casa",
  STUDIO: "Apartaestudio",
  PENTHOUSE: "Penthouse",
  COMMERCIAL: "Local comercial",
  LOT: "Lote",
};

function areaRangeFor(type: string): [number, number] {
  switch (type) {
    case "STUDIO":
      return [28, 45];
    case "APARTMENT":
      return [45, 160];
    case "PENTHOUSE":
      return [150, 300];
    case "HOUSE":
      return [120, 360];
    case "COMMERCIAL":
      return [50, 220];
    case "LOT":
      return [200, 900];
    default:
      return [50, 150];
  }
}

function roomsFor(type: string, areaSqm: number) {
  if (type === "STUDIO") return { bedrooms: 1, bathrooms: 1, parkingSpaces: randomInt(0, 1) };
  if (type === "LOT") return { bedrooms: 0, bathrooms: 0, parkingSpaces: 0 };
  if (type === "COMMERCIAL") return { bedrooms: 0, bathrooms: randomInt(1, 2), parkingSpaces: randomInt(0, 3) };

  const bedrooms = areaSqm > 220 ? randomInt(3, 5) : areaSqm > 100 ? randomInt(2, 4) : randomInt(1, 3);
  const bathrooms = Math.max(1, bedrooms - randomInt(0, 1));
  const parkingSpaces = randomInt(0, type === "PENTHOUSE" ? 3 : 2);
  return { bedrooms, bathrooms, parkingSpaces };
}

function estrateFor(pricePerSqm: number): number {
  if (pricePerSqm >= 8_500_000) return 6;
  if (pricePerSqm >= 6_500_000) return 5;
  if (pricePerSqm >= 4_500_000) return 4;
  if (pricePerSqm >= 3_000_000) return 3;
  return 2;
}

function descriptionFor(params: {
  typeLabel: string;
  neighborhood: string;
  locality: string;
  listingLabel: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
}) {
  const { typeLabel, neighborhood, locality, listingLabel, bedrooms, bathrooms, areaSqm } = params;
  const roomsPhrase =
    bedrooms > 0
      ? `${bedrooms} habitaciones y ${bathrooms} baños distribuidos en ${areaSqm} m²`
      : `${areaSqm} m² de área privada`;
  return (
    `${typeLabel} disponible para ${listingLabel.toLowerCase()} en el corazón de ${neighborhood}, ` +
    `${locality}. Cuenta con ${roomsPhrase}, acabados de calidad y excelente ubicación cerca de vías ` +
    `principales, comercio y transporte público. Una oportunidad ideal para quienes buscan vivir o ` +
    `invertir en una de las zonas más atractivas de Bogotá.`
  );
}

const AGENTS = [
  { name: "María Fernanda Rojas", email: "maria.rojas@raiz-demo.co", phone: "+57 301 555 0110" },
  { name: "Camilo Andrés Torres", email: "camilo.torres@raiz-demo.co", phone: "+57 312 555 0122" },
  { name: "Laura Valentina Gómez", email: "laura.gomez@raiz-demo.co", phone: "+57 320 555 0134" },
  { name: "Julián David Peña", email: "julian.pena@raiz-demo.co", phone: "+57 315 555 0146" },
  { name: "Daniela Castillo Ríos", email: "daniela.castillo@raiz-demo.co", phone: "+57 300 555 0158" },
  { name: "Sebastián Ortiz Mora", email: "sebastian.ortiz@raiz-demo.co", phone: "+57 318 555 0170" },
];

const DEFAULT_MARKETPLACE_CONFIG = {
  slug: "raiz",
  name: "Raíz",
  tagline: "Encuentra tu próxima propiedad en Bogotá",
  description:
    "Marketplace inmobiliario para comprar, arrendar y valorar propiedades en Bogotá, Colombia.",
  primaryColor: "#1d4ed8",
  secondaryColor: "#0f172a",
  accentColor: "#2f7d57",
  backgroundColor: "#f8fafc",
  defaultCurrency: "COP",
  defaultLocale: "es-CO",
  country: "Colombia",
  marketplaceType: "real_estate",
  terminology: {
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
  },
};

// Sensible module defaults for the real-estate vertical; a hardware/food
// marketplace built on the same core would flip CART/CHECKOUT/INVENTORY on
// and LOCATION-specific ones off, purely through this table — no code change.
const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  ENABLE_CART: false,
  ENABLE_CHECKOUT: false,
  ENABLE_CONTACT_SELLER: true,
  ENABLE_FAVORITES: true,
  ENABLE_STORES: false,
  ENABLE_SELLER_APPROVAL: false,
  ENABLE_LISTING_MODERATION: true,
  ENABLE_INVENTORY: false,
  ENABLE_LOCATION: true,
  ENABLE_REVIEWS: false,
  ENABLE_AUCTIONS: false,
};

// Real-estate attributes map onto EXISTING Property columns via `nativeField`
// instead of being written to ListingAttributeValue — see
// prisma/schema.prisma AttributeDefinition.nativeField for why. A new
// vertical (e.g. hardware) would omit nativeField and use true EAV storage.
const REAL_ESTATE_ATTRIBUTES = {
  bedrooms: { name: "Habitaciones", dataType: "NUMBER", nativeField: "bedrooms", filterable: true },
  bathrooms: { name: "Baños", dataType: "NUMBER", nativeField: "bathrooms", filterable: true },
  parkingSpaces: {
    name: "Parqueaderos",
    dataType: "NUMBER",
    nativeField: "parkingSpaces",
    filterable: true,
  },
  areaSqm: { name: "Área", dataType: "NUMBER", nativeField: "areaSqm", unit: "m²", filterable: true },
  estrato: { name: "Estrato", dataType: "NUMBER", nativeField: "estrato", filterable: true },
} as const;

const REAL_ESTATE_CATEGORIES: Array<{
  slug: string;
  name: string;
  nativeValue: string;
  attributeKeys: (keyof typeof REAL_ESTATE_ATTRIBUTES)[];
}> = [
  {
    slug: "apartamento",
    name: "Apartamento",
    nativeValue: "APARTMENT",
    attributeKeys: ["bedrooms", "bathrooms", "parkingSpaces", "areaSqm", "estrato"],
  },
  {
    slug: "casa",
    name: "Casa",
    nativeValue: "HOUSE",
    attributeKeys: ["bedrooms", "bathrooms", "parkingSpaces", "areaSqm", "estrato"],
  },
  { slug: "estudio", name: "Estudio", nativeValue: "STUDIO", attributeKeys: ["bathrooms", "areaSqm"] },
  {
    slug: "penthouse",
    name: "Penthouse",
    nativeValue: "PENTHOUSE",
    attributeKeys: ["bedrooms", "bathrooms", "parkingSpaces", "areaSqm", "estrato"],
  },
  {
    slug: "local-comercial",
    name: "Local comercial",
    nativeValue: "COMMERCIAL",
    attributeKeys: ["areaSqm", "parkingSpaces"],
  },
  { slug: "lote", name: "Lote", nativeValue: "LOT", attributeKeys: ["areaSqm"] },
];

// Proof-of-concept second vertical (spec section 43/48.20): a category with
// NO native equivalent — none of its attributes have `nativeField`, so every
// value is true EAV storage in ListingAttributeValue, and it has no
// nativeValue itself, so it never appears in the real-estate propertyType
// filters/sell-form dropdown mapping. Demonstrates the same
// category/attribute engine works for a completely different product type
// without a single code change — only this seed data differs.
const CARROS_ATTRIBUTES: Array<{
  key: string;
  name: string;
  dataType: "TEXT" | "NUMBER" | "SELECT";
  unit?: string;
  options?: string[];
  filterable: boolean;
}> = [
  { key: "marca", name: "Marca", dataType: "TEXT", filterable: true },
  { key: "modelo", name: "Modelo", dataType: "TEXT", filterable: false },
  { key: "anio", name: "Año", dataType: "NUMBER", filterable: true },
  { key: "kilometraje", name: "Kilometraje", dataType: "NUMBER", unit: "km", filterable: true },
  {
    key: "combustible",
    name: "Combustible",
    dataType: "SELECT",
    options: ["Gasolina", "Diésel", "Híbrido", "Eléctrico"],
    filterable: true,
  },
];

async function main() {
  console.log("Seeding database...");

  // Idempotent: never overwrites an existing config/flag, so re-running the
  // seed to refresh demo listings doesn't clobber branding an admin already
  // configured through /admin/branding or /admin/settings.
  const existingConfig = await prisma.marketplaceConfig.findFirst();
  if (!existingConfig) {
    await prisma.marketplaceConfig.create({ data: DEFAULT_MARKETPLACE_CONFIG });
    console.log("Seeded default marketplace config (Raíz).");
  }
  for (const [key, enabled] of Object.entries(DEFAULT_FEATURE_FLAGS)) {
    await prisma.featureFlag.upsert({ where: { key }, update: {}, create: { key, enabled } });
  }
  console.log(`Ensured ${Object.keys(DEFAULT_FEATURE_FLAGS).length} feature flags exist.`);

  for (const [index, categoryDef] of REAL_ESTATE_CATEGORIES.entries()) {
    const category = await prisma.category.upsert({
      where: { slug: categoryDef.slug },
      update: { nativeValue: categoryDef.nativeValue },
      create: {
        slug: categoryDef.slug,
        name: categoryDef.name,
        nativeValue: categoryDef.nativeValue,
        sortOrder: index,
      },
    });

    for (const [attrIndex, attrKey] of categoryDef.attributeKeys.entries()) {
      const attribute = REAL_ESTATE_ATTRIBUTES[attrKey];
      await prisma.attributeDefinition.upsert({
        where: { categoryId_key: { categoryId: category.id, key: attrKey } },
        update: {},
        create: {
          categoryId: category.id,
          key: attrKey,
          name: attribute.name,
          dataType: attribute.dataType,
          unit: "unit" in attribute ? attribute.unit : null,
          filterable: attribute.filterable,
          nativeField: attribute.nativeField,
          sortOrder: attrIndex,
        },
      });
    }
  }
  console.log(`Ensured ${REAL_ESTATE_CATEGORIES.length} real-estate categories exist.`);

  const carrosCategory = await prisma.category.upsert({
    where: { slug: "carros" },
    update: {},
    create: {
      slug: "carros",
      name: "Carros",
      sortOrder: REAL_ESTATE_CATEGORIES.length,
    },
  });
  for (const [attrIndex, attribute] of CARROS_ATTRIBUTES.entries()) {
    await prisma.attributeDefinition.upsert({
      where: { categoryId_key: { categoryId: carrosCategory.id, key: attribute.key } },
      update: {},
      create: {
        categoryId: carrosCategory.id,
        key: attribute.key,
        name: attribute.name,
        dataType: attribute.dataType,
        unit: attribute.unit ?? null,
        options: attribute.options ?? undefined,
        filterable: attribute.filterable,
        sortOrder: attrIndex,
      },
    });
  }
  console.log('Ensured "Carros" proof-of-concept category exists (no native equivalent).');

  const categoryIdByNativeValue = new Map(
    (await prisma.category.findMany({ where: { nativeValue: { not: null } } })).map((category) => [
      category.nativeValue,
      category.id,
    ]),
  );

  await prisma.favorite.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.neighborhoodMarketData.deleteMany();
  await prisma.user.deleteMany();

  await prisma.neighborhoodMarketData.createMany({ data: mockNeighborhoodMarketData });
  console.log(`Seeded ${mockNeighborhoodMarketData.length} neighborhood market data rows.`);

  const amenities = await Promise.all(
    amenityCatalog.map((name) => prisma.amenity.create({ data: { name } })),
  );

  const agents = await Promise.all(
    AGENTS.map((agent, index) =>
      prisma.sellerProfile.create({
        data: {
          ...agent,
          whatsapp: agent.phone,
          imageUrl: `/placeholders/agent-${index % 6}.png`,
          title: "Asesor inmobiliario",
        },
      }),
    ),
  );

  const highlightNeighborhoods = new Set([
    "Chicó",
    "Chicó Norte",
    "Rosales",
    "Chapinero Alto",
    "Cedritos",
    "Santa Bárbara",
    "Usaquén",
    "Bella Suiza",
    "Colina Campestre",
    "Salitre",
    "Modelia",
    "La Cabrera",
    "El Nogal",
    "Parque de la 93",
  ]);

  let featuredCount = 0;
  let propertyIndex = 0;

  for (const marketPoint of mockNeighborhoodMarketData) {
    const isHighlight = highlightNeighborhoods.has(marketPoint.neighborhood);
    const listingsForNeighborhood: Array<"SALE" | "RENT"> = isHighlight
      ? ["SALE", "RENT"]
      : [propertyIndex % 2 === 0 ? "SALE" : "RENT"];

    for (const listingType of listingsForNeighborhood) {
      propertyIndex += 1;

      const propertyType = pickPropertyType();
      const typeLabel = TYPE_LABELS_ES[propertyType];
      const [minArea, maxArea] = areaRangeFor(propertyType);
      const areaSqm = randomInt(minArea, maxArea);
      const { bedrooms, bathrooms, parkingSpaces } = roomsFor(propertyType, areaSqm);

      const basePricePerSqm =
        listingType === "SALE" ? marketPoint.salePricePerSqm : marketPoint.rentPricePerSqm;
      const priceVariance = 0.9 + random() * 0.24; // +/-10-12% around the neighborhood average
      const pricePerSqmForListing = basePricePerSqm * priceVariance;
      const rawPrice = areaSqm * pricePerSqmForListing;
      const price = listingType === "SALE" ? roundTo(rawPrice, 1_000_000) : roundTo(rawPrice, 10_000);

      const administrationFee =
        propertyType === "APARTMENT" || propertyType === "PENTHOUSE"
          ? roundTo(areaSqm * randomInt(3500, 6000), 10_000)
          : null;

      const coords = NEIGHBORHOOD_COORDS[marketPoint.neighborhood] ?? { lat: 4.65, lng: -74.1 };
      const jitter = () => (random() - 0.5) * 0.006;

      const listingLabel = listingType === "SALE" ? "Venta" : "Arriendo";
      const title = `${typeLabel} en ${marketPoint.neighborhood}, ${listingLabel.toLowerCase()}`;
      const slug = `${slugify(`${typeLabel}-${marketPoint.neighborhood}-${areaSqm}m2`)}-${propertyIndex}`;

      const isFeatured = isHighlight && featuredCount < 6 && listingType === "SALE";
      if (isFeatured) featuredCount += 1;

      const agent = agents[propertyIndex % agents.length];
      const selectedAmenities =
        propertyType === "LOT" ? [] : pickN(amenities, 2, Math.min(5, amenities.length));
      const imageCount = randomInt(4, 6);

      await prisma.listing.create({
        data: {
          slug,
          title,
          description: descriptionFor({
            typeLabel,
            neighborhood: marketPoint.neighborhood,
            locality: marketPoint.locality,
            listingLabel,
            bedrooms,
            bathrooms,
            areaSqm,
          }),
          listingType,
          propertyType,
          categoryId: categoryIdByNativeValue.get(propertyType) ?? null,
          price,
          administrationFee,
          areaSqm,
          bedrooms,
          bathrooms,
          parkingSpaces,
          estrato: estrateFor(basePricePerSqm),
          floor: propertyType === "APARTMENT" || propertyType === "PENTHOUSE" ? randomInt(1, 20) : null,
          propertyAge: randomInt(0, 30),
          address: `Calle ${randomInt(60, 145)} # ${randomInt(5, 30)}-${randomInt(10, 90)}, ${marketPoint.neighborhood}`,
          locality: marketPoint.locality,
          neighborhood: marketPoint.neighborhood,
          latitude: coords.lat + jitter(),
          longitude: coords.lng + jitter(),
          status: "PUBLISHED",
          featured: isFeatured,
          agentId: agent.id,
          images: {
            create: Array.from({ length: imageCount }, (_, imageIndex) => ({
              imageUrl: `/placeholders/property-${(propertyIndex * 3 + imageIndex) % 12}.png`,
              sortOrder: imageIndex,
              alt: `${title} - foto ${imageIndex + 1}`,
            })),
          },
          amenities: {
            create: selectedAmenities.map((amenity) => ({ amenityId: amenity.id })),
          },
        },
      });
    }
  }

  console.log(`Seeded ${propertyIndex} properties across ${mockNeighborhoodMarketData.length} neighborhoods.`);
  console.log(`Seeded ${agents.length} agents and ${amenities.length} amenities.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
