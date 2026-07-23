"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { loginAction, type AuthActionState } from "@/features/auth/actions";

const initialState: AuthActionState = {};

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}

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
        autoComplete="current-password"
        error={state.fieldErrors?.password}
        required
      />

      {state.formError && (
        <p role="alert" className="text-sm text-red-600">
          {state.formError}
        </p>
      )}

      <Button type="submit" fullWidth disabled={isPending}>
        {isPending ? "Ingresando..." : "Iniciar sesión"}
      </Button>

      <p className="text-center text-sm text-ink-500">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-medium text-brand-700 hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
