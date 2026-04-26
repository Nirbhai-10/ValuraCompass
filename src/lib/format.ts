import { Region } from "./types";

const LOCALE_BY_REGION: Record<Region, string> = {
  IN: "en-IN",
  GCC: "en-AE",
  GLOBAL: "en-US",
};

const CURRENCY_SYMBOL: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
  SAR: "SAR ",
  QAR: "QAR ",
  OMR: "OMR ",
};

export function formatMoney(amount: number, currency = "INR", region: Region = "IN"): string {
  if (!Number.isFinite(amount)) return "—";
  try {
    return new Intl.NumberFormat(LOCALE_BY_REGION[region], {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}

/**
 * Compact money for tight spots (donut centers, legends, sparklines).
 *
 * - INR uses Indian abbreviations: ₹6,000 / ₹6.5L / ₹2.45Cr.
 * - Other currencies use western abbreviations: $1.2K / $40.0K / $1.2M / $2.4B.
 *
 * Falls through to the full `formatMoney` when amounts are small enough that
 * the full number is shorter than the abbreviated form.
 */
export function formatMoneyCompact(
  amount: number,
  currency = "INR",
  region: Region = "IN",
): string {
  if (!Number.isFinite(amount)) return "—";
  const sym = CURRENCY_SYMBOL[currency] ?? `${currency} `;
  const sign = amount < 0 ? "-" : "";
  const n = Math.abs(amount);

  if (currency === "INR" || region === "IN") {
    if (n < 1_00_000) {
      // < 1 lakh: just thousands separator
      return `${sign}${sym}${Math.round(n).toLocaleString("en-IN")}`;
    }
    if (n < 1_00_00_000) {
      // 1 lakh – 1 crore: show in lakhs, two significant digits
      const lakhs = n / 1_00_000;
      const fixed = lakhs >= 10 ? lakhs.toFixed(1) : lakhs.toFixed(2);
      return `${sign}${sym}${fixed}L`;
    }
    // 1 crore+: show in crores
    const crore = n / 1_00_00_000;
    const fixed = crore >= 100 ? crore.toFixed(0) : crore >= 10 ? crore.toFixed(1) : crore.toFixed(2);
    return `${sign}${sym}${fixed}Cr`;
  }

  // Western abbreviations
  if (n < 1_000) return `${sign}${sym}${Math.round(n).toLocaleString("en-US")}`;
  if (n < 1_000_000) {
    const k = n / 1_000;
    const fixed = k >= 100 ? k.toFixed(0) : k >= 10 ? k.toFixed(1) : k.toFixed(2);
    return `${sign}${sym}${fixed}K`;
  }
  if (n < 1_000_000_000) {
    const m = n / 1_000_000;
    const fixed = m >= 100 ? m.toFixed(0) : m >= 10 ? m.toFixed(1) : m.toFixed(2);
    return `${sign}${sym}${fixed}M`;
  }
  const b = n / 1_000_000_000;
  const fixed = b >= 10 ? b.toFixed(1) : b.toFixed(2);
  return `${sign}${sym}${fixed}B`;
}

export function formatNumber(n: number, region: Region = "IN"): string {
  return new Intl.NumberFormat(LOCALE_BY_REGION[region]).format(Math.round(n));
}

export function parseAmount(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
