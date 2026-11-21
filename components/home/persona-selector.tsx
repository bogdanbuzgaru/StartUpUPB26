"use client";

import Link from "next/link";
import { CONTEST, OFFICIAL } from "@/lib/facts";
import { formatLei, formatPercent } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { ArrowRight } from "@/components/ui/icons";

/** Two donor tracks. Corporate partners lead (featured, left/top); alumni follow. */
export function PersonaSelector() {
  const { t } = useI18n();
  const corpShare = (CONTEST.corporateGrossRon / CONTEST.targetGrossRon) * 100;

  return (
    <section id="parcurs" aria-labelledby="persona-title" className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-10 lg:pt-28">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow">{t.persona.kicker}</p>
          <h2 id="persona-title" className="mt-4 font-serif text-[clamp(2rem,4.6vw,3.25rem)] leading-[1] tracking-[-0.015em]">
            {t.persona.title}
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-2">{t.persona.intro}</p>
        </div>

        <div className="grid gap-px border border-ink bg-ink lg:col-span-8 lg:grid-cols-12">
          {/* Track 01 – featured */}
          <Link
            href="/companii"
            className="group relative flex min-h-[22rem] flex-col justify-between gap-10 bg-ink p-6 text-paper transition-colors duration-200 hover:bg-[#22201a] sm:p-8 lg:col-span-7"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-paper/70">{t.persona.aTag}</span>
              <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
            <div>
              <h3 className="font-serif text-[clamp(2rem,3.6vw,2.75rem)] leading-[1] tracking-[-0.01em]">{t.persona.aTitle}</h3>
              <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-paper/75">{t.persona.aDesc}</p>
              <ul className="mt-6 grid gap-2 border-t border-paper/20 pt-5 text-[13.5px] text-paper/85">
                {t.persona.aPoints.map((p) => (
                  <li key={p} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-[7px] size-1.5 shrink-0 bg-paper" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
                <span className="inline-flex min-h-11 items-center bg-paper px-4 text-[14px] font-medium text-ink">{t.persona.aCta}</span>
                <span className="font-mono text-[12px] tabular text-paper/60">
                  {formatLei(CONTEST.corporateGrossRon)} · {formatPercent(corpShare)} / {formatLei(CONTEST.targetGrossRon)}
                </span>
              </div>
            </div>
          </Link>

          {/* Track 02 */}
          <Link
            href="/absolventi"
            className="group flex flex-col justify-between gap-10 bg-card p-6 text-ink transition-colors duration-200 hover:bg-paper-2 sm:p-8 lg:col-span-5"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-ink-3">{t.persona.bTag}</span>
              <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
            <div>
              <h3 className="font-serif text-[clamp(1.6rem,2.6vw,2rem)] leading-[1.04] tracking-[-0.01em]">{t.persona.bTitle}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{t.persona.bDesc}</p>
              <p className="mt-5 font-mono text-[12px] text-ink-3 tabular">{t.alumniPage.resultLabel}: 100 lei = {formatPercent((100 / OFFICIAL.phase1Ron) * 100)}</p>
              <span className="mt-5 inline-block text-[13.5px] font-medium text-accent underline decoration-1 underline-offset-4">
                {t.persona.bCta}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
