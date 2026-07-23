import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { findOwnedPropertyById } from "@/repositories/property.repository";
import { listLocalitiesWithNeighborhoods } from "@/repositories/market-data.repository";
import { SellPropertyForm } from "@/components/sell/SellPropertyForm";

export const metadata: Metadata = {
  title: "Editar propiedad",
};

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/dashboard/properties/${id}/edit`);

  const [property, localities] = await Promise.all([
    findOwnedPropertyById(id, session.user.id),
    listLocalitiesWithNeighborhoods(),
  ]);

  // Property doesn't exist, or belongs to someone else — notFound() either
  // way so a guessed id never reveals which case it was.
  if (!property) notFound();

  const initialValues: Record<string, string | string[]> = {
    listingType: property.listingType === "SALE" ? "sale" : "rent",
    propertyType: property.propertyType.toLowerCase(),
    title: property.title,
    address: property.address,
    locality: property.locality,
    neighborhood: property.neighborhood,
    areaSqm: String(property.areaSqm),
    estrato: property.estrato ? String(property.estrato) : "",
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    parkingSpaces: String(property.parkingSpaces),
    price: String(property.price),
    administrationFee: property.administrationFee ? String(property.administrationFee) : "",
    description: property.description,
    amenities: property.amenities.map((item) => item.amenity.name),
    images: property.images.map((image) => image.imageUrl),
    contactName: property.agent?.name ?? "",
    contactEmail: property.agent?.email ?? "",
    contactPhone: property.agent?.phone ?? "",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink-900">Editar propiedad</h1>
        <p className="mt-2 text-ink-500">Actualiza la información de «{property.title}».</p>
      </div>

      <SellPropertyForm
        localities={localities}
        mode="edit"
        propertyId={property.id}
        initialValues={initialValues}
      />
    </div>
  );
}
