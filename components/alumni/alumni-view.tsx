"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AMBASSADOR_CHANNELS, buildAmbassadorMessage, type AmbassadorChannel } from "@/lib/ambassador";
import { LIMITS, OFFICIAL } from "@/lib/facts";
import { formatInt, formatLei, formatPercent, shareOfPhase1 } from "@/lib/format";
import { errorMessage, type Lang } from "@/lib/dictionary";
import { useI18n } from "@/lib/i18n";
import { validateAmount } from "@/lib/validation";
import { useTesterSignal } from "@/components/providers";
import { AmountPicker, CopyButton } from "@/components/ui/form";
import { ArrowRight } from "@/components/ui/icons";

const PRESETS = [100, 250, 500, 1000];
const TESTER_AMOUNTS = ["250", "1000", "500"];

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  render,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  render: (v: T) => string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-ink">{label}</span>
      <div className="flex border border-ink">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={`min-h-10 flex-1 border-r border-ink px-3 font-mono text-[12px] uppercase tracking-[0.08em] transition-colors last:border-r-0 ${
              value === o ? "bg-ink text-paper" : "bg-card text-ink hover:bg-paper-2"
            }`}
          >
            {render(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AlumniView() {
  const { t, lang } = useI18n();
  const [raw, setRaw] = useState("250");
  const [channel, setChannel] = useState<AmbassadorChannel>("linkedin");
  const [msgLang, setMsgLang] = useState<Lang | null>(null);
  const messageLang = msgLang ?? lang;

  useTesterSignal((kind, nonce) => {
    if (kind === "corporate") return;
    if (kind === "reset") {
      setRaw("250");
      setChannel("linkedin");
      setMsgLang(null);
    } else if (kind === "alumni") {
      setRaw(TESTER_AMOUNTS[(nonce - 1) % TESTER_AMOUNTS.length]);
      setChannel(AMBASSADOR_CHANNELS[(nonce - 1) % AMBASSADOR_CHANNELS.length]);
    } else {
      setRaw("abc");
    }
  });

  const result = useMemo(() => validateAmount(raw, LIMITS.persona), [raw]);
  const amount = result.value;
  const error = errorMessage(t, result.error);
  const pct = amount ? shareOfPhase1(amount) : 0;
  const message = amount ? buildAmbassadorMessage(messageLang, channel, formatLei(amount), formatPercent(pct)) : "";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <header className="grid gap-10 pt-12 pb-16 sm:pt-16 lg:grid-cols-12 lg:gap-12 lg:pt-20 lg:pb-20">
        <div className="lg:col-span-7">
          <p className="eyebrow">{t.alumniPage.kicker}</p>
          <h1 className="mt-5 font-serif text-[clamp(2.5rem,7vw,5rem)] leading-[0.96] tracking-[-0.02em] text-balance">
            {t.alumniPage.title}
          </h1>
          <p className="mt-6 max-w-[58ch] text-[16.5px] leading-[1.6] text-ink-2">{t.alumniPage.lede}</p>
        </div>
        <aside className="lg:col-span-5 lg:pt-3">
          <p className="eyebrow">{t.alumniPage.rulesTitle}</p>
          <ol className="mt-3 border-t border-ink">
            {t.alumniPage.rules.map((r, i) => (
              <li key={r} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-line py-4 text-[14.5px] leading-relaxed text-ink">
                <span className="font-mono text-[12px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                {r}
              </li>
            ))}
          </ol>
        </aside>
      </header>

      {/* Phase 1 impact calculator */}
      <section id="calculator" aria-labelledby="calc-title" className="border-t border-ink pt-8">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="calc-title" className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-2">
            {t.alumniPage.calcKicker}
          </h2>
          <span className="demo-stamp">{t.common.simulation}</span>
        </div>

        <div className="mt-6 grid gap-px border border-ink bg-ink md:grid-cols-5">
          <div className="flex flex-col gap-6 bg-card p-5 sm:p-7 md:col-span-2">
            <AmountPicker
              name="alumni-amount"
              presets={PRESETS}
              value={raw}
              onChange={setRaw}
              currency="RON"
              label={t.alumniPage.amountLabel}
              otherLabel={t.alumniPage.customPlaceholder}
              error={error}
            />
            <p className="text-[12.5px] leading-relaxed text-ink-3">{t.alumniPage.principle}</p>
          </div>

          <div className="flex flex-col justify-between gap-8 bg-card p-5 sm:p-7 md:col-span-3" aria-live="polite">
            <div>
              <p className="eyebrow">{t.alumniPage.resultLabel}</p>
              <p className="mt-3 font-mono text-[clamp(3rem,9vw,5rem)] leading-none tracking-[-0.04em] tabular text-accent">
                {amount ? formatPercent(pct) : "—"}
              </p>
              <p className="mt-4 font-mono text-[13px] text-ink-2 tabular">{t.alumniPage.resultOf(amount ? formatLei(amount) : "—")}</p>
              {amount && (
                <p className="mt-1 text-[13px] text-ink-3">
                  {t.alumniPage.resultEquivalent(formatInt(Math.ceil(OFFICIAL.phase1Ron / amount)))}
                </p>
              )}
            </div>
            {/* A 1.000-cell strip would be noise; a single precise bar with a minimum visible width reads better. */}
            <div>
              <div className="relative h-3 w-full border border-ink bg-paper" aria-hidden>
                <div className="h-full bg-accent transition-[width] duration-500 ease-out" style={{ width: `${amount ? Math.max(Math.min(pct, 100), 0.6) : 0}%` }} />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-3 tabular">
                <span>0</span>
                <span>{formatLei(OFFICIAL.phase1Ron)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ambassador message generator */}
      <section id="ambasador" aria-labelledby="gen-title" className="pt-20 lg:pt-28">
        <div className="grid gap-8 border-t border-ink pt-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <h2 id="gen-title" className="font-serif text-[clamp(1.85rem,3.8vw,2.6rem)] leading-[1.02] tracking-[-0.01em]">
              {t.alumniPage.genKicker}
            </h2>
            <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-ink-2">{t.alumniPage.genIntro}</p>
            <div className="mt-8 flex flex-col gap-5">
              <Segmented
                label={t.alumniPage.channelLabel}
                options={AMBASSADOR_CHANNELS}
                value={channel}
                onChange={setChannel}
                render={(c) => t.alumniPage.channels[c]}
              />
              <Segmented<Lang>
                label={t.alumniPage.msgLangLabel}
                options={["ro", "en"] as const}
                value={messageLang}
                onChange={setMsgLang}
                render={(l) => l.toUpperCase()}
              />
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="border border-ink bg-paper">
              <div className="flex items-center justify-between gap-3 border-b border-dashed border-ink px-5 py-3">
                <p className="font-mono text-[12px] uppercase tracking-[0.12em]">
                  {t.alumniPage.channels[channel]} · {messageLang.toUpperCase()}
                </p>
                <span className="demo-stamp">{t.common.demo}</span>
              </div>
              <pre
                lang={messageLang}
                className="max-h-[28rem] min-h-56 overflow-auto whitespace-pre-wrap break-words px-5 py-5 font-sans text-[14px] leading-relaxed text-ink-2"
              >
                {message || "—"}
              </pre>
              <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                {message ? <CopyButton text={message} label={t.alumniPage.copy} /> : <span />}
                <Link
                  href={amount ? `/contribuie?suma=${amount}#transfer-ron` : "/contribuie#transfer-ron"}
                  className="group inline-flex min-h-11 items-center justify-between gap-3 bg-accent px-4 text-[14px] font-medium text-paper transition-colors hover:bg-accent-ink"
                >
                  {t.alumniPage.proceed}
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
