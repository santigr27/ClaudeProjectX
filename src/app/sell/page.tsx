import type { Metadata } from "next";
import { listLocalitiesWithNeighborhoods } from "@/repositories/market-data.repository";
import { findActiveTopLevelCategories } from "@/repositories/category.repository";
import { getMarketplaceConfig } from "@/features/marketplace/config";
import { SellPropertyForm } from "@/components/sell/SellPropertyForm";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getMarketplaceConfig();
  return {
    title: config.terminology.sellCta,
    description: `Publica tu ${config.terminology.listing.toLowerCase()} en minutos.`,
  };
}

export default async function SellPage() {
  const [localities, config, categories] = await Promise.all([
    listLocalitiesWithNeighborhoods(),
    getMarketplaceConfig(),
    findActiveTopLevelCategories(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink-900">
          {config.terminology.sellCta}
        </h1>
        <p className="mt-2 text-ink-500">
          Completa la información. Nuestro equipo la revisará antes de publicarla.
        </p>
      </div>

      <SellPropertyForm
        localities={localities}
        categories={categories}
        sellCta={config.terminology.sellCta}
      />
    </div>
  );
}
