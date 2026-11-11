"use client";

import { useEffect } from "react";
import { initDriver } from "@/lib/scroll/driver";
import BackToNight from "@/components/layout/BackToNight";
import Footer from "@/components/layout/Footer";
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
      <div
        id="flash"
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[58] bg-white opacity-0"
      />

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

      <BackToNight />
    </>
  );
}
