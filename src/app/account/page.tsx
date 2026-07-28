import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/features/auth/actions";
import { getMarketplaceConfig } from "@/features/marketplace/config";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Mi perfil",
};

/**
 * Minimal profile page per the MVP scope: name, email, and an avatar
 * fallback (initials). No editable account-management features yet —
 * see the dashboard (/dashboard) for listing management.
 */
export default async function AccountPage() {
  const [session, config] = await Promise.all([auth(), getMarketplaceConfig()]);
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const { name, email } = session.user;
  const listingPluralLower = config.terminology.listingPlural.toLowerCase();
  const initials = (name ?? email ?? "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-sm">
        <div className="flex size-16 items-center justify-center rounded-full bg-brand-600 text-xl font-semibold text-white">
          {initials}
        </div>
        <div>
          <p className="font-display text-xl font-semibold text-ink-900">{name}</p>
          <p className="text-sm text-ink-500">{email}</p>
        </div>

        <div className="mt-2 flex w-full flex-col gap-2">
          <Button href="/dashboard" fullWidth>
            Ir a mis {listingPluralLower}
          </Button>
          <form action={signOutAction} className="w-full">
            <button
              type="submit"
              className="w-full rounded-full border border-ink-200 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
