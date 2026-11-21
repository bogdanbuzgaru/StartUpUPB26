"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { INDUSTRIES, SEGMENTS, type Channel } from "@/lib/facts";
import { formatInt, formatLei, formatPercent } from "@/lib/format";
import { insightsCopy } from "@/lib/dictionary-insights";
import { useI18n } from "@/lib/i18n";
import { useMetrics } from "@/components/providers";
import { RefreshIcon } from "@/components/ui/icons";
import { BarList, DailyColumns } from "./charts";
import { useInsights } from "./use-insights";

const CHANNELS: Channel[] = ["sms", "iban_ron", "iban_eur"];

function Panel({ title, aside, children, className = "" }: { title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-5 bg-card p-5 sm:p-6 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="eyebrow !text-ink-2">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function MetricToggle({ value, onChange, labels }: { value: "total" | "count"; onChange: (v: "total" | "count") => void; labels: { total: string; count: string } }) {
  return (
    <div role="group" className="flex border border-line-strong font-mono text-[10.5px] uppercase tracking-[0.08em]">
      {(["total", "count"] as const).map((m) => (
        <button
          key={m}
          type="button"
          aria-pressed={value === m}
          onClick={() => onChange(m)}
          className={`min-h-7 px-2 transition-colors ${value === m ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"}`}
        >
          {labels[m]}
        </button>
      ))}
    </div>
  );
}

function relative(iso: string, a: (typeof insightsCopy)["ro"]["analytics"]["ago"]): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return a.now;
  if (min < 60) return a.min(min);
  const h = Math.floor(min / 60);
  if (h < 24) return a.h(h);
  return a.d(Math.floor(h / 24));
}

export function AnalyticsView() {
  const { lang } = useI18n();
  const c = insightsCopy[lang].analytics;
  const { stats } = useMetrics();
  const { insights, status, mode, schemaOutdated, at, reload } = useInsights();
  const [chMetric, setChMetric] = useState<"total" | "count">("total");
  const [segMetric, setSegMetric] = useState<"total" | "count">("total");
  const [indMetric, setIndMetric] = useState<"total" | "count">("count");
  const locale = lang === "ro" ? "ro-RO" : "en-GB";
  const loading = status === "loading";

  const rate = (n: number) => (stats.visitors > 0 ? formatPercent((n / stats.visitors) * 100) : "—");
  const avgPledge = stats.pledgeCount > 0 ? stats.pledgeTotalRon / stats.pledgeCount : null;
  const avgCorp = stats.corporateCount > 0 ? stats.corporateTotalRon / stats.corporateCount : null;
  const refShare = stats.pledgeCount > 0 ? (insights.referredPledges / stats.pledgeCount) * 100 : 0;

  const steps = [
    { label: c.steps.visitors, value: stats.visitors, rate: null },
    { label: c.steps.pledges, value: stats.pledgeCount, rate: rate(stats.pledgeCount) },
    { label: c.steps.corporate, value: stats.corporateCount, rate: rate(stats.corporateCount) },
  ];

  const lmk = { total: c.byTotal, count: c.byCount };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <header className="grid gap-8 pt-12 pb-12 sm:pt-16 lg:grid-cols-12 lg:gap-12 lg:pt-20">
        <div className="lg:col-span-8">
          <p className="eyebrow">{c.kicker}</p>
          <h1 className="mt-5 font-serif text-[clamp(2.5rem,7vw,5rem)] leading-[0.96] tracking-[-0.02em] text-balance">{c.title}</h1>
          <p className="mt-6 max-w-[60ch] text-[16.5px] leading-[1.6] text-ink-2">{c.lede}</p>
        </div>
        <div className="flex flex-col items-start gap-3 lg:col-span-4 lg:items-end lg:justify-end">
          <span className="inline-flex items-center gap-2 font-mono text-[11.5px] text-ink-2">
            <span aria-hidden className={`size-2 rounded-full ${mode === "remote" ? "bg-ok" : "bg-ink-3"}`} />
            {mode === "remote" ? c.live : mode === "local" ? c.local : "…"}
          </span>
          {at && <span className="font-mono text-[11px] text-ink-3">{c.updated(at.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" }))}</span>}
          <button
            type="button"
            onClick={() => void reload()}
            className="inline-flex min-h-9 items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-[0.08em] text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
          >
            <RefreshIcon className="size-3.5" />
            {c.refresh}
          </button>
        </div>
      </header>

      {status === "error" && <p role="status" className="mb-6 border-l-2 border-danger bg-danger-wash px-3 py-2 text-[13px] text-danger">{c.error}</p>}
      {schemaOutdated && <p role="status" className="mb-6 border-l-2 border-accent bg-accent-wash px-3 py-2 text-[13px] text-accent-ink">{c.schemaOutdated}</p>}

      {/* Funnel + unit economics */}
      <section aria-label={c.funnelTitle} className="border-t border-ink pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-2">{c.funnelTitle}</h2>
          <p className="text-[12.5px] text-ink-3">{c.funnelNote}</p>
        </div>
        <ol className="mt-5 grid gap-px border border-ink bg-ink md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.label} className="relative flex flex-col justify-between gap-6 bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-ink-2">{s.label}</span>
                <span className="font-mono text-[11px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div>
                <p className="font-mono text-[clamp(2.25rem,5vw,3.25rem)] leading-none tracking-[-0.04em] tabular">
                  {loading ? "—" : formatInt(s.value)}
                </p>
                <p className="mt-2 font-mono text-[12px] text-accent">{s.rate ? c.rate(s.rate) : " "}</p>
              </div>
            </li>
          ))}
        </ol>
        <dl className="grid grid-cols-1 divide-y divide-line border-x border-b border-ink bg-paper-2/50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { k: c.avgPledge, v: avgPledge === null ? "—" : formatLei(avgPledge) },
            { k: c.avgCorporate, v: avgCorp === null ? "—" : formatLei(avgCorp, 0) },
            { k: c.referredShare, v: formatPercent(refShare), note: c.referredShareNote(formatInt(insights.referredPledges)) },
          ].map((m) => (
            <div key={m.k} className="px-5 py-4">
              <dt className="text-[12.5px] text-ink-3">{m.k}</dt>
              <dd className="mt-1 font-mono text-[20px] tracking-tight tabular">{m.v}</dd>
              {m.note && <dd className="mt-0.5 text-[11.5px] text-ink-3">{m.note}</dd>}
            </div>
          ))}
        </dl>
      </section>

      {/* Time series + channel mix */}
      <div className="mt-12 grid gap-px border border-ink bg-ink lg:grid-cols-12">
        <Panel title={c.dailyTitle} className="lg:col-span-8">
          <DailyColumns
            data={insights.daily}
            locale={locale}
            tooltip={c.dailyTooltip}
            emptyLabel={c.dailyEmpty}
            tableToggle={c.tableToggle}
            cols={{ day: c.tableDay, count: c.tableCount, total: c.tableTotal }}
          />
        </Panel>
        <Panel title={c.channelTitle} aside={<MetricToggle value={chMetric} onChange={setChMetric} labels={lmk} />} className="lg:col-span-4">
          <BarList
            metric={chMetric}
            emptyLabel={c.empty}
            rows={CHANNELS.map((k) => ({ key: k, label: c.channels[k], ...insights.byChannel[k] }))}
          />
        </Panel>
      </div>

      {/* Audience: who gives, which sectors ask */}
      <div className="mt-px grid gap-px border-x border-b border-ink bg-ink md:grid-cols-2">
        <Panel title={c.segmentTitle} aside={<MetricToggle value={segMetric} onChange={setSegMetric} labels={lmk} />}>
          <BarList metric={segMetric} emptyLabel={c.empty} rows={SEGMENTS.map((k) => ({ key: k, label: c.segments[k], ...insights.bySegment[k] }))} />
        </Panel>
        <Panel title={c.industryTitle} aside={<MetricToggle value={indMetric} onChange={setIndMetric} labels={lmk} />}>
          <BarList metric={indMetric} emptyLabel={c.empty} rows={INDUSTRIES.map((k) => ({ key: k, label: c.industries[k], ...insights.byIndustry[k] }))} />
        </Panel>
      </div>

      {/* Activity feed + ambassador leaderboard */}
      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <section aria-labelledby="recent-title" className="lg:col-span-5">
          <div className="border-t border-ink pt-5">
            <h2 id="recent-title" className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-2">{c.recentTitle}</h2>
            <p className="mt-1 text-[12px] text-ink-3">{c.recentNote}</p>
          </div>
          {insights.recent.length === 0 ? (
            <p className="mt-6 text-[13.5px] text-ink-3">
              {c.recentEmpty}{" "}
              <Link href="/contribuie" className="text-accent underline underline-offset-4">→</Link>
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {insights.recent.map((r, i) => (
                <li key={`${r.at}-${i}`} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 py-3">
                  <span className="flex size-9 items-center justify-center border border-ink font-mono text-[12px]">{r.initials}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] text-ink">{c.channels[r.channel]} · {c.segments[r.segment] ?? "—"}</span>
                    <span className="font-mono text-[11px] text-ink-3">{relative(r.at, c.ago)}</span>
                  </span>
                  <span className="font-mono text-[13px] tabular">{formatLei(r.amountRon)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="leader-title" className="lg:col-span-7">
          <div className="border-t border-ink pt-5">
            <h2 id="leader-title" className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-2">{c.leaderTitle}</h2>
            <p className="mt-1 text-[12px] text-ink-3">{c.leaderNote}</p>
          </div>
          {insights.leaderboard.length === 0 ? (
            <p className="mt-6 text-[13.5px] text-ink-3">{c.leaderEmpty}</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[26rem] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-ink font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
                    <th className="w-10 py-2 font-normal">#</th>
                    <th className="py-2 font-normal">{c.leaderCols.code}</th>
                    <th className="py-2 text-right font-normal">{c.leaderCols.visits}</th>
                    <th className="py-2 text-right font-normal">{c.leaderCols.pledges}</th>
                    <th className="py-2 text-right font-normal">{c.leaderCols.total}</th>
                  </tr>
                </thead>
                <tbody className="font-mono tabular">
                  {insights.leaderboard.map((l, i) => (
                    <tr key={l.code} className="border-b border-line">
                      <td className="py-3 text-ink-3">{String(i + 1).padStart(2, "0")}</td>
                      <td className="py-3 text-ink">{l.code}</td>
                      <td className="py-3 text-right">{formatInt(l.visits)}</td>
                      <td className="py-3 text-right">{formatInt(l.pledges)}</td>
                      <td className="py-3 text-right text-accent">{formatLei(l.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
