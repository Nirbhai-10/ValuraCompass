import { Region } from "./types";

const LOCALE_BY_REGION: Record<Region, string> = {
  IN: "en-IN",
  GCC: "en-AE",
  GLOBAL: "en-US",
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

export function formatNumber(n: number, region: Region = "IN"): string {
  return new Intl.NumberFormat(LOCALE_BY_REGION[region]).format(Math.round(n));
}

export function parseAmount(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
