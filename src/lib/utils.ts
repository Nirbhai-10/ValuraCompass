import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "INR", region: "IN" | "GCC" | "GLOBAL" = "IN"): string {
  const locale = region === "IN" ? "en-IN" : region === "GCC" ? "en-AE" : "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.round(n));
}

export function ageFromDob(dob: Date | null | undefined, ref = new Date()): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  let age = ref.getFullYear() - d.getFullYear();
  const m = ref.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < d.getDate())) age -= 1;
  return age;
}

export function pct(n: number, denom: number): number {
  if (denom === 0) return 0;
  return (n / denom) * 100;
}

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function safeJSONParse<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
