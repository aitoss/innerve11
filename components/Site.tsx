"use client";

import { useEffect } from "react";
import { initDriver } from "@/lib/scroll/driver";
import FloatingControls from "@/components/layout/FloatingControls";
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
        <Tracks />
        <InfinityCastle />
        <Prizes />
        <Testimonials />
        <Sponsors />
        <Faq />
        <Footer />
      </main>

      <ParticleOverlay />
      <FloatingControls />
    </>
  );
}
