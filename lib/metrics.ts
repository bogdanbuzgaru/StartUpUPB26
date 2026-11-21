import { getSupabase } from "./supabase";
import { INDUSTRIES, SEGMENTS, type Channel, type CsrFocus, type Industry, type Segment, type Tier } from "./facts";
import { clearReferralSession, getActiveReferral, isValidCode } from "./referral";

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

export type Bucket = { count: number; total: number };
export type DailyPoint = { day: string; count: number; total: number };
export type RecentPledge = { initials: string; channel: Channel; segment: Segment; amountRon: number; at: string };
export type LeaderRow = { code: string; visits: number; pledges: number; total: number };

export type FunnelInsights = {
  byChannel: Record<Channel, Bucket>;
  bySegment: Record<Segment, Bucket>;
  byIndustry: Record<Industry, Bucket>;
  daily: DailyPoint[];
  recent: RecentPledge[];
  referralVisits: number;
  referredPledges: number;
  referredTotal: number;
  leaderboard: LeaderRow[];
};

export type AmbassadorStats = { visits: number; pledges: number; total: number; rank: number | null };

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

export type SaveResult = { ok: true; mode: "remote" | "local"; referral?: string } | { ok: false };

const CHANNELS: Channel[] = ["sms", "iban_ron", "iban_eur"];

/* ------------------------------------------------------------------ */
/* Local demo mode (no Supabase env vars): data stays in this browser  */
/* ------------------------------------------------------------------ */
const LOCAL_KEY = "sysupe013cm.localStats";
const LOCAL_EVENTS_KEY = "sysupe013cm.localEvents";
const MAX_EVENTS = 500;

type LocalEvents = {
  pledges: { t: string; ch: Channel; seg: Segment; ron: number; ini: string; ref?: string }[];
  inquiries: { t: string; ind: Industry; ron: number }[];
  refVisits: { t: string; ref: string }[];
};

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

function readEvents(): LocalEvents {
  const empty: LocalEvents = { pledges: [], inquiries: [], refVisits: [] };
  try {
    const raw = window.localStorage.getItem(LOCAL_EVENTS_KEY);
    if (!raw) return empty;
    const p = JSON.parse(raw) as Partial<LocalEvents>;
    return {
      pledges: Array.isArray(p.pledges) ? p.pledges.filter((e) => e && CHANNELS.includes(e.ch) && Number.isFinite(e.ron)) : [],
      inquiries: Array.isArray(p.inquiries) ? p.inquiries.filter((e) => e && Number.isFinite(e.ron)) : [],
      refVisits: Array.isArray(p.refVisits) ? p.refVisits.filter((e) => e && isValidCode(e.ref)) : [],
    };
  } catch {
    return empty;
  }
}

