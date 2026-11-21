import type { Metadata } from "next";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export const metadata: Metadata = {
  title: "Analiză detaliată (date simulate) — Prototip SYSUPE013CM",
};

export default function AnalizaPage() {
  return <AnalyticsView />;
}
