"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { registerAction, type AuthActionState } from "@/features/auth/actions";

const initialState: AuthActionState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Nombre completo"
        name="name"
        autoComplete="name"
        placeholder="Tu nombre"
        defaultValue={state.values?.name}
        error={state.fieldErrors?.name}
        required
      />
      <Input
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
        required
      />
      <Input
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="Mínimo 8 caracteres"
        error={state.fieldErrors?.password}
        required
      />
      <Input
        label="Confirmar contraseña"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword}
        required
      />

      {state.formError && (
        <p role="alert" className="text-sm text-red-600">
          {state.formError}
        </p>
      )}

      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-ink-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
