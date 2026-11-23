"use client";

import { useEffect } from "react";
import { initDriver } from "@/lib/scroll/driver";
import FloatingControls from "@/components/layout/FloatingControls";
import Marquee from "@/components/layout/Marquee";
import CrowFlyby from "@/components/layout/CrowFlyby";
import Footer from "@/components/layout/Footer";
import ParticleOverlay from "@/components/layout/ParticleOverlay";
import InfinityCastle from "@/components/sections/castle/InfinityCastle";
import Faq from "@/components/sections/faq/Faq";
import RengokuHero from "@/components/sections/hero/RengokuHero";
import Prizes from "@/components/sections/prizes/Prizes";
import Sponsors from "@/components/sections/sponsors/Sponsors";
import Testimonials from "@/components/sections/testimonials/Testimonials";
import Tracks from "@/components/sections/tracks/Tracks";

export default function Site() {
  useEffect(() => {
    return initDriver();
  }, []);

  return (
    <>
      <main id="smooth">
        <RengokuHero />
        <CrowFlyby text="CAW! Nine tracks. Find your breathing style!" dir="rtl" band={0.15} />
        <Tracks />
        <InfinityCastle />
        <CrowFlyby text="CAW! ₹12 Lacs+ in bounties!" dir="ltr" band={0.38} />
        <Prizes />
        <Testimonials />
        <Marquee
          items={[
            "INNERVE 11",
            "29–30 JAN 2027",
            "AIT PUNE",
            "OSS CLUB",
            "24 HOURS",
            "₹12 LACS+",
          ]}
        />
        <Sponsors />
        <CrowFlyby text="CAW! No registration fee. Teams of 2 to 4!" dir="rtl" band={0.15} />
        <Faq />
        <Footer />
      </main>

      <ParticleOverlay />
      <FloatingControls />
    </>
  );
}
