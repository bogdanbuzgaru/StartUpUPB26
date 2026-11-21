"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { EUR_TO_RON, LIMITS, SEGMENTS, type Channel, type Segment } from "@/lib/facts";
import { formatAmount, formatLei, formatPercent, parseAmount, shareOfPhase1 } from "@/lib/format";
import { errorMessage } from "@/lib/dictionary";
import { useI18n } from "@/lib/i18n";
import { savePledge } from "@/lib/metrics";
import { hasErrors, isSegment, validateAmount, validatePersonName, type Errors } from "@/lib/validation";
import { useMetrics, useTesterSignal, type TesterKind } from "@/components/providers";
import { AmountPicker, Field, FormAlert, SubmitButton } from "@/components/ui/form";

type Keys = "name" | "segment" | "amount";

type Receipt = { ref: string; name: string; amount: number; amountRon: number; mode: "remote" | "local" };

const TESTER_VALID: Record<Channel, { name: string; amount: string }> = {
  sms: { name: "Andrei Popescu Demo", amount: "25" },
  iban_ron: { name: "Andrei Popescu Demo", amount: "250" },
  iban_eur: { name: "Andrei Popescu Demo", amount: "50" },
};
const TESTER_INVALID: Record<Channel, { name: string; amount: string }> = {
  sms: { name: "", amount: "-50" },
  iban_ron: { name: "1960101123456", amount: "abc" },
  iban_eur: { name: "A", amount: "0" },
};

