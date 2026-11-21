"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n";
import { EMPTY_STATS, fetchStats, registerVisitOnce, type FunnelStats } from "@/lib/metrics";

/* ---------------------------- Metrics ---------------------------- */

type MetricsValue = {
  stats: FunnelStats;
  mode: "remote" | "local" | "unknown";
  status: "loading" | "ready" | "error";
  refresh: () => Promise<void>;
};

const MetricsContext = createContext<MetricsValue | null>(null);

function MetricsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<FunnelStats>(EMPTY_STATS);
  const [mode, setMode] = useState<MetricsValue["mode"]>("unknown");
  const [status, setStatus] = useState<MetricsValue["status"]>("loading");

  const refresh = useCallback(async () => {
    try {
      const res = await fetchStats();
      setStats(res.stats);
      setMode(res.mode);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await registerVisitOnce().catch(() => undefined);
      if (!cancelled) await refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const value = useMemo(() => ({ stats, mode, status, refresh }), [stats, mode, status, refresh]);
  return <MetricsContext.Provider value={value}>{children}</MetricsContext.Provider>;
}

export function useMetrics(): MetricsValue {
  const ctx = useContext(MetricsContext);
  if (!ctx) throw new Error("useMetrics must be used inside <Providers>");
  return ctx;
}

/* ------------------------ Evaluator tester ------------------------ */

export type TesterKind = "alumni" | "corporate" | "invalid";
export type TesterSignal = { kind: TesterKind; nonce: number; at: number };

const TesterContext = createContext<{ signal: TesterSignal | null; fire: (k: TesterKind) => void } | null>(null);

function TesterProvider({ children }: { children: ReactNode }) {
  const [signal, setSignal] = useState<TesterSignal | null>(null);
  const counter = useRef(0);
  const fire = useCallback((kind: TesterKind) => {
    counter.current += 1;
    setSignal({ kind, nonce: counter.current, at: Date.now() });
  }, []);
  const value = useMemo(() => ({ signal, fire }), [signal, fire]);
  return <TesterContext.Provider value={value}>{children}</TesterContext.Provider>;
}

export function useTester() {
  const ctx = useContext(TesterContext);
  if (!ctx) throw new Error("useTester must be used inside <Providers>");
  return ctx;
}

/**
 * Subscribes a form to evaluator-tester signals. Each signal is applied at most once per
 * mounted form, and only if it is recent (so it survives a client-side navigation to another page
 * but is not replayed on later visits).
 */
export function useTesterSignal(handler: (kind: TesterKind, nonce: number) => void) {
  const { signal } = useTester();
  const handled = useRef(0);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    if (!signal || signal.nonce === handled.current) return;
    if (Date.now() - signal.at > 5000) return;
    handled.current = signal.nonce;
    handlerRef.current(signal.kind, signal.nonce);
  }, [signal]);
}

/* ------------------------------------------------------------------ */

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <MetricsProvider>
        <TesterProvider>{children}</TesterProvider>
      </MetricsProvider>
    </I18nProvider>
  );
}
