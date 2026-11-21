"use client";

import { createPortal } from "react-dom";
import { FOOTER_REQUIRED_TEXT, dictionaries } from "@/lib/dictionary";
import { OFFICIAL, OFFICIAL_CAMPAIGN_URL } from "@/lib/facts";
import { formatLei } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

/**
 * Print-only executive sheet for the sponsorship brief. Rendered as a direct child of <body>
 * so the @media print rules in globals.css can hide everything else and print one clean A4 page.
 * Invisible on screen.
 */
export function PrintableBrief({ brief, industry, date }: { brief: string; industry: string; date: string }) {
  const { t } = useI18n();
  const p = t.printBrief;
  if (typeof document === "undefined") return null;

  return createPortal(
    <article className="print-sheet" aria-hidden>
      <header className="print-sheet__head">
        <p className="print-sheet__banner">{dictionaries.ro.banner.text}</p>
        <h1 className="print-sheet__title">{p.header}</h1>
        <p className="print-sheet__meta">
          {t.corporate.briefTitle} · {p.sector}: <strong>{industry}</strong> · {date}
        </p>
      </header>

      <section className="print-sheet__milestones">
        <p className="print-sheet__label">{p.milestones}</p>
        <dl>
          <div>
            <dt>{p.phase1}</dt>
            <dd>{formatLei(OFFICIAL.phase1Ron)}</dd>
          </div>
          <div>
            <dt>{p.total}</dt>
            <dd>{formatLei(OFFICIAL.totalInvestmentRon)}</dd>
          </div>
        </dl>
      </section>

      <pre className="print-sheet__brief">{brief}</pre>

      <footer className="print-sheet__foot">
        <p>{p.ethics}</p>
        <p>{OFFICIAL_CAMPAIGN_URL}</p>
        <p className="print-sheet__required">{FOOTER_REQUIRED_TEXT}</p>
      </footer>
    </article>,
    document.body,
  );
}
