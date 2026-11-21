import { OFFICIAL } from "./facts";

const ron = new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 2, useGrouping: "always" } as Intl.NumberFormatOptions);
const ron0 = new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0, useGrouping: "always" } as Intl.NumberFormatOptions);
const int = new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0, useGrouping: "always" } as Intl.NumberFormatOptions);

/** Amounts are always rendered in the Romanian style used by the Foundation (1.250.000 lei). */
export function formatLei(value: number, decimals: "auto" | 0 = "auto"): string {
  if (!Number.isFinite(value)) return "—";
  return `${decimals === 0 ? ron0.format(value) : ron.format(value)} lei`;
}

export function formatAmount(value: number, currency: "RON" | "EUR"): string {
  if (!Number.isFinite(value)) return "—";
  return currency === "EUR" ? `${ron.format(value)} EUR` : formatLei(value);
}

export function formatInt(value: number): string {
  return Number.isFinite(value) ? int.format(value) : "—";
}

/** Percentage with enough precision to stay meaningful for very small shares. */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0%";
  let digits = 2;
  if (value < 0.01) digits = 4;
  else if (value < 0.1) digits = 3;
  if (value < 0.0001) return "< 0,0001%";
  return `${new Intl.NumberFormat("ro-RO", { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(value)}%`;
}

export function shareOfPhase1(amountRon: number): number {
  return (amountRon / OFFICIAL.phase1Ron) * 100;
}

/** Parses user input such as "250", "250,50", "1.250" or "1 250". Returns NaN on malformed input. */
export function parseAmount(raw: string): number {
  const s = raw.trim().replace(/\s/g, "").replace(/lei|ron|eur/gi, "");
  if (s === "") return NaN;
  // Romanian thousands separators "1.250.000" (dots followed by exactly 3 digits).
  let normalized = s;
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) normalized = s.replace(/\./g, "").replace(",", ".");
  else normalized = s.replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return NaN;
  return Number(normalized);
}
