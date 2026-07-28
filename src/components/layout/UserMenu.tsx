"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, PlusCircle, UserRound, LogOut } from "lucide-react";
import { signOutAction } from "@/features/auth/actions";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return initials.join("") || "U";
}

export function UserMenu({
  name,
  listingPluralLower = "propiedades",
  sellCta = "Publicar propiedad",
}: {
  name: string;
  listingPluralLower?: string;
  sellCta?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menú de cuenta"
        className="flex size-10 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700"
      >
        {getInitials(name)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-ink-100 bg-white py-1.5 shadow-lg"
        >
          <p className="truncate px-4 py-2 text-sm font-medium text-ink-800">{name}</p>
          <hr className="mb-1 border-ink-100" />
          <Link
            href="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50"
          >
            <LayoutDashboard className="size-4" aria-hidden />
            Mis {listingPluralLower}
          </Link>
          <Link
            href="/sell"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50"
          >
            <PlusCircle className="size-4" aria-hidden />
            {sellCta}
          </Link>
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50"
          >
            <UserRound className="size-4" aria-hidden />
            Perfil
          </Link>
          <hr className="my-1 border-ink-100" />
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="size-4" aria-hidden />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
