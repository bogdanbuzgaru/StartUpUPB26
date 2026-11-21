import { getSupabase } from "./supabase";
import type { Channel, CsrFocus, Industry, Segment, Tier } from "./facts";

export type FunnelStats = {
  visitors: number;
  pledgeCount: number;
  pledgeTotalRon: number;
  smsCount: number;
  smsTotalRon: number;
  corporateCount: number;
  corporateTotalRon: number;
};

export const EMPTY_STATS: FunnelStats = {
  visitors: 0,
  pledgeCount: 0,
  pledgeTotalRon: 0,
  smsCount: 0,
  smsTotalRon: 0,
  corporateCount: 0,
  corporateTotalRon: 0,
};

export type PledgeInput = {
  donor_name: string;
  segment: Segment;
  channel: Channel;
  amount: number;
  currency: "RON" | "EUR";
  amount_ron: number;
};

export type InquiryInput = {
  company_name: string;
  contact_person: string;
  work_email: string;
  industry: Industry;
  csr_focus: CsrFocus;
  tier: Tier;
  estimated_ron: number;
};

export type SaveResult = { ok: true; mode: "remote" | "local" } | { ok: false };

/* ------------------------------------------------------------------ */
/* Local demo mode (no Supabase env vars): aggregates only, in this browser */
/* ------------------------------------------------------------------ */
const LOCAL_KEY = "sysupe013cm.localStats";

function readLocal(): FunnelStats {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return { ...EMPTY_STATS };
    const parsed = JSON.parse(raw) as Partial<FunnelStats>;
    const safe = { ...EMPTY_STATS };
    for (const k of Object.keys(EMPTY_STATS) as (keyof FunnelStats)[]) {
      const v = Number(parsed[k]);
      safe[k] = Number.isFinite(v) && v >= 0 ? v : 0;
    }
    return safe;
  } catch {
    return { ...EMPTY_STATS };
  }
}

function writeLocal(s: FunnelStats) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */

const VISIT_KEY = "sysupe013cm.visitCounted";

/** Calls increment_visitors once per browser session (guarded by sessionStorage). */
export async function registerVisitOnce(): Promise<void> {
  try {
    if (window.sessionStorage.getItem(VISIT_KEY)) return;
    // Set the guard before the network call so concurrent mounts (React Strict Mode) cannot double count.
    window.sessionStorage.setItem(VISIT_KEY, "1");
  } catch {
    return; // storage blocked: do not count rather than risk over-counting
  }
  const sb = getSupabase();
  if (!sb) {
    const s = readLocal();
    writeLocal({ ...s, visitors: s.visitors + 1 });
    return;
  }
  const { error } = await sb.rpc("increment_visitors");
  if (error) {
    try {
      window.sessionStorage.removeItem(VISIT_KEY);
    } catch {
      /* ignore */
    }
  }
}

/**
 * Clears this browser's demo state only: locally simulated pledges/inquiries and, in local mode,
 * the visitor-session flag. It never touches rows in the shared Supabase database.
 */
export function clearLocalDemoData(): void {
  try {
    window.localStorage.removeItem(LOCAL_KEY);
  } catch {
    /* ignore */
  }
  // Remote mode keeps the visit flag: clearing it would re-increment the shared Supabase counter.
  if (getSupabase()) return;
  try {
    window.sessionStorage.removeItem(VISIT_KEY);
  } catch {
    /* ignore */
  }
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchStats(): Promise<{ stats: FunnelStats; mode: "remote" | "local" }> {
  const sb = getSupabase();
  if (!sb) return { stats: readLocal(), mode: "local" };

  const [metricsRes, aggRes] = await Promise.all([
    sb.from("site_metrics").select("unique_visitors").eq("id", 1).maybeSingle(),
    sb.rpc("get_funnel_stats"),
  ]);
  if (aggRes.error) throw aggRes.error;
  const a = (aggRes.data ?? {}) as Record<string, unknown>;
  return {
    mode: "remote",
    stats: {
      visitors: num(metricsRes.data?.unique_visitors ?? a.visitors),
      pledgeCount: num(a.pledge_count),
      pledgeTotalRon: num(a.pledge_total_ron),
      smsCount: num(a.sms_count),
      smsTotalRon: num(a.sms_total_ron),
      corporateCount: num(a.corporate_count),
      corporateTotalRon: num(a.corporate_total_ron),
    },
  };
}

export async function savePledge(p: PledgeInput): Promise<SaveResult> {
  const sb = getSupabase();
  if (!sb) {
    const s = readLocal();
    writeLocal({
      ...s,
      pledgeCount: s.pledgeCount + 1,
      pledgeTotalRon: s.pledgeTotalRon + p.amount_ron,
      smsCount: s.smsCount + (p.channel === "sms" ? 1 : 0),
      smsTotalRon: s.smsTotalRon + (p.channel === "sms" ? p.amount_ron : 0),
    });
    return { ok: true, mode: "local" };
  }
  // No `.select()` – the public role may insert but not read rows back (see RLS policies).
  const { error } = await sb.from("simulated_pledges").insert({ ...p, is_simulated: true });
  return error ? { ok: false } : { ok: true, mode: "remote" };
}

export async function saveInquiry(i: InquiryInput): Promise<SaveResult> {
  const sb = getSupabase();
  if (!sb) {
    const s = readLocal();
    writeLocal({ ...s, corporateCount: s.corporateCount + 1, corporateTotalRon: s.corporateTotalRon + i.estimated_ron });
    return { ok: true, mode: "local" };
  }
  const { error } = await sb.from("corporate_inquiries").insert({ ...i, is_simulated: true });
  if (!error) return { ok: true, mode: "remote" };
  // Backwards compatibility: a database created before the `industry` / custom-tier migration
  // (supabase/schema.sql §3b) still accepts the legacy row shape for preset tiers.
  if (i.tier !== "custom") {
    const legacy = { company_name: i.company_name, contact_person: i.contact_person, work_email: i.work_email, csr_focus: i.csr_focus, tier: i.tier, estimated_ron: i.estimated_ron };
    const retry = await sb.from("corporate_inquiries").insert({ ...legacy, is_simulated: true });
    if (!retry.error) return { ok: true, mode: "remote" };
  }
  return { ok: false };
}
