"use client";

import { CONTEST } from "@/lib/facts";
import { formatInt, formatLei, formatPercent } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useMetrics } from "@/components/providers";
import { RefreshIcon } from "@/components/ui/icons";

export function FunnelStats() {
  const { t } = useI18n();
  const { stats, mode, status, refresh } = useMetrics();
  const loading = status === "loading";

  const corpPct = Math.min((stats.corporateTotalRon / CONTEST.targetGrossRon) * 100, 100);
  const indPct = Math.min((stats.pledgeTotalRon / CONTEST.targetGrossRon) * 100, 100 - corpPct);
  const combinedPct = ((stats.pledgeTotalRon + stats.corporateTotalRon) / CONTEST.targetGrossRon) * 100;

  const value = (v: string) => (loading ? <span className="inline-block h-[0.8em] w-24 animate-pulse bg-paper-2 align-middle" /> : v);

  return (
    <section id="analiza" aria-labelledby="stats-title" className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-10 lg:pt-32">
      <div className="flex flex-col gap-6 border-t border-ink pt-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.stats.kicker}</p>
          <h2 id="stats-title" className="mt-4 font-serif text-[clamp(2rem,4.6vw,3.25rem)] leading-[1] tracking-[-0.015em]">
            {t.stats.title}
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{t.stats.intro}</p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <span className="inline-flex items-center gap-2 font-mono text-[11.5px] text-ink-2">
            <span
              aria-hidden
              className={`size-2 rounded-full ${mode === "remote" ? "bg-ok" : mode === "local" ? "bg-ink-3" : "bg-line-strong"} ${
                mode === "remote" ? "shadow-[0_0_0_3px_rgba(44,106,63,0.15)]" : ""
              }`}
            />
            {mode === "remote" ? t.stats.live : mode === "local" ? t.stats.local : t.common.loading}
          </span>
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex min-h-9 items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-[0.08em] text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
          >
            <RefreshIcon className="size-3.5" />
            {t.stats.refresh}
          </button>
        </div>
      </div>

      {status === "error" && (
        <p role="status" className="mt-4 border-l-2 border-danger bg-danger-wash px-3 py-2 text-[13px] text-danger">
          {t.stats.error}
        </p>
      )}

      {/* Bento: three counters on the left, the progress ledger spanning the right. */}
      <div className="mt-10 grid gap-px border border-ink bg-ink lg:grid-cols-12" aria-live="polite">
        <article className="flex flex-col justify-between gap-8 bg-card p-5 sm:p-6 lg:col-span-4">
          <h3 className="eyebrow !text-ink-2">{t.stats.visitors}</h3>
          <div>
            <p className="font-mono text-[clamp(2.5rem,6vw,3.5rem)] leading-none tracking-[-0.04em] tabular">{value(formatInt(stats.visitors))}</p>
            <p className="mt-2 font-mono text-[12px] text-ink-3">{t.stats.visitorsNote}</p>
          </div>
        </article>

        <article className="flex flex-col justify-between gap-8 bg-card p-5 sm:p-6 lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="eyebrow !text-ink-2">{t.stats.corporate}</h3>
            <span className="demo-stamp">{t.common.simulation}</span>
          </div>
          <div>
            <p className="font-mono text-[clamp(2.5rem,6vw,3.5rem)] leading-none tracking-[-0.04em] tabular">{value(formatInt(stats.corporateCount))}</p>
            <p className="mt-2 font-mono text-[12px] text-ink-3 tabular">{t.stats.corporateNote(formatLei(stats.corporateTotalRon, 0))}</p>
          </div>
        </article>

        <article className="flex flex-col justify-between gap-8 bg-card p-5 sm:p-6 lg:col-span-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="eyebrow !text-ink-2">{t.stats.pledges}</h3>
            <span className="demo-stamp">{t.common.simulation}</span>
          </div>
          <div>
            <p className="font-mono text-[clamp(2.5rem,6vw,3.5rem)] leading-none tracking-[-0.04em] tabular">{value(formatInt(stats.pledgeCount))}</p>
            <p className="mt-2 font-mono text-[12px] text-ink-3 tabular">{t.stats.pledgesNote(formatLei(stats.pledgeTotalRon))}</p>
          </div>
        </article>

        <article className="bg-card p-5 sm:p-6 lg:col-span-12">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <h3 className="eyebrow !text-ink-2">{t.stats.progress}</h3>
            <span className="demo-stamp">{t.common.contestAssumption}</span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-4">
              <p className="font-mono text-[clamp(2.5rem,6vw,3.5rem)] leading-none tracking-[-0.04em] tabular text-accent">
                {value(formatPercent(combinedPct))}
              </p>
              <p className="mt-2 font-mono text-[12px] text-ink-3">{t.stats.progressOfTarget(formatLei(CONTEST.targetGrossRon))}</p>
            </div>

            <div className="lg:col-span-8">
              <div
                role="img"
                aria-label={`${t.stats.progressCorporate}: ${formatPercent(corpPct)}; ${t.stats.progressIndividual}: ${formatPercent(indPct)}; ${t.stats.progressReal}: 0%`}
                className="relative flex h-6 w-full overflow-hidden border border-ink bg-paper"
              >
                <div className="h-full bg-accent transition-[width] duration-700 ease-out" style={{ width: `${corpPct}%` }} />
                <div className="hatch h-full border-l border-paper transition-[width] duration-700 ease-out" style={{ width: `${indPct}%` }} />
                {/* 25% / 50% / 75% ticks */}
                {[25, 50, 75].map((x) => (
                  <span key={x} aria-hidden className="absolute inset-y-0 w-px bg-line-strong" style={{ left: `${x}%` }} />
                ))}
              </div>
              <ul className="mt-4 grid gap-3 text-[13px] sm:grid-cols-3">
                <li className="flex items-start gap-2.5">
                  <span aria-hidden className="mt-1 size-3 shrink-0 bg-accent" />
                  <span>
                    <span className="block text-ink">{t.stats.progressCorporate}</span>
                    <span className="font-mono text-[12px] text-ink-3 tabular">{formatLei(stats.corporateTotalRon, 0)}</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span aria-hidden className="hatch mt-1 size-3 shrink-0 border border-accent" />
                  <span>
                    <span className="block text-ink">{t.stats.progressIndividual}</span>
                    <span className="font-mono text-[12px] text-ink-3 tabular">{formatLei(stats.pledgeTotalRon)}</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span aria-hidden className="mt-1 size-3 shrink-0 border border-ink bg-paper" />
                  <span>
                    <span className="block font-medium text-ink">{t.stats.progressReal}</span>
                    <span className="font-mono text-[12px] text-ink-3">{t.stats.progressRealValue}</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
