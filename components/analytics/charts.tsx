"use client";

import { useState } from "react";
import { formatInt, formatLei } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Shared tooltip: ink-on-card, never the series colour for text.       */
/* ------------------------------------------------------------------ */
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap border border-ink bg-card px-2.5 py-1.5 font-mono text-[11.5px] leading-snug text-ink shadow-[2px_2px_0_0_var(--color-ink)]"
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Daily columns: one series, single hue, baseline-anchored marks.      */
/* ------------------------------------------------------------------ */
export function DailyColumns({
  data,
  locale,
  tooltip,
  emptyLabel,
  tableToggle,
  cols,
}: {
  data: { day: string; count: number; total: number }[];
  locale: string;
  tooltip: (count: string, total: string) => string;
  emptyLabel: string;
  tableToggle: string;
  cols: { day: string; count: string; total: string };
}) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.total), 0);
  const nice = niceCeil(max);
  const empty = max === 0;
  const fmtDay = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString(locale, opts);

  return (
    <div>
      <div className="relative">
        {/* Recessive grid: three reference lines with labels on the left */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48" aria-hidden>
          {[1, 0.5, 0].map((f) => (
            <div key={f} className="absolute inset-x-0 flex items-center gap-2" style={{ top: `${(1 - f) * 100}%` }}>
              <span className="w-14 shrink-0 -translate-y-1/2 text-right font-mono text-[10.5px] text-ink-3 tabular">
                {empty ? "" : formatLei(nice * f, 0).replace(" lei", "")}
              </span>
              <span className={`h-px flex-1 -translate-y-1/2 ${f === 0 ? "bg-ink" : "bg-line"}`} />
            </div>
          ))}
        </div>

        <div className="ml-16 flex h-48 items-end gap-[2px]" onMouseLeave={() => setActive(null)}>
          {data.map((d, i) => {
            const h = nice > 0 ? (d.total / nice) * 100 : 0;
            const label = `${fmtDay(d.day, { day: "numeric", month: "short" })}: ${tooltip(formatInt(d.count), formatLei(d.total))}`;
            return (
              <button
                key={d.day}
                type="button"
                aria-label={label}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="group relative flex h-full flex-1 items-end focus-visible:outline-offset-0"
              >
                {active === i && (
                  <Tip>
                    <span className="block text-ink-3">{fmtDay(d.day, { weekday: "short", day: "numeric", month: "short" })}</span>
                    {tooltip(formatInt(d.count), formatLei(d.total))}
                  </Tip>
                )}
                <span
                  className={`block w-full rounded-t-[4px] transition-[height,background-color] duration-500 ease-out ${
                    active === i ? "bg-accent-ink" : "bg-accent"
                  }`}
                  style={{ height: d.total > 0 ? `max(${h}%, 3px)` : "0px" }}
                />
              </button>
            );
          })}
        </div>
        {empty && (
          <p className="absolute inset-x-0 top-16 ml-16 text-center text-[13px] text-ink-3">{emptyLabel}</p>
        )}
      </div>

      {/* Sparse x-axis labels: first, middle, last */}
      <div className="ml-16 mt-2 flex justify-between font-mono text-[10.5px] text-ink-3">
        {[0, Math.floor(data.length / 2), data.length - 1].map((i) =>
          data[i] ? <span key={i}>{fmtDay(data[i].day, { day: "numeric", month: "short" })}</span> : null,
        )}
      </div>

      <details className="mt-5 border-t border-line pt-3">
        <summary className="cursor-pointer font-mono text-[11.5px] uppercase tracking-[0.08em] text-ink-2 hover:text-ink">
          {tableToggle}
        </summary>
        <div className="mt-3 max-h-64 overflow-auto">
          <table className="w-full text-left font-mono text-[12px] tabular">
            <thead className="text-ink-3">
              <tr className="border-b border-line">
                <th className="py-1.5 font-normal">{cols.day}</th>
                <th className="py-1.5 text-right font-normal">{cols.count}</th>
                <th className="py-1.5 text-right font-normal">{cols.total}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.day} className="border-b border-line/60">
                  <td className="py-1.5">{fmtDay(d.day, { weekday: "short", day: "numeric", month: "short" })}</td>
                  <td className="py-1.5 text-right">{formatInt(d.count)}</td>
                  <td className="py-1.5 text-right">{formatLei(d.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Horizontal bars: magnitude across a handful of categories.           */
/* ------------------------------------------------------------------ */
export function BarList({
  rows,
  metric,
  emptyLabel,
}: {
  rows: { key: string; label: string; count: number; total: number }[];
  metric: "total" | "count";
  emptyLabel: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const value = (r: { count: number; total: number }) => (metric === "total" ? r.total : r.count);
  const sum = rows.reduce((s, r) => s + value(r), 0);
  const max = Math.max(...rows.map(value), 0);
  const sorted = [...rows].sort((a, b) => value(b) - value(a));

  if (sum === 0) return <p className="py-6 text-[13px] text-ink-3">{emptyLabel}</p>;

  return (
    <ul className="flex flex-col gap-3.5">
      {sorted.map((r) => {
        const v = value(r);
        const share = sum > 0 ? Math.round((v / sum) * 100) : 0;
        return (
          <li
            key={r.key}
            className="relative"
            onMouseEnter={() => setActive(r.key)}
            onMouseLeave={() => setActive(null)}
          >
            <div className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="text-ink">{r.label}</span>
              <span className="font-mono text-[12px] text-ink-2 tabular">
                {metric === "total" ? formatLei(v, 0) : formatInt(v)} <span className="text-ink-3">· {share}%</span>
              </span>
            </div>
            <div
              tabIndex={0}
              onFocus={() => setActive(r.key)}
              onBlur={() => setActive(null)}
              aria-label={`${r.label}: ${formatInt(r.count)} · ${formatLei(r.total)} · ${share}%`}
              className="relative mt-1.5 h-2.5 w-full bg-paper-2 focus-visible:outline-offset-1"
            >
              <div
                className={`h-full rounded-r-[4px] transition-[width,background-color] duration-500 ease-out ${active === r.key ? "bg-accent-ink" : "bg-accent"}`}
                style={{ width: max > 0 ? `${v > 0 ? Math.max((v / max) * 100, 1.5) : 0}%` : "0%" }}
              />
              {active === r.key && (
                <Tip>
                  {formatInt(r.count)} · {formatLei(r.total)}
                </Tip>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Rounds a maximum up to a readable axis value (1, 2, 2.5, 5 × 10^n). */
function niceCeil(v: number): number {
  if (v <= 0) return 0;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (v <= m * p) return m * p;
  return 10 * p;
}
