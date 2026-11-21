import { Hero } from "@/components/home/hero";
import { SegmentCallout } from "@/components/segment-callout";
import { PersonaSelector } from "@/components/home/persona-selector";
import { FunnelStats } from "@/components/home/funnel-stats";
import { PagePreviews } from "@/components/home/page-previews";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SegmentCallout variant="band" id="segment" />
      <PersonaSelector />
      <FunnelStats />
      <PagePreviews />
    </>
  );
}
