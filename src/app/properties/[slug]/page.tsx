import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { getPropertyDetail } from "@/features/properties/queries";
import { getFavoritedIdsForCurrentSession } from "@/features/favorites/queries";
import { comparePriceToNeighborhoodAverage } from "@/services/valuation.service";
import { generateMockNearbyPlaces } from "@/config/nearby-places.mock";
import { listingTypeLabels, siteConfig } from "@/config/site";
import { formatCOP } from "@/lib/currency";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyInfoGrid } from "@/components/property/PropertyInfoGrid";
import { AttributeValueList } from "@/components/property/AttributeValueList";
import { PropertyFeatures } from "@/components/property/PropertyFeatures";
import { PriceAnalysis } from "@/components/property/PriceAnalysis";
import { NearbyPlaces } from "@/components/property/NearbyPlaces";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { ContactCard } from "@/components/contact/ContactCard";
import { MobileContactBar } from "@/components/contact/MobileContactBar";
import { PropertyLocationMapLoader as PropertyLocationMap } from "@/components/property/PropertyLocationMapLoader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyDetail(slug);
  if (!property) return { title: "Propiedad no encontrada" };

  const typeLabel = property.category?.name ?? "Anuncio";
  const locationLabel = [property.neighborhood, property.locality].filter(Boolean).join(", ");
  const areaLabel = property.areaSqm ? `${property.areaSqm} m², ` : "";
  const bedroomsLabel = property.bedrooms > 0 ? `${property.bedrooms} habitaciones, ` : "";
  const description =
    `${typeLabel} en ${listingTypeLabels[property.listingType].toLowerCase()}` +
    (locationLabel ? ` en ${locationLabel}` : "") +
    `. ${areaLabel}${bedroomsLabel}${formatCOP(property.price)}.`;

  return {
    title: property.title,
    description,
    openGraph: {
      title: property.title,
      description,
      images: property.images[0] ? [property.images[0].imageUrl] : [],
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyDetail(slug);
  if (!property) notFound();

  const hasLocationData = Boolean(property.locality && property.neighborhood && property.areaSqm);

  const [priceAnalysis, favoritedIds] = await Promise.all([
    hasLocationData
      ? comparePriceToNeighborhoodAverage({
          locality: property.locality!,
          neighborhood: property.neighborhood!,
          listingType: property.listingType === "SALE" ? "sale" : "rent",
          price: property.price,
          areaSqm: property.areaSqm!,
        })
      : Promise.resolve(null),
    getFavoritedIdsForCurrentSession(),
  ]);

  const nearbyPlaces = generateMockNearbyPlaces(property.slug);
  const amenityNames = property.amenities.map((item) => item.amenity.name);
  const hasCoordinates = property.latitude !== null && property.longitude !== null;
  const locationLine = [property.address, property.neighborhood, property.locality]
    .filter(Boolean)
    .join(", ");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `${siteConfig.url}/properties/${property.slug}`,
    image: property.images.map((image) => image.imageUrl),
    ...(property.address && property.neighborhood && property.locality
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: property.address,
            addressLocality: property.neighborhood,
            addressRegion: property.locality,
            addressCountry: "CO",
          },
        }
      : {}),
    ...(hasCoordinates
      ? { geo: { "@type": "GeoCoordinates", latitude: property.latitude, longitude: property.longitude } }
      : {}),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "COP",
      businessFunction: property.listingType === "SALE" ? "http://purl.org/goodrelations/v1#Sell" : "http://purl.org/goodrelations/v1#LeaseOut",
    },
  };

  return (
    <div className="pb-24 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <PropertyGallery images={property.images} title={property.title} />
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{property.title}</h1>
                {locationLine && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
                    <MapPin className="size-4" aria-hidden />
                    {locationLine}
                  </p>
                )}
              </div>
              <FavoriteButton propertyId={property.id} initialFavorited={favoritedIds.has(property.id)} />
            </div>

            <p className="mt-4 font-display text-3xl font-semibold text-brand-700">
              {formatCOP(property.price)}
              {property.listingType === "RENT" && <span className="text-lg font-normal text-ink-400">/mes</span>}
            </p>
          </div>

          <PropertyInfoGrid property={property} />

          {property.attributeValues.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">Detalles</h2>
              <AttributeValueList attributeValues={property.attributeValues} />
            </section>
          )}

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">Descripción</h2>
            <p className="whitespace-pre-line leading-relaxed text-ink-600">{property.description}</p>
          </section>

          {amenityNames.length > 0 && (
            <section>
              <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">Características</h2>
              <PropertyFeatures amenities={amenityNames} />
            </section>
          )}

          {hasCoordinates && (
            <section>
              <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">Ubicación</h2>
              <PropertyLocationMap latitude={property.latitude!} longitude={property.longitude!} />
              <p className="mt-3 mb-2 text-sm font-medium text-ink-700">Puntos de interés cercanos</p>
              <NearbyPlaces places={nearbyPlaces} />
            </section>
          )}

          {priceAnalysis && property.neighborhood && (
            <PriceAnalysis analysis={priceAnalysis} neighborhood={property.neighborhood} />
          )}
        </div>

        <div id="contact-form" className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <ContactCard seller={property.seller} propertyId={property.id} propertyTitle={property.title} />
          </div>
        </div>
      </div>

      <MobileContactBar seller={property.seller} propertyTitle={property.title} />
    </div>
  );
}
