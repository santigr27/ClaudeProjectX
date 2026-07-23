"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { ImageUploadInput } from "./ImageUploadInput";
import {
  submitPropertyAction,
  updatePropertyAction,
  type SellActionState,
} from "@/features/sell/actions";
import { amenityCatalog, propertyTypeLabels } from "@/config/site";
import type { LocalityOption } from "@/repositories/market-data.repository";

const PROPERTY_TYPE_OPTIONS = Object.entries(propertyTypeLabels).map(([value, label]) => ({
  value: value.toLowerCase(),
  label,
}));

const ESTRATO_OPTIONS = [1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) }));

const initialState: SellActionState = {};

function asString(value: string | string[] | undefined, fallback = ""): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export function SellPropertyForm({
  localities,
  mode = "create",
  propertyId,
  initialValues,
  existingImages,
}: {
  localities: LocalityOption[];
  mode?: "create" | "edit";
  propertyId?: string;
  /** Prefills the form on first render when editing an existing property.
   * Once a submission happens, `state.values` (echoed back by the action)
   * takes over so a validation error doesn't wipe what the user typed. */
  initialValues?: Record<string, string | string[]>;
  /** Existing photos (edit mode only) shown read-only above the uploader. */
  existingImages?: { id: string; imageUrl: string }[];
}) {
  const action = mode === "edit" ? updatePropertyAction : submitPropertyAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  // Same pattern as the valuation calculator: a Server Action submission
  // can force this form to remount, so re-derive every default from the
  // last submission's echoed `values` rather than a fixed initial state.
  const [priorState, setPriorState] = useState(state);
  const [submissionId, setSubmissionId] = useState(0);
  if (priorState !== state) {
    setPriorState(state);
    setSubmissionId((id) => id + 1);
  }

  const values = state.values ?? initialValues;
  const [listingType, setListingType] = useState(() => asString(values?.listingType, "sale"));
  const [locality, setLocality] = useState(() => asString(values?.locality));

  const neighborhoodOptions = useMemo(() => {
    return localities.find((option) => option.locality === locality)?.neighborhoods ?? [];
  }, [localities, locality]);

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-accent-100 bg-accent-50 px-6 py-16 text-center">
        <CheckCircle2 className="size-10 text-accent-600" aria-hidden />
        <h2 className="font-display text-2xl font-semibold text-ink-900">
          {mode === "edit" ? "¡Cambios guardados!" : "¡Tu propiedad fue enviada para revisión!"}
        </h2>
        <p className="max-w-md text-ink-600">
          {mode === "edit"
            ? "Actualizamos la información de tu propiedad."
            : "Nuestro equipo revisará la información en las próximas horas. Te contactaremos por correo cuando tu publicación esté activa."}
        </p>
        <Button href="/dashboard" variant="outline">
          Ir a mis propiedades
        </Button>
      </div>
    );
  }

  const selectedAmenities = new Set(
    Array.isArray(values?.amenities) ? values.amenities : values?.amenities ? [values.amenities] : [],
  );

  return (
    <form key={submissionId} action={formAction} className="flex flex-col gap-8">
      {propertyId && <input type="hidden" name="propertyId" value={propertyId} />}
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-ink-900">Tipo de propiedad</h2>
        <input type="hidden" name="listingType" value={listingType} />
        <SegmentedToggle
          name="Tipo de operación"
          value={listingType}
          onChange={setListingType}
          options={[
            { value: "sale", label: "Venta" },
            { value: "rent", label: "Arriendo" },
          ]}
        />
        <Select
          label="Tipo de inmueble"
          name="propertyType"
          options={PROPERTY_TYPE_OPTIONS}
          defaultValue={asString(values?.propertyType, "apartment")}
          error={state.fieldErrors?.propertyType}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-ink-900">Detalles</h2>
        <Input
          label="Título del anuncio"
          name="title"
          placeholder="Ej. Apartamento luminoso en Chicó Norte"
          defaultValue={asString(values?.title)}
          error={state.fieldErrors?.title}
        />
        <Input
          label="Dirección"
          name="address"
          placeholder="Calle 100 # 15-20"
          defaultValue={asString(values?.address)}
          error={state.fieldErrors?.address}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Localidad"
            name="locality"
            options={localities.map((option) => ({ value: option.locality, label: option.locality }))}
            placeholder="Selecciona una localidad"
            value={locality}
            onChange={(event) => setLocality(event.target.value)}
            error={state.fieldErrors?.locality}
          />
          <Select
            key={locality}
            label="Barrio"
            name="neighborhood"
            options={neighborhoodOptions.map((n) => ({ value: n, label: n }))}
            placeholder={locality ? "Selecciona un barrio" : "Elige una localidad primero"}
            defaultValue={asString(values?.neighborhood)}
            error={state.fieldErrors?.neighborhood}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Área (m²)"
            name="areaSqm"
            type="number"
            min={1}
            defaultValue={asString(values?.areaSqm)}
            error={state.fieldErrors?.areaSqm}
          />
          <Select
            label="Estrato"
            name="estrato"
            options={ESTRATO_OPTIONS}
            placeholder="Selecciona"
            defaultValue={asString(values?.estrato)}
            error={state.fieldErrors?.estrato}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Habitaciones"
            name="bedrooms"
            type="number"
            min={0}
            defaultValue={asString(values?.bedrooms, "0")}
          />
          <Input
            label="Baños"
            name="bathrooms"
            type="number"
            min={0}
            defaultValue={asString(values?.bathrooms, "0")}
          />
          <Input
            label="Parqueaderos"
            name="parkingSpaces"
            type="number"
            min={0}
            defaultValue={asString(values?.parkingSpaces, "0")}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-ink-900">Precio</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Precio"
            name="price"
            type="number"
            min={1}
            placeholder="COP"
            defaultValue={asString(values?.price)}
            error={state.fieldErrors?.price}
          />
          <Input
            label="Cuota de administración (opcional)"
            name="administrationFee"
            type="number"
            min={0}
            defaultValue={asString(values?.administrationFee)}
            error={state.fieldErrors?.administrationFee}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-ink-900">Descripción</h2>
        <Textarea
          label="Cuéntanos sobre la propiedad"
          name="description"
          rows={5}
          defaultValue={asString(values?.description)}
          error={state.fieldErrors?.description}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-ink-900">Características</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {amenityCatalog.map((amenity) => (
            <label
              key={amenity}
              className="flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-700"
            >
              <input
                type="checkbox"
                name="amenities"
                value={amenity}
                defaultChecked={selectedAmenities.has(amenity)}
                className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              {amenity}
            </label>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-ink-900">Fotos</h2>
        <ImageUploadInput existingImages={existingImages} />
        {state.fieldErrors?.images && (
          <p role="alert" className="text-sm text-red-600">
            {state.fieldErrors.images}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl font-semibold text-ink-900">Tus datos de contacto</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombre completo"
            name="contactName"
            defaultValue={asString(values?.contactName)}
            error={state.fieldErrors?.contactName}
          />
          <Input
            label="Correo electrónico"
            name="contactEmail"
            type="email"
            defaultValue={asString(values?.contactEmail)}
            error={state.fieldErrors?.contactEmail}
          />
        </div>
        <Input
          label="Teléfono"
          name="contactPhone"
          type="tel"
          placeholder="+57 300 000 0000"
          defaultValue={asString(values?.contactPhone)}
          error={state.fieldErrors?.contactPhone}
        />
      </section>

      {state.formError && (
        <p role="alert" className="text-sm text-red-600">
          {state.formError}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-ink-500">
          {mode === "edit"
            ? "Los datos de contacto no se actualizan desde este formulario."
            : "Al publicar aceptas que la información será revisada antes de aparecer en el sitio."}
        </p>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Guardando..." : mode === "edit" ? "Guardar cambios" : "Publicar propiedad"}
        </Button>
      </div>
    </form>
  );
}

export function SellFormFooterLink() {
  return (
    <Link href="/properties" className="text-sm text-ink-500 underline">
      Ver propiedades publicadas
    </Link>
  );
}
