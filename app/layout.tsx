import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { DemoBanner } from "@/components/chrome/demo-banner";
import { SiteHeader } from "@/components/chrome/site-header";
import { SiteFooter } from "@/components/chrome/site-footer";
import { EvaluatorPill } from "@/components/evaluator-pill";
import { ChatDrawer } from "@/components/chat-drawer";

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-instrument-serif",
  display: "swap",
});
const sans = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-geist", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Un loc în cămin poate schimba un destin! — Prototip SYSUPE013CM",
  description:
    "Prototip demonstrativ (Cod Echipă: SYSUPE013CM) pentru campania Fundației HIPOLITECH. Toate sumele, conturile și angajamentele sunt simulate; nu se procesează plăți reale.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f1ea",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <Providers>
          <DemoBanner />
          <SiteHeader />
          <main id="continut" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <EvaluatorPill />
          <ChatDrawer />
        </Providers>
      </body>
    </html>
  );
}
