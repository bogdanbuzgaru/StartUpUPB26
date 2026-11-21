"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { OFFICIAL_CAMPAIGN_URL } from "@/lib/facts";
import { useI18n } from "@/lib/i18n";
import { ArrowUpRight, CloseIcon } from "@/components/ui/icons";

type NavLink = { href: string; label: string; priority?: boolean };

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function LangToggle() {
  const { t, lang, setLang } = useI18n();
  return (
    <div role="group" aria-label={t.nav.langLabel} className="flex items-center border border-ink font-mono text-[12px] leading-none">
      {(["ro", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`min-h-9 min-w-10 px-2.5 uppercase tracking-[0.08em] transition-colors ${
            lang === l ? "bg-ink text-paper" : "text-ink hover:bg-paper-2"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links: NavLink[] = [
    { href: "/", label: t.nav.home },
    { href: "/companii", label: t.nav.companies, priority: true },
    { href: "/absolventi", label: t.nav.alumni },
    { href: "/contribuie", label: t.nav.contribute },
    { href: "/transparenta", label: t.nav.transparency },
  ];

  // Drawer: Escape closes it, and the page behind does not scroll while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md supports-[backdrop-filter]:bg-paper/75">
      <a
        href="#continut"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:bg-ink focus:px-3 focus:py-2 focus:text-paper"
      >
        {t.nav.skip}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" onClick={() => setOpen(false)} className="flex min-w-0 shrink-0 items-baseline gap-3">
          <span className="font-serif text-[22px] leading-none tracking-tight">
            Un loc <em className="text-accent">în cămin</em>
          </span>
          <span className="hidden truncate font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-3 2xl:inline">
            {t.nav.brandSub}
          </span>
        </Link>

        <nav aria-label={t.nav.primary} className="hidden lg:block">
          <ul className="flex items-center gap-5 xl:gap-7">
            {links.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative inline-flex items-center gap-1.5 whitespace-nowrap py-1 text-[13.5px] transition-colors hover:text-ink ${
                      active
                        ? "text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-ink"
                        : "text-ink-2"
                    } ${l.priority ? "font-medium" : ""}`}
                  >
                    {l.priority && <span aria-hidden className="size-1.5 bg-accent" />}
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={OFFICIAL_CAMPAIGN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group hidden items-center gap-1 font-mono text-[11.5px] text-ink-2 transition-colors hover:text-accent xl:inline-flex"
          >
            {t.nav.officialLink}
            <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <LangToggle />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.nav.closeMenu : t.nav.menu}
            className="inline-flex min-h-9 items-center gap-2 border border-ink px-3 font-mono text-[11.5px] uppercase tracking-[0.1em] text-ink transition-colors hover:bg-paper-2 lg:hidden"
          >
            {open ? (
              <CloseIcon className="size-3.5" />
            ) : (
              <span aria-hidden className="flex w-3.5 flex-col gap-[3px]">
                <span className="h-px w-full bg-ink" />
                <span className="h-px w-full bg-ink" />
                <span className="h-px w-2/3 bg-ink" />
              </span>
            )}
            <span aria-hidden>{t.nav.menu}</span>
          </button>
        </div>
      </div>

      {/* Mobile / tablet drawer */}
      {open && (
        <div
          id="mobile-nav"
          className="absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto border-t border-ink bg-paper animate-rise lg:hidden"
        >
          <nav aria-label={t.nav.primary} className="mx-auto max-w-7xl px-4 pt-4 pb-10 sm:px-6">
            <ol className="border-t border-line">
              {links.map((l, i) => {
                const active = isActive(pathname, l.href);
                return (
                  <li key={l.href} className="border-b border-line">
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className="flex min-h-16 items-center gap-4 py-3"
                    >
                      <span className="w-6 font-mono text-[12px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                      <span className={`flex-1 font-serif text-[clamp(1.5rem,6vw,1.85rem)] leading-none tracking-[-0.01em] ${active ? "text-accent" : "text-ink"}`}>
                        {l.label}
                      </span>
                      {l.priority && <span className="demo-stamp !border-solid !border-accent text-accent">{t.nav.priority}</span>}
                    </Link>
                  </li>
                );
              })}
            </ol>
            <a
              href={OFFICIAL_CAMPAIGN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-12 w-full items-center justify-between gap-4 bg-accent px-5 text-[15px] font-medium text-paper"
            >
              {t.banner.cta}
              <ArrowUpRight className="size-4" />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
