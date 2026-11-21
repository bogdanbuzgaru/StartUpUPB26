/**
 * Single source of truth for every number shown in the prototype.
 * Official figures come from the HIPOLITECH campaign page; competition
 * figures are contest assumptions (Ipoteză de concurs) – never Foundation targets.
 */
export const TEAM_CODE = "SYSUPE013CM";

export const OFFICIAL_CAMPAIGN_URL =
  "https://fundatia.upb.ro/proiecte-si-evenimente/un-loc-in-camin-poate-schimba-un-destin/";
export const OFFICIAL_SITE_URL = "https://fundatia.upb.ro";

/** Official estimates published by Fundația HIPOLITECH. */
export const OFFICIAL = {
  totalInvestmentRon: 100_000_000,
  phase1Ron: 1_250_000,
} as const;

/** Competition exercise assumptions – NOT approved Foundation targets. */
export const CONTEST = {
  targetGrossRon: 250_000,
  durationMonths: 6,
  maxCampaignBudgetRon: 15_000,
  /** Corporate track assumption: 20 sponsors × 10.000 lei = 200.000 lei gross. */
  corporateSponsors: 20,
  corporateTicketRon: 10_000,
  corporateGrossRon: 200_000,
} as const;

/**
 * Official primary target segment of the campaign exercise (verbatim, both languages).
 * It describes the company profile factually – it never implies any tax benefit.
 */
export const TARGET_SEGMENT = {
  ro: "Companiile plătitoare de impozit pe profit care recrutează studenți și absolvenți ai Universității Politehnica din București, din domeniile tehnologiei informației, ingineriei, industriei auto, energiei și construcțiilor.",
  en: "Profit-tax-paying companies that recruit students and graduates of the National University of Science and Technology POLITEHNICA Bucharest, operating in Information Technology, Engineering, Automotive, Energy, and Construction.",
} as const;

/** The five priority recruiting sectors named in the target segment. */
export const INDUSTRIES = ["it", "engineering", "automotive", "energy", "construction"] as const;
export type Industry = (typeof INDUSTRIES)[number];

/** Indicative conversion rate used only for the EUR preview. */
export const EUR_TO_RON = 5.35;

export const DEMO_SMS_SHORTCODE = "88XX – DEMO";
export const DEMO_IBAN_RON = "RO00 DEMO UPB0 0000 0000 RON0";
export const DEMO_IBAN_EUR = "RO00 DEMO UPB0 0000 0000 EUR0";
export const DEMO_SWIFT = "DEMOROBU";

export const SEGMENTS = ["alumni", "parent_academic", "general_public"] as const;
export type Segment = (typeof SEGMENTS)[number];

export const CSR_FOCUS = ["education_access", "stem_infrastructure", "sustainable_campus"] as const;
export type CsrFocus = (typeof CSR_FOCUS)[number];

export const TIERS = ["10000", "25000", "50000_plus", "custom"] as const;
export type Tier = (typeof TIERS)[number];
export type PresetTier = Exclude<Tier, "custom">;
export const TIER_RON: Record<PresetTier, number> = { "10000": 10_000, "25000": 25_000, "50000_plus": 50_000 };

export type Channel = "sms" | "iban_ron" | "iban_eur";

/** Simulation input limits (kept in sync with supabase/schema.sql). */
export const LIMITS = {
  sms: { min: 1, max: 500 },
  iban_ron: { min: 1, max: 100_000 },
  iban_eur: { min: 1, max: 20_000 },
  persona: { min: 1, max: 1_250_000 },
  corporate: { min: 1_000, max: 1_250_000 },
} as const;
