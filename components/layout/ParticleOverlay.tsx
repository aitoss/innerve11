"use client";

import { useEffect, useRef } from "react";

export default function ParticleOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const tracks = document.getElementById("tracks");
    if (!canvas || !tracks) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop: (() => void) | undefined;
    let disposed = false;

    const syncMotion = async () => {
      if (reducedMotion.matches) {
        stop?.();
        stop = undefined;
        return;
      }

      const { startParticles } = await import("@/lib/particles");
      if (!disposed && !reducedMotion.matches && !stop) {
        stop = startParticles(canvas, tracks);
      }
    };

    void syncMotion();
    reducedMotion.addEventListener("change", syncMotion);

    return () => {
      disposed = true;
      reducedMotion.removeEventListener("change", syncMotion);
      stop?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="fx"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 h-full w-full motion-reduce:hidden"
    />
  );
}
