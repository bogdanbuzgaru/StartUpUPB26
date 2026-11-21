/**
 * Ambassador referral codes. A code is pseudonymous (AMB-XXXXXX), generated in the browser,
 * holds no personal data and grants no reward — it only measures how sharing spreads.
 */
export const REFERRAL_RE = /^AMB-[A-Z0-9]{6}$/;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid misreading

const MY_CODE_KEY = "sysupe013cm.myReferralCode";
const ACTIVE_REF_KEY = "sysupe013cm.activeReferral";
const VISITED_KEY = "sysupe013cm.referralVisited";

export function normalizeCode(raw: string): string {
  const s = raw.trim().toUpperCase().replace(/\s/g, "");
  return s.startsWith("AMB-") ? s : s.length === 6 ? `AMB-${s}` : s;
}

export function isValidCode(raw: string): boolean {
  return REFERRAL_RE.test(raw);
}

export function generateCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `AMB-${Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("")}`;
}

export function readMyCode(): string | null {
  try {
    const v = window.localStorage.getItem(MY_CODE_KEY);
    return v && isValidCode(v) ? v : null;
  } catch {
    return null;
  }
}

export function createMyCode(): string {
  const existing = readMyCode();
  if (existing) return existing;
  const code = generateCode();
  try {
    window.localStorage.setItem(MY_CODE_KEY, code);
  } catch {
    /* storage blocked: the code still works for this page view */
  }
  return code;
}

export function forgetMyCode(): void {
  try {
    window.localStorage.removeItem(MY_CODE_KEY);
  } catch {
    /* ignore */
  }
}

export function buildReferralLink(code: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/absolventi?ref=${encodeURIComponent(code)}`;
}

/** The referral that brought this visitor here (kept for the browser session). */
export function getActiveReferral(): string | null {
  try {
    const v = window.sessionStorage.getItem(ACTIVE_REF_KEY);
    return v && isValidCode(v) ? v : null;
  } catch {
    return null;
  }
}

/**
 * Reads ?ref= from the URL. Returns the code if it is new for this session and should be counted
 * as a referral visit (never for the visitor's own code).
 */
export function captureReferralFromUrl(): string | null {
  try {
    const raw = new URLSearchParams(window.location.search).get("ref");
    if (!raw) return null;
    const code = normalizeCode(raw);
    if (!isValidCode(code) || code === readMyCode()) return null;
    window.sessionStorage.setItem(ACTIVE_REF_KEY, code);
    const visited = (window.sessionStorage.getItem(VISITED_KEY) ?? "").split(",").filter(Boolean);
    if (visited.includes(code)) return null;
    window.sessionStorage.setItem(VISITED_KEY, [...visited, code].join(","));
    return code;
  } catch {
    return null;
  }
}

export function clearReferralSession(): void {
  try {
    window.sessionStorage.removeItem(ACTIVE_REF_KEY);
    window.sessionStorage.removeItem(VISITED_KEY);
  } catch {
    /* ignore */
  }
}