function writeEvents(mut: (e: LocalEvents) => void) {
  const e = readEvents();
  mut(e);
  e.pledges = e.pledges.slice(-MAX_EVENTS);
  e.inquiries = e.inquiries.slice(-MAX_EVENTS);
  e.refVisits = e.refVisits.slice(-MAX_EVENTS);
  try {
    window.localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(e));
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

/** Records one visit that arrived through an ambassador link (caller guarantees once per session). */
export async function recordReferralVisit(code: string): Promise<void> {
  if (!isValidCode(code)) return;
  const sb = getSupabase();
  if (!sb) {
    writeEvents((e) => e.refVisits.push({ t: new Date().toISOString(), ref: code }));
    return;
  }
  await sb.from("referral_visits").insert({ referral_code: code });
}

/**
 * Clears this browser's demo state only: locally simulated pledges/inquiries and, in local mode,
 * the visitor-session flag. It never touches rows in the shared Supabase database.
 */
export function clearLocalDemoData(): void {
  try {
    window.localStorage.removeItem(LOCAL_KEY);
    window.localStorage.removeItem(LOCAL_EVENTS_KEY);
  } catch {
    /* ignore */
  }
  clearReferralSession();
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

/* ----------------------------- Insights ----------------------------- */

function emptyBuckets<K extends string>(keys: readonly K[]): Record<K, Bucket> {
  return Object.fromEntries(keys.map((k) => [k, { count: 0, total: 0 }])) as Record<K, Bucket>;
}

function bucketsFrom<K extends string>(keys: readonly K[], raw: unknown): Record<K, Bucket> {
  const out = emptyBuckets(keys);
  if (raw && typeof raw === "object") {
    for (const k of keys) {
      const b = (raw as Record<string, { count?: unknown; total?: unknown } | undefined>)[k];
      if (b) out[k] = { count: num(b.count), total: num(b.total) };
    }
  }
  return out;
}

/** Local calendar day (YYYY-MM-DD) – matches the Europe/Bucharest grouping on the server closely enough for a demo. */
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function last14Days(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push(dayKey(d));
  }
  return out;
}

function localInsights(): FunnelInsights {
  const e = readEvents();
  const byChannel = emptyBuckets(CHANNELS);
  const bySegment = emptyBuckets(SEGMENTS);
  const byIndustry = emptyBuckets(INDUSTRIES);
  const days = new Map(last14Days().map((d) => [d, { count: 0, total: 0 }]));
  const refs = new Map<string, LeaderRow>();

  for (const p of e.pledges) {
    byChannel[p.ch].count += 1;
    byChannel[p.ch].total += p.ron;
    if (bySegment[p.seg]) {
      bySegment[p.seg].count += 1;
      bySegment[p.seg].total += p.ron;
    }
    const d = days.get(dayKey(new Date(p.t)));
    if (d) {
      d.count += 1;
      d.total += p.ron;
    }
    if (p.ref) {
      const r = refs.get(p.ref) ?? { code: p.ref, visits: 0, pledges: 0, total: 0 };
      r.pledges += 1;
      r.total += p.ron;
      refs.set(p.ref, r);
    }
  }
  for (const i of e.inquiries) {
    if (byIndustry[i.ind]) {
      byIndustry[i.ind].count += 1;
      byIndustry[i.ind].total += i.ron;
    }
  }
  for (const v of e.refVisits) {
    const r = refs.get(v.ref);
    if (r) r.visits += 1;
  }
  const referred = e.pledges.filter((p) => p.ref);

  return {
    byChannel,
    bySegment,
    byIndustry,
    daily: Array.from(days, ([day, v]) => ({ day, ...v })),
    recent: e.pledges
      .slice(-8)
      .reverse()
      .map((p) => ({ initials: p.ini, channel: p.ch, segment: p.seg, amountRon: p.ron, at: p.t })),
    referralVisits: e.refVisits.length,
    referredPledges: referred.length,
    referredTotal: referred.reduce((s, p) => s + p.ron, 0),
    leaderboard: [...refs.values()].sort((a, b) => b.total - a.total || b.pledges - a.pledges).slice(0, 5),
  };
}

/**
 * Detailed analytics. `schemaOutdated` is true when the database was created before the
 * insights migration (supabase/schema.sql §7–9) – the UI then explains how to enable it.
 */
export async function fetchInsights(): Promise<{ insights: FunnelInsights; mode: "remote" | "local"; schemaOutdated?: boolean }> {
  const sb = getSupabase();
  if (!sb) return { insights: localInsights(), mode: "local" };
  const { data, error } = await sb.rpc("get_funnel_insights");
  if (error) {
    // PGRST202 = function not found → migration not applied yet.
    if ((error as { code?: string }).code === "PGRST202") {
      return { insights: emptyInsights(), mode: "remote", schemaOutdated: true };
    }
    throw error;
  }
  const a = (data ?? {}) as Record<string, unknown>;
  const daily = Array.isArray(a.daily) ? (a.daily as Record<string, unknown>[]) : [];
  const recent = Array.isArray(a.recent) ? (a.recent as Record<string, unknown>[]) : [];
  const leaderboard = Array.isArray(a.leaderboard) ? (a.leaderboard as Record<string, unknown>[]) : [];
  return {
    mode: "remote",
    insights: {
      byChannel: bucketsFrom(CHANNELS, a.by_channel),
      bySegment: bucketsFrom(SEGMENTS, a.by_segment),
      byIndustry: bucketsFrom(INDUSTRIES, a.by_industry),
      daily: daily.map((d) => ({ day: String(d.day).slice(0, 10), count: num(d.count), total: num(d.total) })),
      recent: recent
        .filter((r) => CHANNELS.includes(r.channel as Channel))
        .map((r) => ({
          initials: String(r.initials ?? "?").slice(0, 3),
          channel: r.channel as Channel,
          segment: r.segment as Segment,
          amountRon: num(r.amount_ron),
          at: String(r.created_at),
        })),
      referralVisits: num(a.referral_visits),
      referredPledges: num(a.referred_pledges),
      referredTotal: num(a.referred_total),
      leaderboard: leaderboard
        .filter((l) => isValidCode(String(l.code)))
        .map((l) => ({ code: String(l.code), visits: num(l.visits), pledges: num(l.pledges), total: num(l.total) })),
    },
  };
}

export function emptyInsights(): FunnelInsights {
  return {
    byChannel: emptyBuckets(CHANNELS),
    bySegment: emptyBuckets(SEGMENTS),
    byIndustry: emptyBuckets(INDUSTRIES),
    daily: last14Days().map((day) => ({ day, count: 0, total: 0 })),
    recent: [],
    referralVisits: 0,
    referredPledges: 0,
    referredTotal: 0,
    leaderboard: [],
  };
}

export async function fetchAmbassadorStats(code: string): Promise<AmbassadorStats | null> {
  if (!isValidCode(code)) return null;
  const sb = getSupabase();
  if (!sb) {
    const ins = localInsights();
    const e = readEvents();
    const mine = e.pledges.filter((p) => p.ref === code);
    const total = mine.reduce((s, p) => s + p.ron, 0);
    const better = ins.leaderboard.filter((l) => l.code !== code && l.total > total).length;
    return {
      visits: e.refVisits.filter((v) => v.ref === code).length,
      pledges: mine.length,
      total,
      rank: mine.length > 0 ? better + 1 : null,
    };
  }
  const { data, error } = await sb.rpc("get_ambassador_stats", { p_code: code });
  if (error) throw error;
  const a = (data ?? {}) as Record<string, unknown>;
  if (a.valid === false) return null;
  return { visits: num(a.visits), pledges: num(a.pledges), total: num(a.total), rank: a.rank == null ? null : num(a.rank) };
}

/* ------------------------------ Writes ------------------------------ */

function initialOf(name: string): string {
  const ch = name.trim().charAt(0).toUpperCase();
  return ch ? `${ch}.` : "?";
}

export async function savePledge(p: PledgeInput): Promise<SaveResult> {
  const referral = getActiveReferral() ?? undefined;
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
    writeEvents((e) =>
      e.pledges.push({ t: new Date().toISOString(), ch: p.channel, seg: p.segment, ron: p.amount_ron, ini: initialOf(p.donor_name), ref: referral }),
    );
    return { ok: true, mode: "local", referral };
  }
  // No `.select()` – the public role may insert but not read rows back (see RLS policies).
  const { error } = await sb.from("simulated_pledges").insert({ ...p, referral_code: referral ?? null, is_simulated: true });
  if (!error) return { ok: true, mode: "remote", referral };
  // Backwards compatibility: a database without the referral migration (§7) still accepts the base row.
  if (referral) {
    const retry = await sb.from("simulated_pledges").insert({ ...p, is_simulated: true });
    if (!retry.error) return { ok: true, mode: "remote" };
  }
  return { ok: false };
}

export async function saveInquiry(i: InquiryInput): Promise<SaveResult> {
  const sb = getSupabase();
  if (!sb) {
    const s = readLocal();
    writeLocal({ ...s, corporateCount: s.corporateCount + 1, corporateTotalRon: s.corporateTotalRon + i.estimated_ron });
    writeEvents((e) => e.inquiries.push({ t: new Date().toISOString(), ind: i.industry, ron: i.estimated_ron }));
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
