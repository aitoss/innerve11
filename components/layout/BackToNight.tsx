"use client";

import { useEffect, useState } from "react";

export default function BackToNight() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.LENIS) {
      window.LENIS.scrollTo(0, { duration: 1.6 });
    } else {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className={`group fixed bottom-[clamp(18px,3vh,30px)] right-gut z-[55] grid h-11 w-11 place-items-center rounded-full border border-paper/20 bg-ink/90 text-paper shadow-[0_10px_28px_rgba(0,0,0,0.45)] backdrop-blur-md transition-[opacity,transform,background-color,border-color] duration-300 ease-out hover:border-red hover:bg-red ${
        visible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5"
      >
        <path
          d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
