"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { ArrowRight } from "@/components/ui/icons";

export function PagePreviews() {
  const { t } = useI18n();
  const items = [
    { href: "/companii", n: "01", ...t.previews.companies, featured: true },
    { href: "/absolventi", n: "02", ...t.previews.alumni, featured: false },
    { href: "/contribuie", n: "03", ...t.previews.contribute, featured: false },
    { href: "/transparenta", n: "04", ...t.previews.transparency, featured: false },
  ];

  return (
    <section aria-labelledby="previews-title" className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-10 lg:pt-32">
      <div className="flex flex-col gap-3 border-t border-ink pt-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{t.previews.kicker}</p>
          <h2 id="previews-title" className="mt-4 font-serif text-[clamp(2rem,4.6vw,3.25rem)] leading-[1] tracking-[-0.015em]">
            {t.previews.title}
          </h2>
        </div>
      </div>

      {/* Editorial index: the corporate hub leads with a wider row. */}
      <ol className="mt-10 grid gap-px border border-ink bg-ink md:grid-cols-6">
        {items.map((it) => (
          <li key={it.href} className={it.featured ? "md:col-span-6" : "md:col-span-2"}>
            <Link
              href={it.href}
              className={`group flex h-full flex-col justify-between gap-10 p-5 transition-colors duration-200 sm:p-6 ${
                it.featured ? "bg-ink text-paper hover:bg-ink-2 md:flex-row md:items-end md:gap-16" : "bg-card text-ink hover:bg-paper-2"
              }`}
            >
              <div className="flex items-start justify-between gap-4 md:flex-1">
                <span className={`font-mono text-[12px] tracking-[0.12em] ${it.featured ? "text-paper/60" : "text-ink-3"}`}>{it.n}</span>
                <span className="text-right font-mono text-[11px] uppercase tracking-[0.12em] opacity-70">{it.href}</span>
              </div>
              <div className={it.featured ? "md:max-w-xl" : ""}>
                <h3 className={`font-serif leading-[1.04] tracking-[-0.01em] ${it.featured ? "text-[clamp(1.9rem,3.6vw,2.75rem)]" : "text-[26px]"}`}>
                  {it.title}
                </h3>
                <p className={`mt-3 text-[14px] leading-relaxed ${it.featured ? "text-paper/75" : "text-ink-2"}`}>{it.desc}</p>
                <span
                  className={`mt-5 inline-flex items-center gap-2 text-[13.5px] font-medium ${it.featured ? "text-paper" : "text-accent"}`}
                >
                  {t.previews.open}
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
