"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  DEMO_IBAN_EUR,
  DEMO_IBAN_RON,
  DEMO_SMS_SHORTCODE,
  DEMO_SWIFT,
  OFFICIAL_CAMPAIGN_URL,
} from "@/lib/facts";
import { formatInt, formatLei } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useMetrics } from "@/components/providers";
import { CopyButton } from "@/components/ui/form";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { PledgeForm } from "./pledge-form";
import { CorporatePortal } from "./corporate-portal";

function ChannelSection({
  id,
  tag,
  title,
  subtitle,
  desc,
  aside,
  children,
}: {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  desc: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-ink pt-8 pb-16 sm:pb-20">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <header className="lg:col-span-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[12px] tracking-[0.12em] text-ink-3">{tag}</span>
            <span className="demo-stamp">
              {t.common.demo} / {t.common.simulation}
            </span>
          </div>
          <h2 id={`${id}-title`} className="mt-4 font-serif text-[clamp(1.85rem,3.8vw,2.6rem)] leading-[1.02] tracking-[-0.01em]">
            {title}
          </h2>
          <p className="mt-1 text-[14px] text-ink-3">{subtitle}</p>
          <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-ink-2">{desc}</p>
          {aside && <div className="mt-6">{aside}</div>}
        </header>
        <div className="lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}

function AccountPlate({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border border-ink bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-dashed border-ink px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">{label}</span>
        <span className="font-mono text-[10px] tracking-[0.14em] text-ink-3">FICTIV / FICTIONAL</span>
      </div>
      <div className="flex flex-col gap-3 px-4 py-4">
        <p className="break-all font-mono text-[17px] tracking-[0.04em] tabular text-ink sm:text-[18px]">{value}</p>
        {note && <p className="text-[12px] text-ink-3">{note}</p>}
        <CopyButton text={value} />
      </div>
    </div>
  );
}

export function ContributeView() {
  const { t } = useI18n();
  const { stats } = useMetrics();

  const index = [
    { id: "corporate", tag: "01", label: t.corporate.title },
    { id: "sms", tag: "02", label: t.sms.title },
    { id: "transfer-ron", tag: "03", label: t.ibanRon.title },
    { id: "transfer-eur", tag: "04", label: t.ibanEur.title },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      {/* Intro + the one real path */}
      <div className="grid gap-10 pt-12 pb-16 sm:pt-16 lg:grid-cols-12 lg:pt-20 lg:pb-20">
        <div className="lg:col-span-7">
          <p className="eyebrow">{t.contribute.kicker}</p>
          <h1 className="mt-5 font-serif text-[clamp(2.5rem,7vw,5rem)] leading-[0.96] tracking-[-0.02em] text-balance">
            {t.contribute.title}
          </h1>
          <p className="mt-6 max-w-[58ch] text-[16.5px] leading-[1.6] text-ink-2">{t.contribute.intro}</p>

          <nav aria-label={t.contribute.index} className="mt-10">
            <p className="eyebrow">{t.contribute.index}</p>
            <ol className="mt-3 border-t border-line">
              {index.map((i) => (
                <li key={i.id} className="border-b border-line">
                  <a href={`#${i.id}`} className="group flex min-h-12 items-center gap-4 py-2 text-[15px] text-ink transition-colors hover:text-accent">
                    <span className="font-mono text-[12px] text-ink-3">{i.tag}</span>
                    <span className="flex-1">{i.label}</span>
                    <span aria-hidden className="font-mono text-ink-3 transition-transform duration-200 group-hover:translate-y-0.5">↓</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <aside className="lg:col-span-5 lg:pt-10">
          <div className="flex h-full flex-col justify-between gap-8 bg-accent p-6 text-paper sm:p-8">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper/70">fundatia.upb.ro</p>
              <h2 className="mt-4 font-serif text-[clamp(1.9rem,3.6vw,2.6rem)] leading-[1.02]">{t.contribute.realTitle}</h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-paper/85">{t.contribute.realText}</p>
            </div>
            <a
              href={OFFICIAL_CAMPAIGN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-12 items-center justify-between gap-4 bg-paper px-5 text-[15px] font-medium text-accent-ink transition-colors hover:bg-card"
            >
              {t.contribute.realCta}
              <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </aside>
      </div>

      <section id="corporate" aria-labelledby="corporate-title" className="border-t border-ink pt-8 pb-16 sm:pb-20">
        <div className="grid gap-6 pb-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[12px] tracking-[0.12em] text-ink-3">{t.corporate.tag}</span>
              <span className="demo-stamp">
                {t.common.demo} / {t.common.simulation}
              </span>
            </div>
            <h2 id="corporate-title" className="mt-4 font-serif text-[clamp(1.85rem,3.8vw,2.6rem)] leading-[1.02] tracking-[-0.01em]">
              {t.corporate.title}
            </h2>
            <p className="mt-1 text-[14px] text-ink-3">{t.corporate.subtitle}</p>
          </div>
          <p className="max-w-md text-[14.5px] leading-relaxed text-ink-2 lg:col-span-5 lg:pt-10">{t.corporate.desc}</p>
        </div>
        <CorporatePortal />
        <Link href="/companii" className="group mt-5 inline-flex items-center gap-2 text-[14px] text-ink-2 hover:text-ink">
          {t.contribute.hubLink}
          <ArrowRight className="size-4 text-accent transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </section>

      <ChannelSection
        id="sms"
        tag={t.sms.tag}
        title={t.sms.title}
        subtitle={t.sms.subtitle}
        desc={t.sms.desc}
        aside={
          <div className="flex flex-col gap-4">
            <div className="border border-ink bg-card px-4 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">{t.sms.shortcodeLabel}</p>
              <p className="mt-2 font-mono text-[28px] leading-none tracking-tight">{DEMO_SMS_SHORTCODE}</p>
              <p className="mt-2 font-mono text-[12px] text-ink-2">{t.sms.keyword}</p>
            </div>
            <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2" aria-live="polite">
              <span className="eyebrow">{t.contribute.liveCounter}</span>
              <span className="font-mono text-[13px] tabular text-ink">
                {t.sms.counter(formatInt(stats.smsCount), formatLei(stats.smsTotalRon))}
              </span>
            </div>
          </div>
        }
      >
        <div className="border border-line bg-card p-5 sm:p-7">
          <PledgeForm channel="sms" presets={[10, 25, 50]} submitLabel={t.sms.submit} />
        </div>
      </ChannelSection>

      <ChannelSection
        id="transfer-ron"
        tag={t.ibanRon.tag}
        title={t.ibanRon.title}
        subtitle={t.ibanRon.subtitle}
        desc={t.ibanRon.desc}
        aside={<AccountPlate label={t.ibanRon.ibanLabel} value={DEMO_IBAN_RON} note={t.ibanRon.beneficiary} />}
      >
        <div className="border border-line bg-card p-5 sm:p-7">
          <PledgeForm channel="iban_ron" presets={[100, 250, 500]} submitLabel={t.ibanRon.submit} prefillFromQuery />
        </div>
      </ChannelSection>

      <ChannelSection
        id="transfer-eur"
        tag={t.ibanEur.tag}
        title={t.ibanEur.title}
        subtitle={t.ibanEur.subtitle}
        desc={t.ibanEur.desc}
        aside={
          <div className="flex flex-col gap-4">
            <AccountPlate label={t.ibanEur.ibanLabel} value={DEMO_IBAN_EUR} />
            <AccountPlate label={t.ibanEur.swiftLabel} value={DEMO_SWIFT} />
            <p className="font-mono text-[12px] text-ink-2">{t.ibanEur.rate}</p>
          </div>
        }
      >
        <div className="border border-line bg-card p-5 sm:p-7">
          <PledgeForm channel="iban_eur" presets={[20, 50, 100]} submitLabel={t.ibanEur.submit} />
        </div>
      </ChannelSection>

    </div>
  );
}
