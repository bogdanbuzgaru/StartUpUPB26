"use client";

import { CONTEST, OFFICIAL, OFFICIAL_CAMPAIGN_URL, TEAM_CODE } from "@/lib/facts";
import { formatLei } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { SegmentCallout } from "@/components/segment-callout";
import { CampaignSimulator } from "./campaign-simulator";
import { Roadmap } from "./roadmap";
import { ArrowUpRight } from "@/components/ui/icons";

function Row({ k, v, mono = true }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="grid gap-1 border-b border-line py-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6">
      <dt className="text-[13px] text-ink-3">{k}</dt>
      <dd className={mono ? "font-mono text-[clamp(1.25rem,2.4vw,1.6rem)] leading-tight tracking-[-0.02em] tabular text-ink" : "text-[15px] leading-relaxed text-ink"}>
        {v}
      </dd>
    </div>
  );
}

export function TransparencyView() {
  const { t } = useI18n();
  const tr = t.transparency;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <header className="pt-12 pb-16 sm:pt-16 lg:pt-20 lg:pb-20">
        <p className="eyebrow">{tr.kicker}</p>
        <h1 className="mt-5 max-w-4xl font-serif text-[clamp(2.5rem,7vw,5rem)] leading-[0.96] tracking-[-0.02em] text-balance">{tr.title}</h1>
        <p className="mt-6 max-w-[62ch] text-[16.5px] leading-[1.6] text-ink-2">{tr.lede}</p>
      </header>

      {/* Official vs. simulated – two ledgers side by side */}
      <div className="grid gap-px border border-ink bg-ink lg:grid-cols-2">
        <section aria-labelledby="official-title" className="bg-card p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="official-title" className="font-serif text-[clamp(1.6rem,3vw,2.15rem)] leading-[1.05]">{tr.officialTitle}</h2>
            <span className="demo-stamp !border-solid !border-accent text-accent">{t.common.official}</span>
          </div>
          <dl className="mt-6 border-t border-ink">
            <Row k={tr.officialPhase1} v={formatLei(OFFICIAL.phase1Ron)} />
            <Row k={tr.officialTotal} v={formatLei(OFFICIAL.totalInvestmentRon)} />
            <Row k={tr.officialBeneficiaries} v={tr.officialBeneficiariesValue} mono={false} />
            <div className="grid gap-1 py-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-6">
              <dt className="text-[13px] text-ink-3">{tr.officialSource}</dt>
              <dd>
                <a
                  href={OFFICIAL_CAMPAIGN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-1.5 break-all font-mono text-[13px] leading-relaxed text-accent hover:text-accent-ink"
                >
                  fundatia.upb.ro/proiecte-si-evenimente/un-loc-in-camin-poate-schimba-un-destin/
                  <ArrowUpRight className="mt-0.5 size-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="contest-title" className="bg-paper-2/70 p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="contest-title" className="font-serif text-[clamp(1.6rem,3vw,2.15rem)] leading-[1.05]">{tr.contestTitle}</h2>
            <span className="demo-stamp">{t.common.contestAssumption}</span>
          </div>
          <dl className="mt-6 border-t border-ink">
            <Row k={tr.contestTarget} v={formatLei(CONTEST.targetGrossRon)} />
            <Row k={tr.contestBudget} v={formatLei(CONTEST.maxCampaignBudgetRon)} />
            <Row k={tr.contestDuration} v={tr.contestDurationValue} />
            <Row k={tr.contestCorporate} v={tr.contestCorporateValue} />
            <Row k={tr.contestTeam} v={TEAM_CODE} />
          </dl>
        </section>
      </div>

      <div className="mt-px">
        <SegmentCallout id="segment-transparenta" />
      </div>

      <CampaignSimulator />
      <Roadmap />

      {/* Ethics & privacy enforcement */}
      <section aria-labelledby="ethics-title" className="pt-20 lg:pt-28">
        <div className="grid gap-6 border-t border-ink pt-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p className="eyebrow">{tr.ethicsKicker}</p>
            <h2 id="ethics-title" className="mt-4 font-serif text-[clamp(1.85rem,3.8vw,2.6rem)] leading-[1.02] tracking-[-0.01em]">
              {tr.ethicsTitle}
            </h2>
          </div>
          <ol className="grid gap-px border border-ink bg-ink sm:grid-cols-2 lg:col-span-8">
            {tr.ethics.map((e, i) => (
              <li key={e.k} className="flex flex-col gap-3 bg-card p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[12px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  <span aria-hidden className="h-px flex-1 bg-line" />
                  <span aria-hidden className="font-mono text-[11px] text-ok">✓</span>
                </div>
                <h3 className="text-[16px] font-medium leading-snug text-ink">{e.k}</h3>
                <p className="text-[14px] leading-relaxed text-ink-2">{e.v}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Methodology */}
      <section aria-labelledby="method-title" className="pt-20 lg:pt-28">
        <div className="grid gap-6 border-t border-ink pt-8 lg:grid-cols-12 lg:gap-10">
          <h2 id="method-title" className="font-serif text-[clamp(1.85rem,3.8vw,2.6rem)] leading-[1.02] tracking-[-0.01em] lg:col-span-4">
            {tr.methodTitle}
          </h2>
          <dl className="lg:col-span-8">
            {tr.method.map((m) => (
              <div key={m.k} className="grid gap-1 border-b border-line py-4 first:border-t sm:grid-cols-[minmax(0,16rem)_1fr] sm:gap-6">
                <dt className="text-[14px] text-ink-2">{m.k}</dt>
                <dd className="font-mono text-[14px] text-ink tabular">{m.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
