"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { CONTEST, CSR_FOCUS, INDUSTRIES, LIMITS, TIERS, TIER_RON, type CsrFocus, type Industry, type Tier } from "@/lib/facts";
import { formatLei, formatPercent, shareOfPhase1 } from "@/lib/format";
import { errorMessage } from "@/lib/dictionary";
import { useI18n } from "@/lib/i18n";
import { saveInquiry } from "@/lib/metrics";
import {
  hasErrors,
  isCsrFocus,
  isIndustry,
  isTier,
  validateAmount,
  validateCompanyName,
  validateEmail,
  validatePersonName,
  type Errors,
  type FieldError,
} from "@/lib/validation";
import { useMetrics, useTesterSignal } from "@/components/providers";
import { CopyButton, Field, FormAlert, SubmitButton } from "@/components/ui/form";

type Keys = "company" | "contact" | "email" | "industry" | "focus" | "tier" | "custom";
type Values = { company: string; contact: string; email: string; industry: string; focus: string; tier: string; custom: string };

const EMPTY: Values = { company: "", contact: "", email: "", industry: "", focus: "", tier: "", custom: "" };

/** Fictional, realistic examples from the five target sectors – rotated on each tester run. */
const TESTER_EXAMPLES: Values[] = [
  { company: "Carpatic Software Demo SRL", contact: "Ioana Marin", email: "csr@carpatic-software-demo.ro", industry: "it", focus: "education_access", tier: "25000", custom: "" },
  { company: "Voltaris Auto Components Demo SRL", contact: "Mihai Ionescu", email: "parteneriate@voltaris-demo.ro", industry: "automotive", focus: "stem_infrastructure", tier: "50000_plus", custom: "" },
  { company: "Dunărea Inginerie Industrială Demo SA", contact: "Andreea Stan", email: "comunitate@dunarea-inginerie-demo.ro", industry: "engineering", focus: "stem_infrastructure", tier: "10000", custom: "" },
  { company: "Hidrovolt Energie Demo SA", contact: "Elena Dumitru", email: "csr@hidrovolt-demo.ro", industry: "energy", focus: "sustainable_campus", tier: "custom", custom: "15000" },
  { company: "Arcadia Construct Demo SRL", contact: "Radu Petrescu", email: "sponsorizari@arcadia-construct-demo.ro", industry: "construction", focus: "sustainable_campus", tier: "25000", custom: "" },
];
const TESTER_INVALID: Values = { company: "   ", contact: "", email: "csr@@exemplu", industry: "", focus: "", tier: "custom", custom: "-500" };

type Result = {
  company: string;
  contact: string;
  industry: Industry;
  focus: CsrFocus;
  tier: Tier;
  amount: number;
  date: Date;
  mode: "remote" | "local";
};

function amountFor(v: Values): number | undefined {
  if (!isTier(v.tier)) return undefined;
  if (v.tier === "custom") return validateAmount(v.custom, LIMITS.corporate).value;
  return TIER_RON[v.tier];
}

