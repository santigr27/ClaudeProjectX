import type { Metadata } from "next";
import { Logo } from "@/components/layout/Logo";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Logo />
        <h1 className="font-display text-2xl font-semibold text-ink-900">Inicia sesión</h1>
        <p className="text-sm text-ink-500">Accede para publicar y gestionar tus propiedades.</p>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm sm:p-8">
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
