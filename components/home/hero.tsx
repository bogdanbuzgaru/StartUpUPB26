"use client";

import Link from "next/link";
import { CONTEST, OFFICIAL } from "@/lib/facts";
import { formatLei } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { ArrowRight } from "@/components/ui/icons";

export function Hero() {
  const { t } = useI18n();
  return (
    <section aria-labelledby="hero-title" className="relative">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:pt-24 lg:pb-24">
        {/* Editorial column */}
        <div className="lg:col-span-7">
          <p className="eyebrow max-w-md">{t.hero.kicker}</p>
          <h1
            id="hero-title"
            className="mt-6 font-serif text-[clamp(2.75rem,8.4vw,6.25rem)] leading-[0.94] tracking-[-0.02em] text-ink text-balance"
          >
            {t.hero.title.split(" ").slice(0, -2).join(" ")}{" "}
            <em className="text-accent">{t.hero.title.split(" ").slice(-2).join(" ")}</em>
          </h1>
          <p className="mt-8 max-w-[56ch] text-[17px] leading-[1.6] text-ink-2">{t.hero.lede}</p>

          <div className="mt-8 flex max-w-xl gap-4 border-l-2 border-accent pl-4">
            <div>
              <p className="eyebrow !text-accent">{t.hero.beneficiariesLabel}</p>
              <p className="mt-1.5 text-[15px] leading-snug text-ink">{t.hero.beneficiaries}</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link
              href="/companii"
              className="group inline-flex min-h-12 items-center justify-between gap-6 bg-ink px-5 text-[15px] font-medium text-paper transition-colors hover:bg-ink-2"
            >
              {t.hero.ctaPrimary}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/absolventi"
              className="inline-flex min-h-12 items-center text-[15px] text-ink underline decoration-line-strong decoration-1 underline-offset-[6px] transition-colors hover:decoration-ink"
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        {/* Ledger of official figures */}
        <aside aria-label={t.common.official} className="lg:col-span-5 lg:pt-3">
          <dl className="border-t border-ink">
            <div className="grid grid-cols-[auto_1fr] gap-x-5 border-b border-line py-6">
              <span className="font-mono text-[12px] text-ink-3">01</span>
              <div>
                <dt className="text-[13.5px] text-ink-2">{t.hero.phase1Label}</dt>
                <dd className="mt-2 font-mono text-[clamp(2rem,5.4vw,2.85rem)] leading-none tracking-[-0.03em] tabular text-ink">
                  {formatLei(OFFICIAL.phase1Ron)}
                </dd>
                <dd className="mt-3">
                  <span className="demo-stamp !border-solid !border-accent text-accent">{t.common.official}</span>
                </dd>
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-x-5 border-b border-line py-6">
              <span className="font-mono text-[12px] text-ink-3">02</span>
              <div>
                <dt className="text-[13.5px] text-ink-2">{t.hero.totalLabel}</dt>
                <dd className="mt-2 font-mono text-[clamp(2rem,5.4vw,2.85rem)] leading-none tracking-[-0.03em] tabular text-ink">
                  {formatLei(OFFICIAL.totalInvestmentRon)}
                </dd>
                <dd className="mt-3">
                  <span className="demo-stamp !border-solid !border-accent text-accent">{t.common.official}</span>
                </dd>
              </div>
            </div>
          </dl>

          {/* Proportion strip: Phase 1 against the total */}
          <div className="mt-6">
            <div className="flex h-2 w-full bg-paper-2" aria-hidden>
              <div className="h-full bg-accent" style={{ width: `${Math.max((OFFICIAL.phase1Ron / OFFICIAL.totalInvestmentRon) * 100, 1.25)}%` }} />
            </div>
            <p className="mt-2.5 text-[13px] text-ink-3">{t.hero.ratio}</p>
          </div>
        </aside>
      </div>

      {/* Contest assumptions strip */}
      <div className="border-y border-line bg-paper-2/50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-10">
          <div className="lg:col-span-4">
            <span className="demo-stamp">{t.common.contestAssumption}</span>
            <h2 className="mt-3 text-[15px] font-medium text-ink">{t.hero.contestTitle}</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-3">{t.hero.contestNote}</p>
          </div>
          <dl className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:col-span-8">
            {[
              { k: t.hero.contestTarget, v: formatLei(CONTEST.targetGrossRon) },
              { k: t.hero.contestDuration, v: t.hero.contestDurationValue },
              { k: t.hero.contestBudget, v: formatLei(CONTEST.maxCampaignBudgetRon) },
            ].map((row) => (
              <div key={row.k} className="flex items-baseline justify-between gap-4 py-3 sm:block sm:px-6 sm:py-0 sm:first:pl-0">
                <dt className="text-[12.5px] text-ink-3">{row.k}</dt>
                <dd className="font-mono text-[20px] tracking-tight tabular text-ink sm:mt-1.5 sm:text-[22px]">{row.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
