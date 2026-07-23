import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Mi cuenta",
};

/**
 * Placeholder for the MVP. Session/auth is intentionally deferred (see
 * src/lib/session.ts for the anonymous session id used by favorites), but
 * the route exists so the header's account entry point has somewhere to go.
 */
export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        icon={<UserRound className="size-8" aria-hidden />}
        title="Las cuentas llegarán pronto"
        description="Muy pronto podrás crear una cuenta para guardar búsquedas, gestionar tus publicaciones y contactar agentes más rápido."
      />
    </div>
  );
}