function Choice({
  name,
  value,
  checked,
  invalid,
  onChange,
  children,
  className = "",
}: {
  name: string;
  value: string;
  checked: boolean;
  invalid: boolean;
  onChange: (e: { target: { value: string } }) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`flex min-h-11 cursor-pointer items-center gap-3 border px-3.5 py-2.5 text-[14px] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
        checked ? "border-ink bg-ink text-paper" : invalid ? "border-danger bg-danger-wash" : "border-line-strong bg-paper hover:border-ink"
      } ${className}`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}

export function CorporatePortal() {
  const { t, lang } = useI18n();
  const { refresh } = useMetrics();
  const [v, setV] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors<Keys>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const validate = (x: Values): Errors<Keys> => {
    let custom: FieldError | undefined;
    if (x.tier === "custom") custom = validateAmount(x.custom, LIMITS.corporate).error;
    return {
      company: validateCompanyName(x.company),
      contact: validatePersonName(x.contact),
      email: validateEmail(x.email),
      industry: isIndustry(x.industry) ? undefined : { code: "selectRequired" },
      focus: isCsrFocus(x.focus) ? undefined : { code: "selectRequired" },
      tier: isTier(x.tier) ? undefined : { code: "selectRequired" },
      custom,
    };
  };

  useEffect(() => {
    if (submitted) setErrors(validate(v));
  }, [v, submitted]);

  useTesterSignal((kind, nonce) => {
    if (kind === "alumni") return;
    setResult(null);
    setSaveError(false);
    if (kind === "corporate") {
      setV(TESTER_EXAMPLES[(nonce - 1) % TESTER_EXAMPLES.length]);
      setSubmitted(false);
      setErrors({});
    } else {
      setV(TESTER_INVALID);
      setSubmitted(true);
      setErrors(validate(TESTER_INVALID));
    }
  });

  const set = (k: keyof Values) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }));

  const liveAmount = amountFor(v);
  const livePct = liveAmount ? shareOfPhase1(liveAmount) : 0;
  const liveCorpPct = liveAmount ? (liveAmount / CONTEST.corporateGrossRon) * 100 : 0;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSaveError(false);
    const errs = validate(v);
    setErrors(errs);
    const amount = amountFor(v);
    if (hasErrors(errs) || !isIndustry(v.industry) || !isCsrFocus(v.focus) || !isTier(v.tier) || !amount) return;
    setBusy(true);
    try {
      const res = await saveInquiry({
        company_name: v.company.trim(),
        contact_person: v.contact.trim(),
        work_email: v.email.trim().toLowerCase(),
        industry: v.industry,
        csr_focus: v.focus,
        tier: v.tier,
        estimated_ron: amount,
      });
      if (!res.ok) {
        setSaveError(true);
        return;
      }
      setResult({
        company: v.company.trim(),
        contact: v.contact.trim(),
        industry: v.industry,
        focus: v.focus,
        tier: v.tier,
        amount,
        date: new Date(),
        mode: res.mode,
      });
      await refresh();
    } catch {
      setSaveError(true);
    } finally {
      setBusy(false);
    }
  };

  // The brief re-renders in the active UI language.
  const brief = result
    ? t.corporate.brief({
        company: result.company,
        contact: result.contact,
        industry: t.industries[result.industry],
        angle: t.corporate.angles[result.industry],
        focus: t.corporate.focuses[result.focus],
        tier: result.tier === "custom" ? formatLei(result.amount) : t.corporate.tiers[result.tier],
        share: formatPercent(shareOfPhase1(result.amount)),
        date: result.date.toLocaleDateString(lang === "ro" ? "ro-RO" : "en-GB", { day: "2-digit", month: "long", year: "numeric" }),
      })
    : "";

  return (
    <div className="grid gap-px border border-ink bg-ink lg:grid-cols-2">
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6 bg-card p-5 sm:p-7">
        <Field label={t.corporate.company} error={errorMessage(t, errors.company)}>
          {({ id, describedBy, invalid }) => (
            <input id={id} name="company_name" autoComplete="off" maxLength={100} placeholder={t.corporate.companyPlaceholder}
              value={v.company} onChange={set("company")} aria-invalid={invalid} aria-describedby={describedBy} className="field" />
          )}
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t.corporate.contact} error={errorMessage(t, errors.contact)}>
            {({ id, describedBy, invalid }) => (
              <input id={id} name="contact_person" autoComplete="off" maxLength={80} placeholder={t.corporate.contactPlaceholder}
                value={v.contact} onChange={set("contact")} aria-invalid={invalid} aria-describedby={describedBy} className="field" />
            )}
          </Field>
          <Field label={t.corporate.email} error={errorMessage(t, errors.email)}>
            {({ id, describedBy, invalid }) => (
              <input id={id} name="work_email" type="email" inputMode="email" autoComplete="off" maxLength={140}
                placeholder={t.corporate.emailPlaceholder} value={v.email} onChange={set("email")}
                aria-invalid={invalid} aria-describedby={describedBy} className="field" />
            )}
          </Field>
        </div>

        <fieldset aria-describedby={errors.industry ? "industry-err" : undefined}>
          <legend className="mb-2 text-[13px] font-medium">{t.corporate.industry}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {INDUSTRIES.map((k, i) => (
              <Choice key={k} name="industry" value={k} checked={v.industry === k} invalid={Boolean(errors.industry)} onChange={set("industry")}
                className={i === INDUSTRIES.length - 1 ? "sm:col-span-2" : ""}>
                <span className={`font-mono text-[11px] ${v.industry === k ? "text-paper/70" : "text-ink-3"}`}>{String(i + 1).padStart(2, "0")}</span>
                {t.industries[k]}
              </Choice>
            ))}
          </div>
          {errors.industry && <p id="industry-err" role="alert" className="mt-1.5 text-[12.5px] text-danger">{errorMessage(t, errors.industry)}</p>}
        </fieldset>

        <fieldset aria-describedby={errors.focus ? "focus-err" : undefined}>
          <legend className="mb-2 text-[13px] font-medium">{t.corporate.focus}</legend>
          <div className="grid gap-2">
            {CSR_FOCUS.map((f) => (
              <Choice key={f} name="csr_focus" value={f} checked={v.focus === f} invalid={Boolean(errors.focus)} onChange={set("focus")}>
                <span aria-hidden className={`size-3 shrink-0 rounded-full border ${v.focus === f ? "border-paper bg-paper" : "border-ink-3"}`} />
                {t.corporate.focuses[f]}
              </Choice>
            ))}
          </div>
          {errors.focus && <p id="focus-err" role="alert" className="mt-1.5 text-[12.5px] text-danger">{errorMessage(t, errors.focus)}</p>}
        </fieldset>

        <fieldset aria-describedby={errors.tier ? "tier-err" : undefined}>
          <legend className="mb-2 text-[13px] font-medium">{t.corporate.tier}</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TIERS.map((tr) => (
              <Choice key={tr} name="tier" value={tr} checked={v.tier === tr} invalid={Boolean(errors.tier)} onChange={set("tier")}
                className="justify-center px-2 text-center font-mono text-[13px] tabular">
                {t.corporate.tiers[tr]}
              </Choice>
            ))}
          </div>
          {errors.tier && <p id="tier-err" role="alert" className="mt-1.5 text-[12.5px] text-danger">{errorMessage(t, errors.tier)}</p>}
          {v.tier === "custom" && (
            <div className="mt-3 animate-rise">
              <Field label={t.corporate.customLabel} error={errorMessage(t, errors.custom)}>
                {({ id, describedBy, invalid }) => (
                  <div className="relative">
                    <input id={id} name="custom_amount" inputMode="decimal" autoComplete="off" placeholder={t.corporate.customPlaceholder}
                      value={v.custom} onChange={set("custom")} aria-invalid={invalid} aria-describedby={describedBy} className="field pr-12 font-mono tabular" />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[12px] text-ink-3">lei</span>
                  </div>
                )}
              </Field>
            </div>
          )}
        </fieldset>

        {/* Live share of Phase 1 */}
        <div className="border border-dashed border-ink px-4 py-4" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="eyebrow !text-ink-2">{t.corporate.shareLabel}</p>
            <p className="font-mono text-[28px] leading-none tracking-[-0.03em] tabular text-accent">{liveAmount ? formatPercent(livePct) : "—"}</p>
          </div>
          <div className="mt-3 h-2 w-full bg-paper-2" aria-hidden>
            <div className="h-full bg-accent transition-[width] duration-500 ease-out" style={{ width: `${Math.min(livePct, 100)}%` }} />
          </div>
          <p className="mt-2 font-mono text-[12px] text-ink-3 tabular">
            {t.corporate.shareOf(liveAmount ? formatLei(liveAmount) : "—")}
          </p>
          {liveAmount ? (
            <p className="mt-1 font-mono text-[12px] text-ink-3 tabular">
              {t.corporate.shareOfCorporate(formatPercent(liveCorpPct))} · {t.common.contestAssumption}
            </p>
          ) : null}
        </div>

        <p className="text-[12px] leading-relaxed text-ink-3">{t.common.fictionalHint}</p>
        {submitted && hasErrors(errors) && <FormAlert>{t.forms.fixErrors}</FormAlert>}
        {saveError && <FormAlert>{t.forms.saveError}</FormAlert>}
        <SubmitButton busy={busy} busyLabel={t.common.saving}>{t.corporate.submit}</SubmitButton>
      </form>

      {/* Brief output: a document-like sheet */}
      <div className="flex flex-col bg-paper p-5 sm:p-7">
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-ink pb-3">
          <p className="font-mono text-[12px] uppercase tracking-[0.12em]">{t.corporate.briefTitle}</p>
          <span className="demo-stamp">{t.common.demo}</span>
        </div>
        {result ? (
          <div className="flex flex-1 flex-col gap-4 pt-4 animate-rise" role="status" aria-live="polite">
            <pre className="max-h-[44rem] flex-1 overflow-auto whitespace-pre-wrap break-words font-mono text-[12px] leading-[1.65] text-ink-2">{brief}</pre>
            <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
              <CopyButton text={brief} label={t.corporate.copyBrief} variant="solid" />
              <p className="text-[12px] text-ink-3">
                {t.corporate.briefNote} {result.mode === "local" ? t.forms.receiptSavedLocal : t.forms.receiptSavedRemote}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-center gap-3 py-10" aria-hidden>
            {[92, 78, 85, 60, 88, 70, 40].map((w, i) => (
              <span key={i} className="h-2 bg-paper-2" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
