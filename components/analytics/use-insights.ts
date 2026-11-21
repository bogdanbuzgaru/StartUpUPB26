"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { emptyInsights, fetchInsights, type FunnelInsights } from "@/lib/metrics";
import { useMetrics } from "@/components/providers";

/**
 * Loads detailed analytics, re-reads them whenever the headline counters change (e.g. after a
 * form submission) and polls every 30 s while the tab is visible.
 */
export function useInsights() {
  const { stats } = useMetrics();
  const [insights, setInsights] = useState<FunnelInsights>(emptyInsights);
  const [state, setState] = useState<{ status: "loading" | "ready" | "error"; mode?: "remote" | "local"; schemaOutdated?: boolean; at?: Date }>({
    status: "loading",
  });
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await fetchInsights();
      setInsights(res.insights);
      setState({ status: "ready", mode: res.mode, schemaOutdated: res.schemaOutdated, at: new Date() });
    } catch {
      setState((s) => ({ ...s, status: "error" }));
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, stats.pledgeCount, stats.corporateCount]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 30_000);
    return () => window.clearInterval(id);
  }, [load]);

  return { insights, ...state, reload: load };
}
