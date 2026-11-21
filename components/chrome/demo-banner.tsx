"use client";

import { OFFICIAL_CAMPAIGN_URL } from "@/lib/facts";
import { useI18n } from "@/lib/i18n";
import { dictionaries } from "@/lib/dictionary";
import { ArrowUpRight } from "@/components/ui/icons";

export function DemoBanner() {
  const { t, lang } = useI18n();
  const required = dictionaries.ro.banner.text;
  return (
    <div role="note" aria-label="Demo" className="bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-10">
        <p className="flex items-start gap-2.5 font-mono text-[11.5px] leading-snug tracking-tight text-paper/90 sm:items-center">
          <span className="mt-[1px] shrink-0 border border-dashed border-paper/70 px-1.5 text-[10px] tracking-[0.14em] sm:mt-0">
            {t.common.demo}
          </span>
          {/* The mandatory Romanian disclaimer is always shown verbatim; EN mode adds a translation. */}
          <span>
            <span lang="ro">{required}</span>
            {lang === "en" && <span className="mt-0.5 block text-paper/65">{t.banner.text}</span>}
          </span>
        </p>
        <a
          href={OFFICIAL_CAMPAIGN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex shrink-0 items-center gap-1.5 self-start border-b border-paper/40 pb-0.5 font-mono text-[11.5px] text-paper transition-colors hover:border-paper sm:self-auto"
        >
          {t.banner.cta}
          <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}
