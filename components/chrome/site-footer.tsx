"use client";

import { FOOTER_REQUIRED_TEXT } from "@/lib/dictionary";
import { OFFICIAL_CAMPAIGN_URL, OFFICIAL_SITE_URL } from "@/lib/facts";
import { useI18n } from "@/lib/i18n";
import { ArrowUpRight } from "@/components/ui/icons";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-ink bg-paper-2/60 pb-28 sm:pb-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-7">
          {/* Mandatory competition footer text – rendered verbatim. */}
          <p className="font-mono text-[12.5px] leading-relaxed tracking-tight text-ink" data-testid="required-footer">
            {FOOTER_REQUIRED_TEXT}
          </p>
          <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-ink-2">{t.footer.disclaimer}</p>
        </div>
        <div className="flex flex-col gap-3 lg:col-span-5 lg:items-end lg:text-right">
          <p className="text-[13.5px] text-ink-2">
            {t.footer.source}{" "}
            <a
              href={OFFICIAL_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
            >
              fundatia.upb.ro
            </a>
          </p>
          <a
            href={OFFICIAL_CAMPAIGN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-[13.5px] font-medium text-accent hover:text-accent-ink"
          >
            {t.footer.official}
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
