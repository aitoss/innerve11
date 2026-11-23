"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";

/**
 * Marquee divider strip. Straight, full-width, paper-toned so it sits
 * quietly between sections; ink text with red diamond separators.
 * Infinite loop whose playback speed rises with scroll velocity (up to
 * 5x) and settles back to normal when scrolling stops.
 * Place <Marquee items={[...]} /> between two sections as a divider.
 *   variant  "paper" (default), "dark" or "red"
 *
 * Seamless at any width: the item set repeats until one half of the
 * row covers the viewport, so the 0% -> -50% loop never shows a gap.
 */
const LOOP_SECONDS = 22;

const VARIANTS = {
  paper: "border-y border-ink/15 bg-paper text-ink",
  dark: "border-y border-paper/10 bg-ink text-paper",
  red: "bg-red text-paper",
} as const;

export default function Marquee({
  items,
  variant = "paper",
}: {
  items: string[];
  variant?: keyof typeof VARIANTS;
}) {
  const x = useMotionValue("0%");
  const boxRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLSpanElement>(null);
  const [repeat, setRepeat] = useState(1);

  // repeat the item set enough times that one half of the row is at
  // least as wide as the strip itself
  useLayoutEffect(() => {
    const measure = () => {
      const set = setRef.current;
      const box = boxRef.current;
      if (!set || !box) return;
      const w = set.offsetWidth;
      if (w > 0) {
        const need = Math.max(1, Math.ceil(box.clientWidth / w));
        setRepeat((r) => (r === need ? r : need));
      }
    };
    measure();
    // fonts swapping in can change item widths - measure again then
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items]);

  useEffect(() => {
    const controls = animate(x, ["0%", "-50%"], {
      duration: LOOP_SECONDS,
      ease: "linear",
      repeat: Infinity,
    });

    // scroll-velocity speed-up: one ticker, no per-scroll-event work
    let vel = 0;
    let speed = 1;
    let raf = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    const onScroll = () => {
      const now = performance.now();
      const sy = window.scrollY;
      const dt = now - lastT;
      if (dt > 0) vel = ((sy - lastY) / dt) * 1000;
      lastY = sy;
      lastT = now;
    };
    const tick = () => {
      vel *= 0.9;
      const target = 1 + Math.min(4, Math.abs(vel) / 500);
      speed += (target - speed) * 0.08;
      controls.speed = speed;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      controls.stop();
    };
  }, [x]);

  return (
    <div ref={boxRef} aria-hidden className={`overflow-hidden py-2.5 ${VARIANTS[variant]}`}>
      <motion.div
        style={{ x }}
        className="flex w-max whitespace-nowrap font-display text-[clamp(16px,2vw,26px)] uppercase leading-none tracking-wide"
      >
        {[0, 1].map((half) => (
          <span key={half} className="flex items-center">
            {Array.from({ length: repeat }, (_, r) => (
              <span key={r} ref={half === 0 && r === 0 ? setRef : undefined} className="flex items-center">
                {items.map((it, i) => (
                  <span key={i} className="flex items-center">
                    <span className="px-[0.6em]">{it}</span>
                    <span className="text-[0.7em] text-red">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
