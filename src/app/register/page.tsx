import type { Metadata } from "next";
import { Logo } from "@/components/layout/Logo";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Logo />
        <h1 className="font-display text-2xl font-semibold text-ink-900">Crea tu cuenta</h1>
        <p className="text-sm text-ink-500">Publica y gestiona tus propiedades en Raíz.</p>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm sm:p-8">
        <RegisterForm />
      </div>
    </div>
  );
}
