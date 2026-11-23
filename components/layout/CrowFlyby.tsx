"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue } from "framer-motion";


const DURATION = 7;
const MAX_SCROLL_SPEED = 1200;

export default function CrowFlyby({
  text,
  dir = "ltr",
  band = 0.2,
}: {
  text: string;
  dir?: "ltr" | "rtl";
  band?: number;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sentinelRef, { margin: "0px 0px -35% 0px" });

  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const inViewRef = useRef(false);
  const speedRef = useRef(0);
  const lastScrollRef = useRef({ y: 0, t: 0 });
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);

  const t = useMotionValue(0);
  const x = useMotionValue(-400);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);
  const bubbleOpacity = useMotionValue(0);

  const startFlight = useCallback(() => {
    if (playingRef.current) return;
    playingRef.current = true;
    setPlaying(true);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const amp = 40 + Math.random() * 40;
    const y0 = band * H + Math.random() * 0.04 * H;
    const d = dir === "rtl" ? -1 : 1;

    t.set(0);
    const controls = animate(t, 1, {
      duration: DURATION,
      ease: "linear",
      onUpdate: (u) => {
        const travel = W + 480;
        x.set(d === 1 ? -320 + u * travel : W + 160 - u * travel);
        y.set(y0 + Math.sin(u * Math.PI * 3) * amp);
        const slope = (Math.cos(u * Math.PI * 3) * amp * Math.PI * 3) / travel;
        rotate.set(d * Math.atan(slope) * 57);
        const bo = u < 0.06 ? 0 : u < 0.16 ? (u - 0.06) / 0.1 : u < 0.82 ? 1 : u < 0.92 ? 1 - (u - 0.82) / 0.1 : 0;
        bubbleOpacity.set(bo);
      },
      onComplete: () => {
        playingRef.current = false;
        setPlaying(false);
      },
    });
    controlsRef.current = controls;
  }, [t, x, y, rotate, bubbleOpacity, dir, band]);

  const measuredRef = useRef(false);


  const maybeTrigger = useCallback(() => {
    if (!inViewRef.current) return;
    const lt = lastScrollRef.current.t;
    const idle = lt === 0 || performance.now() - lt > 500;
    const speed = idle ? 0 : measuredRef.current ? speedRef.current : Infinity;
    if (speed <= MAX_SCROLL_SPEED) startFlight();
  }, [startFlight]);

  useEffect(() => {
    inViewRef.current = inView;
    if (inView) maybeTrigger();
  }, [inView, maybeTrigger]);


  useEffect(() => {
    let decay: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      const now = performance.now();
      const sy = window.scrollY;
      const last = lastScrollRef.current;
      if (last.t) {
        const dt = now - last.t;
        if (dt > 0) {
          const v = (Math.abs(sy - last.y) / dt) * 1000;
          speedRef.current = speedRef.current * 0.6 + v * 0.4;
          measuredRef.current = true;
        }

        maybeTrigger();
      }
      lastScrollRef.current = { y: sy, t: now };
      clearTimeout(decay);
      decay = setTimeout(() => {
        speedRef.current = 0;
        measuredRef.current = false;
        lastScrollRef.current = { y: window.scrollY, t: 0 };
        maybeTrigger();
      }, 180);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(decay);
    };
  }, [maybeTrigger]);


  useEffect(() => () => controlsRef.current?.stop(), []);

  return (
    <div ref={sentinelRef} className="h-px" aria-hidden>
      {playing && (
        <motion.div style={{ x, y }} className="pointer-events-none fixed left-0 top-0 z-[60]">
          <motion.div
            style={{ opacity: bubbleOpacity, x: "-50%" }}
            className="absolute bottom-full left-1/2 mb-2 w-56 whitespace-normal rounded-2xl border-2 border-black bg-white px-3.5 py-2.5 text-center text-[13px] font-bold tracking-wide text-black md:w-auto md:whitespace-nowrap"
          >
            {text}
          </motion.div>
          <motion.img
            src="/assets/img/crow-fly.webp"
            alt=""
            draggable={false}
            style={{ rotate, scaleX: dir === "rtl" ? -1 : 1 }}
            className="w-28 [filter:drop-shadow(0_0_1.5px_rgba(239,232,220,.7))_drop-shadow(0_10px_16px_rgba(0,0,0,.35))] md:w-44"
          />
        </motion.div>
      )}
    </div>
  );
}