function makeRef(channel: Channel): string {
  const prefix = channel === "sms" ? "SMS" : channel === "iban_ron" ? "RON" : "EUR";
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DEMO-${prefix}-${rnd}`;
}

export function PledgeForm({
  channel,
  presets,
  submitLabel,
  prefillFromQuery = false,
}: {
  channel: Channel;
  presets: number[];
  submitLabel: string;
  prefillFromQuery?: boolean;
}) {
  const { t } = useI18n();
  const { refresh } = useMetrics();
  const currency = channel === "iban_eur" ? "EUR" : "RON";
  const limits = LIMITS[channel];
  const formId = useId();

  const [name, setName] = useState("");
  const [segment, setSegment] = useState<Segment | "">("");
  const [amount, setAmount] = useState(String(presets[1] ?? presets[0]));
  const [errors, setErrors] = useState<Errors<Keys>>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [prefilled, setPrefilled] = useState<string | null>(null);

  // Carry the amount chosen on the home-page simulator (?suma=250).
  useEffect(() => {
    if (!prefillFromQuery) return;
    const s = new URLSearchParams(window.location.search).get("suma");
    if (s && s.length <= 12) {
      setAmount(s);
      const n = parseAmount(s);
      if (Number.isFinite(n) && n > 0) setPrefilled(formatLei(n));
    }
  }, [prefillFromQuery]);

  const validate = (v: { name: string; segment: string; amount: string }): Errors<Keys> => ({
    name: validatePersonName(v.name),
    segment: isSegment(v.segment) ? undefined : { code: "selectRequired" },
    amount: validateAmount(v.amount, limits).error,
  });

  // Live re-validation after the first submit attempt.
  useEffect(() => {
    if (submitted) setErrors(validate({ name, segment, amount }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, segment, amount, submitted]);

  useTesterSignal((kind: TesterKind) => {
    if (kind === "corporate") return;
    setReceipt(null);
    setSaveError(false);
    if (kind === "alumni") {
      const d = TESTER_VALID[channel];
      setName(d.name);
      setSegment("alumni");
      setAmount(d.amount);
      setSubmitted(false);
      setErrors({});
    } else {
      const d = TESTER_INVALID[channel];
      setName(d.name);
      setSegment("");
      setAmount(d.amount);
      setSubmitted(true);
      setErrors(validate({ name: d.name, segment: "", amount: d.amount }));
    }
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSaveError(false);
    const errs = validate({ name, segment, amount });
    setErrors(errs);
    if (hasErrors(errs) || !isSegment(segment)) return;

    const value = validateAmount(amount, limits).value as number;
    const amountRon = currency === "EUR" ? Math.round(value * EUR_TO_RON * 100) / 100 : value;
    setBusy(true);
    try {
      const res = await savePledge({
        donor_name: name.trim(),
        segment,
        channel,
        amount: value,
        currency,
        amount_ron: amountRon,
      });
      if (!res.ok) {
        setSaveError(true);
        return;
      }
      setReceipt({ ref: makeRef(channel), name: name.trim(), amount: value, amountRon, mode: res.mode });
      await refresh();
    } catch {
      setSaveError(true);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setReceipt(null);
    setName("");
    setSegment("");
    setAmount(String(presets[1] ?? presets[0]));
    setSubmitted(false);
    setErrors({});
  };

  const parsed = parseAmount(amount);
  const eurPreview = currency === "EUR" && Number.isFinite(parsed) && parsed > 0 ? parsed * EUR_TO_RON : null;
  const channelName = channel === "sms" ? t.sms.title : channel === "iban_ron" ? t.ibanRon.title : t.ibanEur.title;

  if (receipt) {
    return (
      <div className="border border-ink bg-card animate-rise" role="status" aria-live="polite">
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-ink px-5 py-3">
          <p className="font-mono text-[12px] uppercase tracking-[0.12em]">{t.forms.receiptTitle}</p>
          <span className="demo-stamp">{t.common.simulation}</span>
        </div>
        <dl className="divide-y divide-line px-5 font-mono text-[13px]">
          {[
            [t.forms.receiptRef, receipt.ref],
            [t.forms.receiptChannel, channelName],
            [t.forms.receiptDonor, receipt.name],
            [t.forms.receiptAmount, currency === "EUR" ? `${formatAmount(receipt.amount, "EUR")} ≈ ${formatLei(receipt.amountRon)}` : formatLei(receipt.amount)],
            [t.forms.receiptShare, formatPercent(shareOfPhase1(receipt.amountRon))],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-6">
              <dt className="text-ink-3">{k}</dt>
              <dd className="break-words text-ink tabular sm:text-right">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-3 border-t border-line px-5 py-4">
          <p className="text-[12.5px] leading-relaxed text-ink-2">
            {t.forms.receiptNote} {receipt.mode === "local" ? t.forms.receiptSavedLocal : t.forms.receiptSavedRemote}
          </p>
          <button
            type="button"
            onClick={reset}
            className="self-start font-mono text-[12px] uppercase tracking-[0.08em] text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
          >
            {t.forms.newEntry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5" aria-describedby={`${formId}-hint`}>
      {prefilled && <p className="border-l-2 border-accent pl-3 text-[13px] text-ink-2">{t.contribute.prefill(prefilled)}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.forms.name} error={errorMessage(t, errors.name)}>
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              name="donor_name"
              autoComplete="off"
              maxLength={80}
              placeholder={t.forms.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className="field"
            />
          )}
        </Field>
        <Field label={t.forms.segment} error={errorMessage(t, errors.segment)}>
          {({ id, describedBy, invalid }) => (
            <select
              id={id}
              name="segment"
              value={segment}
              onChange={(e) => setSegment(e.target.value as Segment | "")}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className="field appearance-none bg-[length:12px] bg-[right_0.9rem_center] bg-no-repeat pr-9"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' fill='none' stroke='%2315140f' stroke-width='1.5'/%3E%3C/svg%3E\")",
              }}
            >
              <option value="">{t.forms.selectPlaceholder}</option>
              {SEGMENTS.map((s) => (
                <option key={s} value={s}>
                  {t.forms.segments[s]}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <AmountPicker
        name={`${channel}-amount`}
        presets={presets}
        value={amount}
        onChange={setAmount}
        currency={currency}
        label={t.forms.amount}
        otherLabel={t.forms.otherAmount}
        error={errorMessage(t, errors.amount)}
      />

      {currency === "EUR" && (
        <div className="flex items-baseline justify-between gap-4 border border-dashed border-line-strong px-4 py-3">
          <span className="text-[13px] text-ink-2">{t.ibanEur.preview}</span>
          <span className="font-mono text-[16px] tabular text-ink" aria-live="polite">
            {eurPreview ? `≈ ${formatLei(eurPreview)}` : "—"}
          </span>
        </div>
      )}

      <p id={`${formId}-hint`} className="text-[12px] leading-relaxed text-ink-3">
        {t.common.fictionalHint}
      </p>

      {submitted && hasErrors(errors) && <FormAlert>{t.forms.fixErrors}</FormAlert>}
      {saveError && <FormAlert>{t.forms.saveError}</FormAlert>}

      <SubmitButton busy={busy} busyLabel={t.common.saving}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
