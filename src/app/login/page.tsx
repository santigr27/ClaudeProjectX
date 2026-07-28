import type { Metadata } from "next";
import { Logo } from "@/components/layout/Logo";
import { LoginForm } from "@/components/auth/LoginForm";
import { getMarketplaceConfig } from "@/features/marketplace/config";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const [{ callbackUrl }, config] = await Promise.all([searchParams, getMarketplaceConfig()]);
  const listingPluralLower = config.terminology.listingPlural.toLowerCase();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Logo name={config.name} logoUrl={config.logoUrl} />
        <h1 className="font-display text-2xl font-semibold text-ink-900">Inicia sesión</h1>
        <p className="text-sm text-ink-500">
          Accede para publicar y gestionar tus {listingPluralLower}.
        </p>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm sm:p-8">
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
