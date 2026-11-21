import { parseAmount } from "./format";
import { CSR_FOCUS, INDUSTRIES, SEGMENTS, TIERS, type CsrFocus, type Industry, type Segment, type Tier } from "./facts";

/** Error codes are translated in the UI dictionary (errors.*). */
export type ErrorCode =
  | "required"
  | "nameTooShort"
  | "nameTooLong"
  | "nameChars"
  | "noDigitsSequence"
  | "amountRequired"
  | "amountNaN"
  | "amountZero"
  | "amountNegative"
  | "amountMin"
  | "amountMax"
  | "amountDecimals"
  | "emailRequired"
  | "emailInvalid"
  | "companyRequired"
  | "companyTooShort"
  | "companyTooLong"
  | "selectRequired";

export type FieldError = { code: ErrorCode; params?: Record<string, string | number> };
export type Errors<K extends string> = Partial<Record<K, FieldError>>;

const NAME_RE = /^[\p{L}][\p{L}\s.'’-]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

export function validatePersonName(raw: string): FieldError | undefined {
  const v = raw.trim();
  if (!v) return { code: "required" };
  // Guardrail: never accept anything that looks like an ID number (CNP) or card number.
  if (/\d{4,}/.test(v.replace(/\s/g, ""))) return { code: "noDigitsSequence" };
  if (v.length < 2) return { code: "nameTooShort" };
  if (v.length > 60) return { code: "nameTooLong" };
  if (!NAME_RE.test(v)) return { code: "nameChars" };
  return undefined;
}

export function validateCompanyName(raw: string): FieldError | undefined {
  const v = raw.trim();
  if (!v) return { code: "companyRequired" };
  if (/\d{8,}/.test(v.replace(/\s/g, ""))) return { code: "noDigitsSequence" };
  if (v.length < 2) return { code: "companyTooShort" };
  if (v.length > 80) return { code: "companyTooLong" };
  return undefined;
}

export function validateEmail(raw: string): FieldError | undefined {
  const v = raw.trim();
  if (!v) return { code: "emailRequired" };
  if (v.length > 120 || !EMAIL_RE.test(v)) return { code: "emailInvalid" };
  return undefined;
}

export function validateAmount(
  raw: string,
  limits: { min: number; max: number },
): { error?: FieldError; value?: number } {
  if (!raw.trim()) return { error: { code: "amountRequired" } };
  const n = parseAmount(raw);
  if (Number.isNaN(n) || !Number.isFinite(n)) return { error: { code: "amountNaN" } };
  if (n < 0) return { error: { code: "amountNegative" } };
  if (n === 0) return { error: { code: "amountZero" } };
  if (Math.round(n * 100) !== n * 100 && Math.abs(Math.round(n * 100) - n * 100) > 1e-6)
    return { error: { code: "amountDecimals" } };
  if (n < limits.min) return { error: { code: "amountMin", params: { min: limits.min } } };
  if (n > limits.max) return { error: { code: "amountMax", params: { max: limits.max } } };
  return { value: Math.round(n * 100) / 100 };
}

export function isSegment(v: string): v is Segment {
  return (SEGMENTS as readonly string[]).includes(v);
}
export function isCsrFocus(v: string): v is CsrFocus {
  return (CSR_FOCUS as readonly string[]).includes(v);
}
export function isIndustry(v: string): v is Industry {
  return (INDUSTRIES as readonly string[]).includes(v);
}
export function isTier(v: string): v is Tier {
  return (TIERS as readonly string[]).includes(v);
}

export function hasErrors(e: Record<string, unknown>): boolean {
  return Object.values(e).some(Boolean);
}
