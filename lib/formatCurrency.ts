const USD_FALLBACK = (value: number) => {
  const n = Number.isFinite(value) ? value : 0;
  return `$${n.toFixed(2)}`;
};

/**
 * Formats a numeric amount with `Intl` (en-US). Defaults to USD; invalid currency codes fall back to USD, then to a fixed `$x.xx` string.
 * Lives in its own module so UI that only needs money strings does not depend on `dayjs` / the rest of `lib/utils`.
 */
export function formatCurrency(
  value: number,
  currency: string = "USD",
): string {
  const code = (currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return USD_FALLBACK(value);
    }
  }
}
