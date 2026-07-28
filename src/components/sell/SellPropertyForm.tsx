"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { ImageUploadInput } from "./ImageUploadInput";
import { AttributeField } from "./AttributeField";
import {
  submitPropertyAction,
  updatePropertyAction,
  type SellActionState,
} from "@/features/sell/actions";
import { amenityCatalog } from "@/config/site";
import type { LocalityOption } from "@/repositories/market-data.repository";
import type { findActiveTopLevelCategories } from "@/repositories/category.repository";

const ESTRATO_OPTIONS = [1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) }));

type CategoryWithAttributes = Awaited<ReturnType<typeof findActiveTopLevelCategories>>[number];

const initialState: SellActionState = {};

function asString(value: string | string[] | undefined, fallback = ""): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

export function SellPropertyForm({
  localities,
  categories,
  locationEnabled = true,
  mode = "create",
  propertyId,
  initialValues,
  existingImages,
  sellCta = "Publicar propiedad",
  categoryLabel = "Tipo de propiedad",
  listingLower = "propiedad",
  listingPluralLower = "propiedades",
}: {
  localities: LocalityOption[];
  /** Drives the "Tipo de inmueble" options and which fields below are
   * shown/hidden — see AttributeDefinition.nativeField. A category with no
   * "bedrooms" attribute (e.g. Lote) simply never renders that input.
   * Includes categories with no native equivalent too (e.g. a "Carros"
   * category created purely through /admin/categories). */
  categories: CategoryWithAttributes[];
  /** ENABLE_LOCATION feature flag — hides address/locality/neighborhood
   * entirely for a marketplace whose listings don't have a location (a
   * phone, for instance), rather than just leaving them optional. */
  locationEnabled?: boolean;
  mode?: "create" | "edit";
  propertyId?: string;
  /** Prefills the form on first render when editing an existing property.
   * Once a submission happens, `state.values` (echoed back by the action)
   * takes over so a validation error doesn't wipe what the user typed. */
  initialValues?: Record<string, string | string[]>;
  /** Existing photos (edit mode only) shown read-only above the uploader. */
  existingImages?: { id: string; imageUrl: string }[];
  /** Marketplace-configured label for the publish CTA (create mode only). */
  sellCta?: string;
  /** terminology.category — e.g. "Tipo de propiedad" / "Tipo de vehículo". */
  categoryLabel?: string;
  /** terminology.listing/listingPlural, lowercased — this form's chrome
   * (section headings, success message) is otherwise a real-estate-only
   * "propiedad" regardless of which vertical's category is selected. */
  listingLower?: string;
  listingPluralLower?: string;
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
  const [categoryId, setCategoryId] = useState(() => asString(values?.categoryId, categories[0]?.id ?? ""));

  const neighborhoodOptions = useMemo(() => {
    return localities.find((option) => option.locality === locality)?.neighborhoods ?? [];
  }, [localities, locality]);

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories],
  );

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId],
  );

  // Which native fields the selected category actually uses — e.g. "Lote"
  // has no bedrooms/bathrooms/parkingSpaces/estrato attribute, so those
  // inputs simply don't render below. Custom (non-native) attributes for
  // this category render generically in their own section further down.
  const nativeFieldKeys = useMemo(
    () => new Set(selectedCategory?.attributes.map((attribute) => attribute.nativeField).filter(Boolean)),
    [selectedCategory],
  );
  const extraAttributes = useMemo(
    () => selectedCategory?.attributes.filter((attribute) => !attribute.nativeField) ?? [],
    [selectedCategory],
  );

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-accent-100 bg-accent-50 px-6 py-16 text-center">
        <CheckCircle2 className="size-10 text-accent-600" aria-hidden />
        <h2 className="font-display text-2xl font-semibold text-ink-900">
          {mode === "edit" ? "¡Cambios guardados!" : "¡Tu publicación fue enviada para revisión!"}
        </h2>
        <p className="max-w-md text-ink-600">
          {mode === "edit"
            ? "Actualizamos la información de tu publicación."
            : "Nuestro equipo revisará la información en las próximas horas. Te contactaremos por correo cuando tu publicación esté activa."}
        </p>
        <Button href="/dashboard" variant="outline">
          Ir a mis {listingPluralLower}
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
        <h2 className="font-display text-xl font-semibold text-ink-900">{categoryLabel}</h2>
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
          label="Tipo"
          name="categoryId"
          options={categoryOptions}
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          error={state.fieldErrors?.categoryId}
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
        {locationEnabled && (
          <>
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
          </>
        )}

        {(nativeFieldKeys.has("areaSqm") || nativeFieldKeys.has("estrato")) && (
          <div className="grid gap-4 sm:grid-cols-3">
            {nativeFieldKeys.has("areaSqm") && (
              <Input
                label="Área (m²)"
                name="areaSqm"
                type="number"
                min={1}
                defaultValue={asString(values?.areaSqm)}
                error={state.fieldErrors?.areaSqm}
              />
            )}
            {nativeFieldKeys.has("estrato") && (
              <Select
                label="Estrato"
                name="estrato"
                options={ESTRATO_OPTIONS}
                placeholder="Selecciona"
                defaultValue={asString(values?.estrato)}
                error={state.fieldErrors?.estrato}
              />
            )}
          </div>
        )}

        {(nativeFieldKeys.has("bedrooms") ||
          nativeFieldKeys.has("bathrooms") ||
          nativeFieldKeys.has("parkingSpaces")) && (
          <div className="grid gap-4 sm:grid-cols-3">
            {nativeFieldKeys.has("bedrooms") && (
              <Input
                label="Habitaciones"
                name="bedrooms"
                type="number"
                min={0}
                defaultValue={asString(values?.bedrooms, "0")}
              />
            )}
            {nativeFieldKeys.has("bathrooms") && (
              <Input
                label="Baños"
                name="bathrooms"
                type="number"
                min={0}
                defaultValue={asString(values?.bathrooms, "0")}
              />
            )}
            {nativeFieldKeys.has("parkingSpaces") && (
              <Input
                label="Parqueaderos"
                name="parkingSpaces"
                type="number"
                min={0}
                defaultValue={asString(values?.parkingSpaces, "0")}
              />
            )}
          </div>
        )}
      </section>

      {extraAttributes.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold text-ink-900">
            Características de {selectedCategory?.name}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {extraAttributes.map((attribute) => (
              <AttributeField
                key={attribute.id}
                attribute={attribute}
                value={values?.[`attr_${attribute.key}`]}
              />
            ))}
          </div>
        </section>
      )}

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
          label={`Cuéntanos sobre tu ${listingLower}`}
          name="description"
          rows={5}
          defaultValue={asString(values?.description)}
          error={state.fieldErrors?.description}
        />
      </section>

      {/* Amenity checklist (Balcón, Piscina, etc.) only makes sense for
          real-estate categories — selectedCategory.nativeValue is only set
          for categories mapped to the legacy PropertyType enum (see
          Category.nativeValue). A Carros or other generic-vertical category
          has no nativeValue and simply skips this section. */}
      {selectedCategory?.nativeValue && (
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
      )}

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
          {isPending
            ? "Guardando..."
            : mode === "edit"
              ? "Guardar cambios"
              : // The button reflects whichever category is actually selected
                // (e.g. "Publicar anuncio de carros") rather than always
                // saying sellCta's configured noun ("Publicar propiedad"),
                // which would be wrong the moment a non-native category like
                // Carros is chosen on an otherwise real-estate deployment.
                selectedCategory
                ? `Publicar anuncio de ${selectedCategory.name.toLowerCase()}`
                : sellCta}
        </Button>
      </div>
    </form>
  );
}
