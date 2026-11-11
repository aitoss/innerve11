"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { UPPER_MOONS } from "@/data/castle";
import type { CastleGate } from "@/types/content";

export default function InfinityCastle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const nightRef = useRef<HTMLDivElement>(null);
  const [moon, setMoon] = useState(-1);
  const [night, setNight] = useState<CastleGate | null>(null);
  const [gates, setGates] = useState<CastleGate[]>([]);
  const gatesRef = useRef<CastleGate[]>([]);

  /* Castle HUD listeners — registered before the castle module starts so the
     start-time `castle-gates` event is not missed. */
  useEffect(() => {
    const onMoon = (e: Event) => setMoon((e as CustomEvent<number>).detail);
    const onNight = (e: Event) => {
      const i = (e as CustomEvent<number>).detail;
      setNight(i < 0 ? null : gatesRef.current[i] ?? null);
    };
    const onGates = (e: Event) => {
      const list = (e as CustomEvent<CastleGate[]>).detail;
      gatesRef.current = list;
      setGates(list);
    };
    window.addEventListener("castle-moon", onMoon);
    window.addEventListener("castle-night", onNight);
    window.addEventListener("castle-gates", onGates);
    return () => {
      window.removeEventListener("castle-moon", onMoon);
      window.removeEventListener("castle-night", onNight);
      window.removeEventListener("castle-gates", onGates);
    };
  }, []);

  /* Moon caption slide-in/out */
  useEffect(() => {
    const el = capRef.current;
    if (!el) return;
    if (moon < 0) {
      gsap.to(el, { opacity: 0, x: 20, duration: 0.3 });
    } else {
      gsap.fromTo(el, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" });
    }
  }, [moon]);

  /* Night gate card rise/settle */
  useEffect(() => {
    const el = nightRef.current;
    if (!el) return;
    if (!night) {
      gsap.to(el, { opacity: 0, y: 14, duration: 0.35, overwrite: true });
    } else {
      gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", overwrite: true });
    }
  }, [night]);

  /* 3D flythrough */
  useEffect(() => {
    let stopCastle: (() => void) | undefined;
    let cancelled = false;
    const canvas = canvasRef.current;
    if (canvas) {
      import("@/lib/castle").then((m) => {
        if (cancelled) return;
        stopCastle = m.startCastle(canvas);
      });
    }
    return () => {
      cancelled = true;
      stopCastle?.();
    };
  }, []);

  const activeMoon = moon >= 0 ? UPPER_MOONS[moon] : null;

  return (
    <section
      id="castle"
      data-tone="dark"
      data-name="Infinity Castle"
      className="castle relative z-[5] overflow-hidden rounded-t-[clamp(22px,3vw,44px)] bg-[#0c0508] shadow-[0_-24px_60px_rgba(0,0,0,.5)]"
    >
      <div className="castle__stage svh relative overflow-hidden">
        <canvas
          ref={canvasRef}
          id="castleGL"
          aria-label="A 3D flythrough of the Infinity Castle"
          className="absolute inset-0 block h-full w-full"
        />
        <div className="castle__vig pointer-events-none absolute inset-0 bg-[radial-gradient(90%_80%_at_50%_50%,transparent_40%,rgba(12,5,8,.85))]" />
        <div className="castle__copy absolute bottom-[14vh] left-gut z-[2] max-w-[680px]">
          <div className="castle__kicker mb-2 font-kanji text-[clamp(16px,2vw,24px)] tracking-[0.2em] text-amber">
            無限城 · Mugen-jō
          </div>
          <h2 className="castle__title font-display uppercase leading-[0.84] tracking-[-0.01em] text-[clamp(64px,11vw,190px)] [text-shadow:0_10px_50px_rgba(0,0,0,.6)]">
            <span className="mask block overflow-hidden">
              <span className="block">Infinity</span>
            </span>
            <span className="mask block overflow-hidden">
              <span className="block">Castle.</span>
            </span>
          </h2>
          <p className="castle__sub mt-[18px] max-w-[44ch] opacity-[.85]">
            Every room is a problem statement. Six Upper Moons stand between you and dawn.
          </p>
        </div>
        <div
          ref={capRef}
          id="castleCap"
          className="castle__cap absolute bottom-[14vh] right-gut z-[2] text-right opacity-0 max-[640px]:bottom-[8vh]"
        >
          {activeMoon && (
            <>
              <b className="block font-kanji text-[clamp(30px,4vw,56px)] text-red [text-shadow:0_0_30px_rgba(200,16,46,.6)]">
                {activeMoon.kanji}
              </b>
              <span className="text-xs font-semibold uppercase tracking-[0.3em]">{activeMoon.caption}</span>
            </>
          )}
        </div>
        <div
          ref={nightRef}
          id="castleNight"
          aria-live="polite"
          className="castle__night pointer-events-none absolute bottom-[14vh] left-gut z-[2] max-w-[min(560px,62vw)] opacity-0 [text-shadow:0_4px_30px_rgba(0,0,0,.8)] max-[640px]:bottom-[22vh] max-[640px]:max-w-[58vw]"
        >
          {night && (
            <>
              <span className="castle__nk mb-2 block font-kanji text-[clamp(14px,1.6vw,20px)] tracking-[0.2em] text-amber">
                {night.k} · Night {night.n}
              </span>
              <b className="block font-display uppercase leading-[0.9] text-[clamp(44px,7vw,108px)] text-paper max-[640px]:text-[clamp(38px,12vw,56px)]">
                {night.day} <em className="ml-[0.15em] text-[0.42em] not-italic text-rose">{night.yr}</em>
              </b>
              <span className="castle__nw mt-2.5 block font-display text-[clamp(20px,2.4vw,34px)] uppercase tracking-[0.02em] text-blood max-[640px]:text-[18px]">
                {night.what}
              </span>
              {night.at && (
                <span className="castle__nt mt-1 block text-xs font-semibold uppercase tracking-[0.3em] opacity-[.85]">
                  {night.at}
                </span>
              )}
            </>
          )}
        </div>
        <div className="castle__end pointer-events-none absolute inset-0 z-[3] flex flex-col items-center justify-center text-center opacity-0">
          <div className="castle__kicker mb-2 font-kanji text-[clamp(16px,2vw,24px)] tracking-[0.2em] text-amber">
            The doors open on
          </div>
          <div className="castle__bounty font-display uppercase leading-[0.85] text-[clamp(70px,14vw,240px)] [text-shadow:0_0_80px_rgba(255,26,60,.7)]">
            The Bounty
          </div>
        </div>
        <div className="castle__bar absolute left-gut right-gut top-[84px] z-[2] h-0.5 bg-paper/15">
          <i id="castleBar" className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-red to-amber" />
          <div id="castleTicks" className="castle__ticks pointer-events-none absolute inset-0">
            {gates.map((g) => (
              <i
                key={g.n}
                style={{ left: `${(g.p * 100).toFixed(2)}%` }}
                className="absolute top-[-5px] h-3 w-0.5 -translate-x-[1px] bg-amber"
              >
                <b className="absolute left-1/2 top-[14px] -translate-x-1/2 font-kanji text-[13px] font-normal text-amber">
                  {g.k}
                </b>
              </i>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

