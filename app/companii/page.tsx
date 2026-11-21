import type { Metadata } from "next";
import { CompaniesView } from "@/components/companies/companies-view";

export const metadata: Metadata = {
  title: "Parteneriat Companii & Sponsori Majori (demo) — Prototip SYSUPE013CM",
};

export default function Page() {
  return <CompaniesView />;
}
