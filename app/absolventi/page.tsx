import type { Metadata } from "next";
import { AlumniView } from "@/components/alumni/alumni-view";

export const metadata: Metadata = {
  title: "Absolvenți POLITEHNICA & Donatori Individuali (demo) — Prototip SYSUPE013CM",
};

export default function Page() {
  return <AlumniView />;
}
