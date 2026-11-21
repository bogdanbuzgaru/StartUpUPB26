import type { Metadata } from "next";
import { ContributeView } from "@/components/contribute/contribute-view";

export const metadata: Metadata = {
  title: "Canale de contribuție (demo) — Prototip SYSUPE013CM",
};

export default function ContribuiePage() {
  return <ContributeView />;
}
