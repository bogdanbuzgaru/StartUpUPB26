"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useTester, type TesterKind } from "@/components/providers";
import { CloseIcon, FlaskIcon } from "@/components/ui/icons";

/**
 * Where each tester action lands. Pages with a matching form are filled in place;
 * from any other page the tester navigates to the most relevant form.
 */
const ROUTES: Record<string, Partial<Record<TesterKind, string>>> = {
  "/companii": { corporate: "corporate", invalid: "corporate" },
  "/absolventi": { alumni: "calculator", invalid: "calculator" },
  "/contribuie": { corporate: "corporate", alumni: "sms", invalid: "corporate" },
};
const FALLBACK: Record<TesterKind, string> = {
  corporate: "/companii#corporate",
  alumni: "/absolventi#calculator",
  invalid: "/contribuie#corporate",
};

export function EvaluatorPill() {
  const { t } = useI18n();
  const { fire } = useTester();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const run = (kind: TesterKind) => {
    fire(kind);
    setOpen(false);
    const id = ROUTES[pathname]?.[kind];
    if (id) {
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } else {
      router.push(FALLBACK[kind]);
    }
  };

  return (
    <div ref={panelRef} className="fixed bottom-4 left-4 z-40 sm:bottom-6 sm:left-6">
      {open && (
        <div
          id="tester-panel"
          role="dialog"
          aria-label={t.tester.title}
          className="absolute bottom-full left-0 mb-2 w-[min(20rem,calc(100vw-2rem))] border border-ink bg-card shadow-[4px_4px_0_0_var(--color-ink)] animate-rise"
        >
          <div className="flex items-start justify-between gap-3 border-b border-dashed border-ink px-4 py-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em]">{t.tester.title}</p>
              <p className="mt-1 text-[12px] leading-snug text-ink-3">{t.tester.note}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t.tester.close} className="-mr-1 -mt-1 p-1 text-ink-2 hover:text-ink">
              <CloseIcon className="size-4" />
            </button>
          </div>
          <ul className="divide-y divide-line">
            {(
              [
                ["alumni", t.tester.alumni, "01"],
                ["corporate", t.tester.corporate, "02"],
                ["invalid", t.tester.invalid, "03"],
              ] as const
            ).map(([kind, label, n]) => (
              <li key={kind}>
                <button
                  type="button"
                  onClick={() => run(kind)}
                  className={`flex min-h-12 w-full items-center gap-3 px-4 text-left text-[13.5px] transition-colors hover:bg-paper-2 ${
                    kind === "invalid" ? "text-danger" : "text-ink"
                  }`}
                >
                  <span className="font-mono text-[11px] text-ink-3">{n}</span>
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="tester-panel"
        className="inline-flex min-h-10 items-center gap-2 rounded-full border border-dashed border-ink bg-paper/95 px-3.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink backdrop-blur transition-colors hover:bg-card"
      >
        <FlaskIcon className="size-3.5" />
        <span className="hidden sm:inline">{t.tester.pill}</span>
        <span className="sm:hidden">Tester</span>
      </button>
    </div>
  );
}
