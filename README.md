# Raíz — Bogotá Real Estate Marketplace

A real estate marketplace MVP focused on Bogotá, Colombia: browse properties for
sale/rent, view rich property detail pages, contact agents, and estimate a
property's market value from neighborhood price-per-m² data. Built with
Next.js (App Router), TypeScript, Tailwind CSS, Prisma/PostgreSQL, and
Leaflet + OpenStreetMap.

The visual identity ("Raíz" — Spanish for "root") is original: a terracotta/
forest color system, an in-house SVG mark, and Fraunces/Inter typography.
Zillow was used only as UX inspiration per the brief, not copied.

## 1. Architecture overview

- **Next.js App Router**, mostly Server Components. Client Components are
  used only where interactivity requires them: forms (`useActionState`),
  the Leaflet map, filter widgets, the favorites button, and the mobile nav.
- **Data flow**: `app/**/page.tsx` (Server Components) → `features/*/queries.ts`
  or `features/*/actions.ts` → `repositories/*.ts` (all Prisma access lives
  here) → PostgreSQL. Business logic (valuation math, lead validation,
  WhatsApp link building) lives in `services/*.ts`, independent of both the
  repositories and the UI, so it can be unit-tested and swapped out later.
- **Mutations** are Next.js Server Actions (`"use server"`), validated with
  Zod schemas shared between the action and (where relevant) the client
  form, so client and server never disagree about what's valid.
- **Maps**: Leaflet + OpenStreetMap tiles via `react-leaflet`, dynamically
  imported with `ssr: false` (Leaflet needs `window`). Marker clustering via
  `react-leaflet-cluster`.
- **Images**: property/agent photos are locally generated on-brand
  placeholder PNGs (`scripts/generate-placeholders.mjs` → `public/placeholders/`),
  so the app has zero runtime dependency on a third-party image host. See
  §9 for why, and how to swap in a real photo pipeline.
- **Sessions**: no authentication yet. Favorites are scoped to an anonymous
  UUID stored in an httpOnly cookie (`src/lib/session.ts`), which is enough
  to demo per-visitor favorites without building auth for the MVP.

## 2. Folder structure

```
prisma/
  schema.prisma           Data model (see §3)
  seed.ts                 Deterministic seed: 51 properties, 6 agents, market data
  migrations/
scripts/
  generate-placeholders.mjs  Generates public/placeholders/*.png (run once; committed)
src/
  app/                     Routes (App Router) — thin: fetch + compose components
    page.tsx               Homepage: hero, featured properties, valuation, CTA
    properties/page.tsx    Search: filters + map + list
    properties/[slug]/     Property detail
    sell/page.tsx           Sell/list-your-property form
    estimate/, favorites/, account/
  components/
    ui/                    Design-system primitives (Button, Field, Badge, ...)
    layout/                Header, Footer, Logo, mobile nav
    property/               Cards, gallery, info grid, features, price analysis
    search/                 Hero search, filters bar, sort, pagination, map+list container
    map/                    Leaflet map + marker icon
    valuation/              Valuation calculator + section
    contact/                Contact card, form, mobile sticky bar
    sell/                   Sell form + image-URL input
  features/                 Server Actions and query orchestration per domain
    properties/, valuation/, leads/, sell/, favorites/
  services/                 Business logic, no Prisma/React imports
    valuation.service.ts    Area × price/m² formula + neighborhood comparison
    lead.service.ts         Lead validation + persistence seam
    whatsapp.service.ts     wa.me link builder (swap point for real API)
  repositories/              All Prisma queries live here
  validations/               Zod schemas (shared client/server)
  config/                    site.ts (nav/palette/labels), market-data.mock.ts,
                              nearby-places.mock.ts — the only places with
                              hardcoded reference data
  lib/                       prisma client singleton, currency/format utils,
                              property-math (price-per-m²), session cookie
  types/                     Shared TS types built on Prisma's generated types
  generated/prisma/           Prisma Client output (generated; gitignored)
```

## 3. Database schema

PostgreSQL via Prisma 7 (see `prisma/schema.prisma`). Money fields are
`Float`, not `BigInt` — Next's React Server Component payload protocol and
`JSON.stringify` don't support `bigint`, and a JS `double` is exact for any
realistic COP amount (property prices are far under 2^53).

