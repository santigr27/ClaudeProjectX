"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { createUser, findUserByEmail } from "@/repositories/user.repository";
import { loginSchema, registerSchema } from "@/validations/auth";

export interface AuthActionState {
  fieldErrors?: Record<string, string>;
  formError?: string;
  /** Echoes back non-sensitive submitted fields (never the password) so
   * the form can re-populate them after a validation/credentials error. */
  values?: { name?: string; email?: string };
}

function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error.issues), values: { email: String(raw.email ?? "") } };
  }

  const callbackUrl = formData.get("callbackUrl");

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { formError: "Correo o contraseña incorrectos.", values: { email: parsed.data.email } };
    }
    throw error;
  }

  return {};
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
      values: { name: String(raw.name ?? ""), email: String(raw.email ?? "") },
    };
  }

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) {
    return {
      fieldErrors: { email: "Ya existe una cuenta con este correo" },
      values: { name: parsed.data.name, email: parsed.data.email },
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await createUser({ name: parsed.data.name, email: parsed.data.email, passwordHash });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        formError: "Tu cuenta fue creada. Inicia sesión con tu correo y contraseña.",
      };
    }
    throw error;
  }

  return {};
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
