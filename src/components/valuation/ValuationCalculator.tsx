"use client";

import { useActionState, useMemo, useState } from "react";
import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
import { Select, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { estimateValuationAction, type ValuationActionState } from "@/features/valuation/actions";
import { formatCOP, formatPricePerSqm } from "@/lib/currency";
import { propertyTypeLabels } from "@/config/site";
import type { LocalityOption } from "@/repositories/market-data.repository";

const PROPERTY_TYPE_OPTIONS = Object.entries(propertyTypeLabels).map(([value, label]) => ({
  value: value.toLowerCase(),
  label,
}));

const initialState: ValuationActionState = {};

export function ValuationCalculator({ localities }: { localities: LocalityOption[] }) {
  const [state, formAction, isPending] = useActionState(estimateValuationAction, initialState);

  // Each completed submission produces a new `state` object. Track that with
  // a monotonic id so the form below can be force-remounted on every result:
  // browsers can restore stale <select>/<input> values onto controls that
  // survive a Server Action round-trip, so a fresh mount (re-reading
  // defaults from the latest `state.result`) is more reliable than trying to
  // keep long-lived controlled state in sync by hand.
  const [priorState, setPriorState] = useState(state);
  const [submissionId, setSubmissionId] = useState(0);
  if (priorState !== state) {
    setPriorState(state);
    setSubmissionId((id) => id + 1);
  }

  const submitted = state.submittedInput;
  const [mode, setMode] = useState<"sale" | "rent">(() => submitted?.mode ?? "sale");
  const [locality, setLocality] = useState(() => submitted?.locality ?? localities[0]?.locality ?? "");

  const neighborhoodOptions = useMemo(() => {
    const found = localities.find((option) => option.locality === locality);
    return found?.neighborhoods ?? [];
  }, [localities, locality]);

  const result = state.result;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        key={submissionId}
        action={formAction}
        className="flex flex-col gap-4 rounded-3xl border border-ink-100 bg-white p-6 sm:p-8"
      >
        <input type="hidden" name="mode" value={mode} />

        <SegmentedToggle
          name="Modo de estimación"
          value={mode}
          onChange={(value) => setMode(value as "sale" | "rent")}
          options={[
            { value: "sale", label: "Valor de venta" },
            { value: "rent", label: "Renta mensual" },
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Localidad"
            name="locality"
            options={localities.map((option) => ({ value: option.locality, label: option.locality }))}
            value={locality}
            onChange={(event) => setLocality(event.target.value)}
            error={state.fieldErrors?.locality}
          />
          <Select
            key={locality}
            label="Barrio"
            name="neighborhood"
            options={neighborhoodOptions.map((neighborhood) => ({ value: neighborhood, label: neighborhood }))}
            placeholder={neighborhoodOptions.length ? "Selecciona un barrio" : "Selecciona una localidad primero"}
            defaultValue={locality === submitted?.locality ? submitted?.neighborhood : undefined}
            error={state.fieldErrors?.neighborhood}
          />
        </div>

        <Select
          label="Tipo de propiedad"
          name="propertyType"
          options={PROPERTY_TYPE_OPTIONS}
          defaultValue={submitted?.propertyType ?? "apartment"}
          error={state.fieldErrors?.propertyType}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Área (m²)"
            name="areaSqm"
            type="number"
            min={1}
            step="1"
            defaultValue={submitted?.areaSqm ?? 70}
            error={state.fieldErrors?.areaSqm}
          />
          <Input
            label="Antigüedad (años)"
            name="propertyAge"
            type="number"
            min={0}
            step="1"
            defaultValue={submitted?.propertyAge ?? 5}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Habitaciones"
            name="bedrooms"
            type="number"
            min={0}
            step="1"
            defaultValue={submitted?.bedrooms ?? 2}
          />
          <Input
            label="Baños"
            name="bathrooms"
            type="number"
            min={0}
            step="1"
            defaultValue={submitted?.bathrooms ?? 2}
          />
          <Input
            label="Parqueaderos"
            name="parkingSpaces"
            type="number"
            min={0}
            step="1"
            defaultValue={submitted?.parkingSpaces ?? 1}
          />
        </div>

        {state.formError && (
          <p role="alert" className="text-sm text-red-600">
            {state.formError}
          </p>
        )}

        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Calculando..." : "Calcular estimado"}
        </Button>
      </form>

      <div className="flex flex-col justify-center rounded-3xl bg-ink-900 p-6 text-white sm:p-8">
        {result ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-300">
              {result.mode === "sale" ? "Valor estimado de mercado" : "Renta mensual estimada"}
            </p>
            <p className="font-display text-4xl font-semibold sm:text-5xl">
              {formatCOP(result.estimatedValue)}
              {result.mode === "rent" && <span className="text-lg font-normal text-white/70">/mes</span>}
            </p>

            <dl className="grid gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-white/60">Precio promedio</dt>
                <dd className="font-medium">{formatPricePerSqm(result.pricePerSqm)}</dd>
              </div>
              <div>
                <dt className="text-white/60">Zona seleccionada</dt>
                <dd className="font-medium">
                  {result.neighborhood}, {result.locality}
                </dd>
              </div>
              <div>
                <dt className="text-white/60">Área estimada</dt>
                <dd className="font-medium">{result.areaSqm} m²</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-white/60">Rango estimado</dt>
                <dd className="font-medium">
                  {formatCOP(result.rangeLow)} – {formatCOP(result.rangeHigh)}
                </dd>
              </div>
            </dl>

            <p className="mt-2 text-xs leading-relaxed text-white/50">
              Este valor es un estimado basado en el precio promedio por m² de la zona y no
              constituye un avalúo oficial. Los precios reales pueden variar según el estado,
              acabados y ubicación específica del inmueble.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 text-white/70">
            <p className="font-display text-2xl font-semibold text-white">
              Estimación al instante
            </p>
            <p className="text-sm leading-relaxed">
              Completa el formulario con los datos de tu propiedad para calcular su valor
              estimado a partir del precio promedio por metro cuadrado de su barrio en Bogotá.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
