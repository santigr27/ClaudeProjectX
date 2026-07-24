import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";
import { getMarketplaceConfig } from "@/features/marketplace/config";
import { buildColorScaleVars } from "@/lib/color-scale";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getMarketplaceConfig();
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${config.name} — ${config.tagline}`,
      template: `%s | ${config.name}`,
    },
    description: config.description,
    icons: config.faviconUrl ? { icon: config.faviconUrl } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getMarketplaceConfig();

  // Runtime brand tokens: set as inline CSS custom properties on <html> so
  // they win the cascade over the compiled defaults in globals.css without
  // depending on stylesheet load order. Changing MarketplaceConfig.primaryColor
  // (via /admin/branding) takes effect on the next request — no rebuild.
  const brandStyle = {
    ...buildColorScaleVars("brand", config.primaryColor),
    ...buildColorScaleVars("accent", config.accentColor),
    "--background": config.backgroundColor,
  } as CSSProperties;

  return (
    <html
      lang="es"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
      style={brandStyle}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
