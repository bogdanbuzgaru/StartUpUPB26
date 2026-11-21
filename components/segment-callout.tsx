"use client";

import { INDUSTRIES } from "@/lib/facts";
import { useI18n } from "@/lib/i18n";

/**
 * The official primary target segment, rendered verbatim in the active language.
 * `band` is the full-bleed home-page treatment; `panel` sits inside a page grid.
 */
export function SegmentCallout({ variant = "panel", id }: { variant?: "band" | "panel"; id?: string }) {
  const { t } = useI18n();

  const sectors = (
    <ul aria-label={t.segment.sectorsLabel} className="flex flex-wrap gap-2">
      {INDUSTRIES.map((k, i) => (
        <li
          key={k}
          className="inline-flex items-center gap-2 border border-ink/80 bg-card px-2.5 py-1 text-[12.5px] text-ink"
        >
          <span className="font-mono text-[10.5px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
          {t.industries[k]}
        </li>
      ))}
    </ul>
  );

  if (variant === "band") {
    return (
      <section id={id} aria-labelledby="segment-title" className="border-b border-ink bg-accent-wash/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:py-16">
          <div className="lg:col-span-3">
            <p id="segment-title" className="eyebrow !text-accent-ink">
              {t.segment.label}
            </p>
            <span aria-hidden className="mt-4 block h-px w-16 bg-accent" />
          </div>
          <div className="lg:col-span-9">
            <blockquote className="font-serif text-[clamp(1.55rem,3.3vw,2.4rem)] leading-[1.12] tracking-[-0.01em] text-ink text-pretty">
              „{t.segment.text}”
            </blockquote>
            <div className="mt-7">{sectors}</div>
            <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-ink-2">{t.segment.note}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={id} aria-labelledby={`${id ?? "segment"}-panel-title`} className="border border-ink bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-dashed border-ink px-5 py-3 sm:px-6">
        <p id={`${id ?? "segment"}-panel-title`} className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-accent-ink">
          {t.segment.label}
        </p>
        <span aria-hidden className="size-2 bg-accent" />
      </div>
      <div className="flex flex-col gap-5 px-5 py-6 sm:px-6">
        <blockquote className="font-serif text-[clamp(1.3rem,2.4vw,1.75rem)] leading-[1.18] text-ink text-pretty">
          „{t.segment.text}”
        </blockquote>
        {sectors}
        <p className="text-[12.5px] leading-relaxed text-ink-3">{t.segment.note}</p>
      </div>
    </section>
  );
}
