/**
 * Colombian peso (COP) formatting utilities.
 * COP has no minor unit in everyday use, so amounts are always whole pesos.
 */

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(amount: number | bigint): string {
  return COP_FORMATTER.format(typeof amount === "bigint" ? Number(amount) : amount);
}

/**
 * Compact representation for tight UI spaces (cards, map markers).
 * e.g. 850000000 -> "$850M", 3200000 -> "$3.2M", 950000000000 -> "$950,000M"
 */
export function formatCompactCOP(amount: number | bigint): string {
  const value = typeof amount === "bigint" ? Number(amount) : amount;
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    const millions = abs / 1_000_000;
    const rounded = millions >= 100 ? Math.round(millions) : Math.round(millions * 10) / 10;
    return `${sign}$${rounded}M`;
  }

  if (abs >= 1_000) {
    return `${sign}$${Math.round(abs / 1_000)}K`;
  }

  return `${sign}$${abs}`;
}

export function formatCompactRentPerMonth(amount: number | bigint): string {
  return `${formatCompactCOP(amount)}/mes`;
}

export function formatPricePerSqm(amount: number | bigint): string {
  return `${formatCOP(amount)} / m²`;
}

export function formatCompactPricePerSqm(amount: number | bigint): string {
  return `${formatCompactCOP(amount)}/m²`;
}

export function formatArea(areaSqm: number): string {
  return `${areaSqm.toLocaleString("es-CO", { maximumFractionDigits: 0 })} m²`;
}
