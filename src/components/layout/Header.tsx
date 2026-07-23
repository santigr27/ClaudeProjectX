import Link from "next/link";
import { Heart } from "lucide-react";
import { navigation } from "@/config/site";
import { auth } from "@/lib/auth";
import { Logo } from "./Logo";
import { HeaderSearchForm } from "./HeaderSearchForm";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/95 backdrop-blur-sm">
      <div className="relative mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Navegación principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <HeaderSearchForm className="ml-auto hidden max-w-xs flex-1 lg:block" />

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            href="/favorites"
            aria-label="Favoritos"
            className="hidden size-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 sm:flex"
          >
            <Heart className="size-5" aria-hidden />
          </Link>

          {user ? (
            <div className="hidden sm:block">
              <UserMenu name={user.name ?? user.email ?? "Cuenta"} />
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 sm:block"
            >
              Iniciar sesión
            </Link>
          )}

          <MobileNav user={user ? { name: user.name ?? user.email ?? "Cuenta" } : null} />
        </div>
      </div>
    </header>
  );
}
