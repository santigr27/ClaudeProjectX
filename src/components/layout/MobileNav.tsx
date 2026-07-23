"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import { navigation } from "@/config/site";
import { HeaderSearchForm } from "./HeaderSearchForm";
import { signOutAction } from "@/features/auth/actions";

export function MobileNav({ user }: { user: { name: string } | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex size-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100"
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-40 border-t border-ink-100 bg-white px-4 py-4 shadow-lg">
          <HeaderSearchForm className="mb-4" />
          <nav aria-label="Navegación principal">
            <ul className="flex flex-col gap-1">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-ink-800 hover:bg-ink-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              <li>
                <hr className="my-2 border-ink-100" />
              </li>

              {user ? (
                <>
                  <li>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-base font-medium text-ink-800 hover:bg-ink-50"
                    >
                      Mis propiedades
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/account"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-base font-medium text-ink-800 hover:bg-ink-50"
                    >
                      Perfil ({user.name})
                    </Link>
                  </li>
                  <li>
                    <form action={signOutAction}>
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-base font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="size-4" aria-hidden />
                        Cerrar sesión
                      </button>
                    </form>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-ink-800 hover:bg-ink-50"
                  >
                    Iniciar sesión
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
