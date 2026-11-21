import type { Metadata } from "next";
import { TransparencyView } from "@/components/transparency/transparency-view";

export const metadata: Metadata = {
  title: "Transparență & Date Oficiale — Prototip SYSUPE013CM",
};

export default function Page() {
  return <TransparencyView />;
}
