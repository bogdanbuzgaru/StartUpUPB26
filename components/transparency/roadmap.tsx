"use client";

import { useI18n } from "@/lib/i18n";

/** Three-stage, 6-month implementation timeline (competition assumption). */
export function Roadmap() {
  const { t } = useI18n();
  const r = t.roadmap;
  const total = String(r.stages.length).padStart(2, "0");

  return (
    <section id="roadmap" aria-labelledby="roadmap-title" className="pt-20 lg:pt-28">
      <div className="flex flex-col gap-4 border-t border-ink pt-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="eyebrow">{r.kicker}</p>
          <h2 id="roadmap-title" className="mt-4 font-serif text-[clamp(1.85rem,3.8vw,2.6rem)] leading-[1.02] tracking-[-0.01em] text-balance">
            {r.title}
          </h2>
        </div>
        <span className="demo-stamp self-start md:self-auto">{r.badge}</span>
      </div>

      <ol className="mt-10 grid gap-px border border-ink bg-ink md:grid-cols-3">
        {r.stages.map((st, i) => (
          <li key={st.title} className="flex flex-col gap-4 bg-card p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-accent-ink">{st.when}</span>
              <span className="font-mono text-[12px] text-ink-3">{String(i + 1).padStart(2, "0")} / {total}</span>
            </div>
            <div aria-hidden className="grid grid-cols-6 gap-1">
              {[1, 2, 3, 4, 5, 6].map((m) => (
                <span key={m} className={`h-1.5 ${st.months.includes(m) ? "bg-accent" : "bg-paper-2"}`} />
              ))}
            </div>
            <h3 className="font-serif text-[24px] leading-[1.08] text-ink">{st.title}</h3>
            <p className="text-[14px] leading-relaxed text-ink-2">{st.body}</p>
            <p className="mt-auto border-t border-dashed border-line-strong pt-3 font-mono text-[11.5px] leading-relaxed text-ink-3">{st.kpi}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