- **Property** — the listing: type/listing type, price, area, rooms, floor,
  estrato, address/locality/neighborhood, lat/lng, `status`
  (`DRAFT`/`PENDING_REVIEW`/`PUBLISHED`/`REJECTED`), `featured`.
- **PropertyImage** — ordered photos per property.
- **Amenity** / **PropertyAmenity** — many-to-many amenities.
- **Agent** — name/email/phone/whatsapp/photo; owns properties and leads.
- **Lead** — a contact-form or sell-form submission, linked to a property
  and/or agent, with a `status` lifecycle.
- **NeighborhoodMarketData** — the mock price-per-m² dataset that powers
  the valuation calculator and price analysis (`locality` + `neighborhood`
  unique pair → sale/rent price per m²). Clearly marked as mock/demo data
  in `src/config/market-data.mock.ts`.
- **Favorite** — `(propertyId, sessionId)` pair, no auth required.

## 4. Main routes

| Route | Purpose |
|---|---|
| `/` | Homepage: hero search, featured properties, valuation calculator, sell CTA |
| `/properties` | Search: URL-synced filters, sort, pagination, split map/list view |
| `/properties/[slug]` | Property detail: gallery, info, description, features, location, price analysis, contact |
| `/sell` | Submit a property for review |
| `/estimate` | Standalone valuation calculator |
| `/favorites` | Session-scoped saved properties |
| `/account` | Placeholder (auth not built yet) |

`/properties` filters are plain query params
(`?listingType=sale&locality=Chapinero&minPrice=...&bedrooms=2&sort=price_asc&page=2`),
so every search is a shareable, back/forward-navigable URL.

## 5. Setup instructions

Prerequisites: Node 20+, PostgreSQL 14+.

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL for your local Postgres
npx prisma migrate dev      # creates the schema
npm run db:seed             # populates ~51 properties, agents, market data
npm run dev                 # http://localhost:3000
```

Other useful scripts:

```bash
npm run build        # production build
npm run lint          # eslint
npm run typecheck     # tsc --noEmit
npm test              # vitest run
npm run db:studio      # Prisma Studio, browse the DB visually
```

## 6. Environment variables

See `.env.example`. None are secrets required for the MVP to run locally.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `NEXT_PUBLIC_APP_URL` | yes | Used for metadata/OG absolute URLs |
| `NEXT_PUBLIC_MAP_TILE_URL` | yes | OSM tile URL template (defaults to the public OSM tile servers) |
| `NEXT_PUBLIC_IMAGE_HOST` | no | Reserved for a future remote image host |
| `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | no | Unused placeholders for a future WhatsApp Business Cloud API integration (`src/services/whatsapp.service.ts`) |
| `CRM_WEBHOOK_URL` | no | Unused placeholder for a future CRM lead webhook (`src/services/lead.service.ts`) |

## 7. Seed instructions

```bash
npm run db:seed
```

This wraps `prisma db seed` → `tsx prisma/seed.ts`, which:

1. Wipes and reseeds `NeighborhoodMarketData` from
   `src/config/market-data.mock.ts` (37 neighborhoods across 12 localities).
2. Creates 6 agents and the 9 catalog amenities.
3. Deterministically generates 51 properties (seeded PRNG, so the dataset
   is identical every run) — the 14 neighborhoods named in the brief get
   both a sale and a rent listing; the rest get one each — with realistic
   COP prices derived from `areaSqm × neighborhood average × noise`,
   estrato inferred from price tier, and 4–6 local placeholder photos each.

Re-running `db:seed` is always safe; it deletes prior seed-owned rows first
(including anything created by browsing the app, e.g. leads/favorites/
sell submissions) and rebuilds from scratch.

## 8. Test instructions

```bash
npm test
```

Vitest, `src/**/*.test.ts`, currently 32 tests covering the areas the brief
prioritized:

- `lib/property-math.test.ts` — price-per-m² math (incl. zero/negative area).
- `services/valuation.service.test.ts` — the valuation formula, sale vs.
  rent mode, the ±6% range, the price-analysis percentage, and the
  no-market-data error path (repository mocked, no DB needed).
- `repositories/property.repository.test.ts` — the search filter builder
  (`buildWhere`) as a pure function: price/area ranges, bbox, free-text
  search, at-least semantics for rooms.
- `validations/lead.test.ts` + `services/lead.service.test.ts` — contact
  form validation and the submit-lead service (validation short-circuits
  before touching the repository; DB failure surfaces a form error).

