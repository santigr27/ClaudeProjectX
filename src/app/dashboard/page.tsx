import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Home as HomeIcon, PlusCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { getOwnerDashboardData } from "@/features/properties/queries";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { DashboardPropertyRow } from "@/components/dashboard/DashboardPropertyRow";

export const metadata: Metadata = {
  title: "Mis propiedades",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");

  const { properties, counts } = await getOwnerDashboardData(session.user.id);
  const total = properties.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">
            Hola, {session.user.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-ink-500">Gestiona las propiedades que has publicado en Raíz.</p>
        </div>
        <Button href="/sell">
          <PlusCircle className="size-4" aria-hidden />
          Publicar propiedad
        </Button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-ink-100 bg-white p-4">
          <p className="text-2xl font-semibold text-ink-900">{total}</p>
          <p className="text-sm text-ink-500">Total</p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-4">
          <p className="text-2xl font-semibold text-accent-700">{counts.PUBLISHED}</p>
          <p className="text-sm text-ink-500">Publicadas</p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-4">
          <p className="text-2xl font-semibold text-amber-700">{counts.PENDING_REVIEW}</p>
          <p className="text-sm text-ink-500">En revisión</p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-4">
          <p className="text-2xl font-semibold text-ink-600">{counts.DRAFT}</p>
          <p className="text-sm text-ink-500">Borradores</p>
        </div>
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">Mis propiedades</h2>

      {properties.length === 0 ? (
        <EmptyState
          icon={<HomeIcon className="size-8" aria-hidden />}
          title="Aún no has publicado propiedades"
          description="Publica tu primera propiedad para empezar a recibir contactos de compradores o arrendatarios."
          action={<Button href="/sell">Publicar propiedad</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {properties.map((property) => (
            <DashboardPropertyRow key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
