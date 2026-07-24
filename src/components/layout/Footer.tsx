import Link from "next/link";
import { Logo } from "./Logo";
import { getMarketplaceConfig } from "@/features/marketplace/config";

export async function Footer() {
  const config = await getMarketplaceConfig();

  const footerLinks = [
    {
      title: "Explorar",
      links: [
        { label: "Comprar", href: "/properties?listingType=sale" },
        { label: "Arrendar", href: "/properties?listingType=rent" },
        { label: "Estimar propiedad", href: "/estimate" },
      ],
    },
    {
      title: "Propietarios",
      links: [
        { label: config.terminology.sellCta, href: "/sell" },
        { label: "Favoritos", href: "/favorites" },
      ],
    },
  ];

  return (
    <footer className="border-t border-ink-100 bg-ink-50/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo name={config.name} logoUrl={config.logoUrl} />
            <p className="mt-3 text-sm text-ink-500">{config.description}</p>
          </div>

          <div className="flex flex-wrap gap-10">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="mb-3 text-sm font-semibold text-ink-800">{group.title}</h3>
                <ul className="flex flex-col gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-ink-500 hover:text-ink-800">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-ink-100 pt-6 text-xs text-ink-400">
          <p>
            © {new Date().getFullYear()} {config.name}. Datos de mercado y contenido de propiedades
            con fines demostrativos.
          </p>
        </div>
      </div>
    </footer>
  );
}
