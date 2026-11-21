"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { formatInt, formatLei } from "@/lib/format";
import { insightsCopy } from "@/lib/dictionary-insights";
import { useI18n } from "@/lib/i18n";
import { fetchAmbassadorStats, type AmbassadorStats } from "@/lib/metrics";
import { buildReferralLink, isValidCode, normalizeCode } from "@/lib/referral";
import { useMetrics } from "@/components/providers";
import { CopyButton } from "@/components/ui/form";
import { AlertIcon, RefreshIcon } from "@/components/ui/icons";

function StatGrid({ stats, loading }: { stats: AmbassadorStats | null; loading: boolean }) {
  const { lang } = useI18n();
  const r = insightsCopy[lang].referral;
  const cells = [
    { k: r.visits, v: stats ? formatInt(stats.visits) : "—" },
    { k: r.pledges, v: stats ? formatInt(stats.pledges) : "—" },
    { k: r.total, v: stats ? formatLei(stats.total) : "—" },
    { k: r.rank, v: stats?.rank ? `#${stats.rank}` : r.noRank },
  ];
  return (
    <dl className="grid grid-cols-2 gap-px border border-ink bg-ink" aria-busy={loading}>
      {cells.map((c) => (
        <div key={c.k} className="bg-card px-4 py-4">
          <dt className="text-[12px] text-ink-3">{c.k}</dt>
          <dd className={`mt-1.5 font-mono text-[22px] leading-none tracking-tight tabular ${loading ? "opacity-50" : ""}`}>{c.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function AmbassadorPanel({
  code,
  onCreate,
  onForget,
}: {
  code: string | null;
  onCreate: () => void;
  onForget: () => void;
}) {
  const { lang } = useI18n();
  const r = insightsCopy[lang].referral;
  const { stats: globalStats } = useMetrics();

  const [mine, setMine] = useState<AmbassadorStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [lookup, setLookup] = useState("");
  const [lookupErr, setLookupErr] = useState<string | null>(null);
  const [lookupRes, setLookupRes] = useState<{ code: string; stats: AmbassadorStats | null } | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);

  const load = useCallback(async () => {
    if (!code) return;
    setLoading(true);
    setError(false);
    try {
      setMine(await fetchAmbassadorStats(code));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [code]);

  // Re-read when the code appears or when global counters move.
  useEffect(() => {
    void load();
  }, [load, globalStats.pledgeCount]);

  const onLookup = async (e: FormEvent) => {
    e.preventDefault();
    const c = normalizeCode(lookup);
    if (!isValidCode(c)) {
      setLookupErr(r.lookupInvalid);
      setLookupRes(null);
      return;
    }
    setLookupErr(null);
    setLookupBusy(true);
    try {
      setLookupRes({ code: c, stats: await fetchAmbassadorStats(c) });
    } catch {
      setLookupErr(r.lookupError);
    } finally {
      setLookupBusy(false);
    }
  };

  const link = code ? buildReferralLink(code) : "";

  return (
    <section id="program-ambasadori" aria-labelledby="amb-title" className="pt-20 lg:pt-28">
      <div className="grid gap-8 border-t border-ink pt-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <p className="eyebrow">{r.kicker}</p>
          <h2 id="amb-title" className="mt-4 font-serif text-[clamp(1.85rem,3.8vw,2.6rem)] leading-[1.02] tracking-[-0.01em]">
            {r.title}
          </h2>
          <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-ink-2">{r.intro}</p>
          <ul className="mt-6 flex flex-col gap-2.5 border-t border-line pt-4">
            {r.rules.map((rule) => (
              <li key={rule} className="flex gap-2.5 text-[13px] leading-snug text-ink-2">
                <span aria-hidden className="mt-1.5 size-1.5 shrink-0 bg-accent" />
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-8 lg:col-span-8">
          {!code ? (
            <div className="flex flex-col items-start gap-4 border border-dashed border-ink bg-card p-6 sm:p-8">
              <p className="font-mono text-[28px] tracking-[0.04em] text-ink-3">AMB-······</p>
              <button
                type="button"
                onClick={onCreate}
                className="group inline-flex min-h-12 items-center justify-between gap-6 bg-ink px-5 text-[15px] font-medium text-paper transition-colors hover:bg-accent"
              >
                {r.generate}
                <span aria-hidden className="font-mono transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-px border border-ink bg-ink md:grid-cols-5">
                <div className="flex flex-col justify-between gap-4 bg-ink p-5 text-paper sm:p-6 md:col-span-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-paper/60">{r.yourCode}</p>
                  <p className="font-mono text-[clamp(1.75rem,4vw,2.25rem)] leading-none tracking-[0.03em]">{code}</p>
                  <CopyButton text={code} label={r.copyCode} className="!border-paper !text-paper hover:!bg-paper hover:!text-ink" />
                </div>
                <div className="flex flex-col justify-between gap-4 bg-card p-5 sm:p-6 md:col-span-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">{r.yourLink}</p>
                  <p className="break-all font-mono text-[13px] leading-relaxed text-ink">{link}</p>
                  <div className="flex flex-col gap-2">
                    <CopyButton text={link} label={r.copyLink} variant="solid" />
                    <p className="text-[12px] text-ink-3">{r.messageHint}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-mono text-[12px] uppercase tracking-[0.12em] text-ink-2">{r.statsTitle}</h3>
                  <button
                    type="button"
                    onClick={() => void load()}
                    className="inline-flex min-h-9 items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-[0.08em] text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
                  >
                    <RefreshIcon className="size-3.5" />
                    {r.refresh}
                  </button>
                </div>
                <StatGrid stats={mine} loading={loading} />
                {error && <p role="alert" className="mt-2 text-[12.5px] text-danger">{r.lookupError}</p>}
                <div className="mt-4">
                  {confirming ? (
                    <div className="flex flex-col gap-2 border-l-2 border-danger pl-3 sm:flex-row sm:items-center sm:gap-4">
                      <p className="text-[12.5px] text-ink-2">{r.forgetConfirm}</p>
                      <div className="flex gap-3 font-mono text-[11.5px] uppercase tracking-[0.08em]">
                        <button type="button" onClick={() => { setConfirming(false); setMine(null); onForget(); }} className="text-danger underline underline-offset-4">OK</button>
                        <button type="button" onClick={() => setConfirming(false)} className="text-ink underline underline-offset-4">✕</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setConfirming(true)} className="text-[12.5px] text-ink-3 underline decoration-line-strong underline-offset-4 hover:text-ink">
                      {r.forget}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Look up any code's impact */}
          <form noValidate onSubmit={onLookup} className="border-t border-line pt-6">
            <label htmlFor="amb-lookup" className="text-[13px] font-medium">{r.lookupTitle}</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="amb-lookup"
                value={lookup}
                onChange={(e) => {
                  setLookup(e.target.value);
                  if (lookupErr) setLookupErr(null);
                }}
                placeholder={r.lookupPlaceholder}
                autoComplete="off"
                maxLength={20}
                aria-invalid={Boolean(lookupErr)}
                aria-describedby={lookupErr ? "amb-lookup-err" : undefined}
                className="field font-mono uppercase sm:max-w-xs"
              />
              <button
                type="submit"
                disabled={lookupBusy}
                className="min-h-12 border border-ink px-5 font-mono text-[12px] uppercase tracking-[0.08em] transition-colors hover:bg-ink hover:text-paper disabled:opacity-60"
              >
                {r.lookup}
              </button>
            </div>
            {lookupErr && (
              <p id="amb-lookup-err" role="alert" className="mt-2 flex items-start gap-1.5 text-[12.5px] text-danger">
                <AlertIcon className="mt-px size-3.5 shrink-0" />
                {lookupErr}
              </p>
            )}
            {lookupRes && (
              <div className="mt-4 animate-rise">
                <p className="mb-2 font-mono text-[12px] text-ink-2">{lookupRes.code}</p>
                <StatGrid stats={lookupRes.stats} loading={lookupBusy} />
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
