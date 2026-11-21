"use client";

import Link from "next/link";
import { CONTEST, INDUSTRIES, OFFICIAL_CAMPAIGN_URL } from "@/lib/facts";
import { formatInt, formatLei } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { CorporatePortal } from "@/components/contribute/corporate-portal";
import { SegmentCallout } from "@/components/segment-callout";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";

export function CompaniesView() {
  const { t } = useI18n();
  const corpOfTarget = (CONTEST.corporateGrossRon / CONTEST.targetGrossRon) * 100;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      {/* Intro */}
      <header className="grid gap-10 pt-12 pb-16 sm:pt-16 lg:grid-cols-12 lg:gap-12 lg:pt-20 lg:pb-24">
        <div className="lg:col-span-7">
          <p className="eyebrow">{t.companies.kicker}</p>
          <h1 className="mt-5 font-serif text-[clamp(2.5rem,6.6vw,4.75rem)] leading-[0.96] tracking-[-0.02em] text-balance">
            {t.companies.title}
          </h1>
          <p className="mt-6 max-w-[58ch] text-[16.5px] leading-[1.6] text-ink-2">{t.companies.lede}</p>
          <a
            href="#corporate"
            className="group mt-9 inline-flex min-h-12 items-center gap-6 bg-ink px-5 text-[15px] font-medium text-paper transition-colors hover:bg-ink-2"
          >
            {t.companies.builderTitle}
            <ArrowRight className="size-4 rotate-90 transition-transform duration-200 group-hover:translate-y-0.5" />
          </a>
        </div>
        <div className="lg:col-span-5 lg:pt-2">
          <SegmentCallout id="segment-companii" />
        </div>
      </header>

      {/* Five recruiting sectors */}
      <section aria-labelledby="sectors-title" className="border-t border-ink pt-8 pb-20">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <h2 id="sectors-title" className="font-serif text-[clamp(1.85rem,3.8vw,2.6rem)] leading-[1.02] tracking-[-0.01em]">
              {t.companies.sectorsTitle}
            </h2>
            <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-ink-2">{t.companies.sectorsIntro}</p>
          </div>
          <ol className="lg:col-span-8">
            {INDUSTRIES.map((k, i) => (
              <li key={k} className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 border-b border-line py-5 first:border-t sm:grid-cols-[2.5rem_minmax(0,16rem)_1fr]">
                <span className="font-mono text-[12px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-serif text-[24px] leading-tight text-ink">{t.industries[k]}</span>
                <span className="col-start-2 mt-1 text-[14px] leading-relaxed text-ink-2 sm:col-start-3 sm:mt-0">{t.companies.sectorNotes[k]}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Competition assumption: 20 × 10.000 = 200.000 */}
      <section aria-labelledby="model-title" className="border border-ink bg-paper-2/60">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink px-5 py-3 sm:px-7">
          <h2 id="model-title" className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink">
            {t.companies.modelTitle}
          </h2>
          <span className="demo-stamp">{t.common.contestAssumption}</span>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-end">
          {[
            { k: t.companies.modelSponsors, v: formatInt(CONTEST.corporateSponsors) },
            { op: "×" },
            { k: t.companies.modelTicket, v: formatLei(CONTEST.corporateTicketRon) },
            { op: "=" },
            { k: t.companies.modelGross, v: formatLei(CONTEST.corporateGrossRon), strong: true },
          ].map((c, i) =>
            "op" in c ? (
              <div key={i} aria-hidden className="hidden px-2 pb-7 font-mono text-[28px] text-ink-3 sm:block">
                {c.op}
              </div>
            ) : (
              <div key={i} className="border-b border-line px-5 py-6 last:border-b-0 sm:border-b-0 sm:px-7">
                <dt className="text-[12.5px] text-ink-3">{c.k}</dt>
                <dd className={`mt-2 font-mono text-[clamp(1.9rem,4.6vw,2.85rem)] leading-none tracking-[-0.03em] tabular ${c.strong ? "text-accent" : "text-ink"}`}>
                  {c.v}
                </dd>
              </div>
            ),
          )}
        </dl>
        <div className="border-t border-line px-5 py-5 sm:px-7">
          <div className="flex h-3 w-full border border-ink bg-paper" aria-hidden>
            <div className="h-full bg-accent" style={{ width: `${corpOfTarget}%` }} />
            <div className="hatch h-full flex-1 border-l border-paper" />
          </div>
          <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-ink-2">{t.companies.modelNote}</p>
        </div>
      </section>

      {/* Builder */}
      <section id="corporate" aria-labelledby="builder-title" className="pt-20 lg:pt-28">
        <div className="grid gap-6 border-t border-ink pt-8 pb-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[12px] tracking-[0.12em] text-ink-3">{t.companies.builderKicker}</span>
              <span className="demo-stamp">
                {t.common.demo} / {t.common.simulation}
              </span>
            </div>
            <h2 id="builder-title" className="mt-4 font-serif text-[clamp(1.85rem,3.8vw,2.6rem)] leading-[1.02] tracking-[-0.01em]">
              {t.companies.builderTitle}
            </h2>
          </div>
          <p className="max-w-md text-[14.5px] leading-relaxed text-ink-2 lg:col-span-5 lg:pt-8">{t.companies.builderIntro}</p>
        </div>
        <CorporatePortal />
      </section>

      {/* Guardrails */}
      <section aria-labelledby="principles-title" className="grid gap-8 pt-20 lg:grid-cols-12 lg:gap-10 lg:pt-28">
        <div className="lg:col-span-4">
          <h2 id="principles-title" className="font-serif text-[clamp(1.85rem,3.8vw,2.6rem)] leading-[1.02] tracking-[-0.01em]">
            {t.companies.principlesTitle}
          </h2>
          <div className="mt-6 flex flex-col items-start gap-3">
            <Link href="/transparenta" className="group inline-flex items-center gap-2 text-[14px] font-medium text-accent">
              {t.nav.transparency}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <a href={OFFICIAL_CAMPAIGN_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5 text-[14px] text-ink-2 hover:text-ink">
              {t.banner.cta}
              <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
        <ul className="grid gap-px border border-ink bg-ink sm:grid-cols-2 lg:col-span-8">
          {t.companies.principles.map((p, i) => (
            <li key={p} className="flex gap-4 bg-card p-5 sm:p-6">
              <span className="font-mono text-[12px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-[14.5px] leading-relaxed text-ink">{p}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