No UI/e2e test runner is wired up; UI flows were verified manually via
Playwright during development (gallery lightbox, filters/sort/pagination,
map marker↔card sync, favorites, contact/sell form submit-and-persist,
mobile layouts) rather than committed as an automated suite — see §10.

## 9. Decisions and assumptions

- **Money as `Float`, not `BigInt`.** See §3 — this avoids RSC/JSON
  serialization breakage for a precision tradeoff that doesn't matter at
  COP price scales.
- **Locally generated placeholder images, not a remote host.** The brief
  explicitly allows "remote placeholder images ... or local placeholders."
  This session's sandbox network policy blocks arbitrary third-party
  image hosts (confirmed via the proxy status endpoint), so remote
  placeholders couldn't even be visually verified here — but the bigger
  reason to keep the local version regardless is that it removes a
  third-party runtime dependency and a licensing question entirely, at
  the cost of "generated gradient + house icon" instead of photographs.
  Regenerate via `node scripts/generate-placeholders.mjs`.
- **Images as URLs on `/sell`, not file upload.** There's no object storage
  (S3/Cloudinary/etc.) wired up, and the brief says to avoid unnecessary
  paid APIs. `ImageUrlListInput` is the one swap point for a real upload
  widget later.
- **No authentication.** Favorites use an anonymous per-browser session
  cookie instead. `/account` is a placeholder. This matches the brief's
  "prepare architecture for auth but don't let it block the MVP."
  `Lead.status`/`Property.status` lifecycles are modeled in the schema and
  ready for an admin/reviewer role once auth exists.
- **Free text search** (`?q=`) matches title/address/neighborhood/locality
  via a case-insensitive `contains`, not full-text search — adequate for a
  few dozen listings, not for scale.
- **`price_per_sqm_asc` sort is computed in memory**, not in SQL, since
  price/area isn't a stored column. Fine at MVP data volumes; would need a
  computed/generated column or a materialized view at real scale.

## 10. Known limitations

- **Map tiles need real internet access.** This sandbox's network policy
  blocks `tile.openstreetmap.org` (confirmed via the proxy status
  endpoint), so tiles render as blank gray in this environment, though
  markers/clustering/popups all work. They will load normally on a real
  machine with normal internet access — nothing in the code depends on
  this sandbox.
- **No automated UI/e2e tests are committed** (see §8) — flows were
  verified manually via a throwaway Playwright script during development,
  not checked into the repo as a maintained suite.
- **Geocoding is a fixed placeholder.** `/sell` submissions are stored at
  Bogotá's centroid (lat/lng) since there's no geocoding API wired up; a
  submitted property won't appear at its real location on the map until
  reviewed/corrected.
- **No pagination/virtualization on the map itself** — `/properties`
  fetches one page of results (server-paginated) and plots exactly that
  page's pins; "Buscar en esta área" re-queries by bounding box rather
  than lazily loading more pins as you pan.
- **No image upload, no real WhatsApp/CRM integration, no rate limiting
  on lead submission** — all called out as deliberate MVP scope cuts with
  a stated swap point in §9 and inline service comments.
- **Single locale/currency** (es-CO / COP) and no dark theme — reasonable
  for a Bogotá-only MVP, not currently configurable.

## 11. Recommended next development priorities

1. **Authentication** (agents/owners log in to manage their own listings;
   an admin role to review `PENDING_REVIEW` submissions instead of only
   inspecting them via Prisma Studio).
2. **Real image upload** (S3-compatible storage + `next/image` remote
   loader) to replace the URL-list and placeholder-PNG approach.
3. **A real valuation model.** The current formula (area × neighborhood
   average) is deliberately isolated in `valuation.service.ts` for exactly
   this: swap in comparable-sales analysis, historical transactions, or an
   ML model without touching any calling code.
4. **Geocoding on `/sell`** so submitted addresses map to real coordinates.
5. **CRM/WhatsApp Business API integration** — `lead.service.ts` and
   `whatsapp.service.ts` already isolate this as a single seam.
6. **E2E test suite** (Playwright) codifying the flows that were only
   manually verified: search/filter/map sync, gallery, contact/sell
   submission, favorites.
7. **Full-text/fuzzy search** (e.g. Postgres `tsvector` or a search
   service) once listing volume grows past what `contains` can serve well.
