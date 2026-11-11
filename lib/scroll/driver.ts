/* Innerve 11 — sections driver.
   Faithful port of the static build's main.js: same GSAP/Lenis orchestration,
   same selectors, same event contract with the castle module. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { POOL_LACS } from "@/data/prizes";
import { splitChars } from "@/lib/scroll/splitText";

const $ = (s: string, r: Document | HTMLElement = document) =>
  r.querySelector(s) as HTMLElement | null;
const $$ = (s: string, r: Document | HTMLElement = document) =>
  [...r.querySelectorAll(s)] as HTMLElement[];

export function initDriver(): () => void {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animate = !reduced;
  const cleanups: (() => void)[] = [];

  // no audio in this build; keep the no-op interface the castle scene expects
  const SFX = (window.SFX = window.SFX || {
    play() {},
    start() {},
    toggle: () => false,
    on: false,
    level: () => 0,
  });

  /* ---------- split text into words/chars ---------- */
  // guarded so a StrictMode / Fast Refresh re-run does not split already-split text
  $$(".castle__title .mask > span, .sec-title, .castle__bounty").forEach((el) => {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    splitChars(el);
  });

  /* ---------- smooth anchor scrolling (both paths) ---------- */
  const bindAnchors = (lenis: Lenis | null) => {
    $$("[data-scroll]").forEach((a) => {
      const onClick = (e: Event) => {
        const href = a.getAttribute("href");
        if (!href) return;
        const target = href === "#top" ? 0 : $(href);
        if (target === null) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { duration: 1.8 });
        else if (target === 0) window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      };
      a.addEventListener("click", onClick);
      cleanups.push(() => a.removeEventListener("click", onClick));
    });
  };

  /* ---------- static fallback ---------- */
  if (!animate) {
    document.documentElement.classList.add("no-anim");
    const poolEl = $("#poolNum");
    if (poolEl) poolEl.textContent = String(POOL_LACS);
    bindAnchors(null);
    return () => cleanups.forEach((fn) => fn());
  }

  /* ================= ANIMATED PATH ================= */
  /* All GSAP work runs inside a context so React StrictMode's double effect
     (and dev Fast Refresh) can fully revert tweens/triggers/styles. Without
     this, a re-run creates duplicate from-tweens that record mid-flight
     values as their end state and freeze content invisible. */
  const ctx = gsap.context(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true }); // mobile address-bar resizes were re-laying out the pinned castle mid-scroll
    const SECTIONS = $$("main > section"); // grab before pinning wraps them in spacers

    // Smooth scroll
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    window.LENIS = lenis;
    cleanups.push(() => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.LENIS = null;
    });
    bindAnchors(lenis);

    const flash = (o = 0.6) =>
      gsap.fromTo(
        "#flash",
        { opacity: o },
        { opacity: 0, duration: 0.45, ease: "power2.out", overwrite: true }
      );

    /* ----- INFINITY CASTLE (3D in lib/castle/; this drives it) ----- */
    const CASTLE = (window.CASTLE = window.CASTLE || { progress: 0 });
    const barEl = $("#castleBar");
    const onShift = () => flash(0.22);
    window.addEventListener("castle-shift", onShift);
    cleanups.push(() => window.removeEventListener("castle-shift", onShift));
    void SFX;

    const castleTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#castle",
        start: "top top",
        end: "+=320%",
        pin: true,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          CASTLE.progress = self.progress;
          if (barEl) barEl.style.transform = `scaleX(${self.progress})`;
        },
      },
    });
    castleTl
      .to(".castle__copy", { opacity: 0, y: -40, duration: 0.06 }, 0.08)
      .to(".castle__end", { opacity: 1, duration: 0.05 }, 0.9)
      .from(".castle__bounty .ch", { yPercent: 80, opacity: 0, stagger: 0.004, duration: 0.05 }, 0.9)
      .call(() => SFX.play("gong"), [], 0.9)
      .call(() => flash(0.5), [], 0.965)
      .to({}, { duration: 0.02 }, 0.98);

    /* ----- PRIZES ----- */
    const pool = { v: 0 };
    const poolEl = $("#poolNum");
    gsap
      .timeline({
        scrollTrigger: { trigger: ".prizes__pin", start: "top top", end: "+=70%", pin: true, scrub: 1 },
      })
      .from(".prizes__big", { scale: 0.6, opacity: 0, duration: 0.3 }, 0)
      .to(
        pool,
        {
          v: POOL_LACS,
          duration: 0.5,
          ease: "power1.out",
          onUpdate: () => {
            if (poolEl) poolEl.textContent = String(Math.round(pool.v));
          },
        },
        0
      )
      .call(() => SFX.play("taiko"), [], 0.02)
      .from(".prizes__note, .prizes .eyebrow", { opacity: 0, y: 20, duration: 0.2 }, 0.3)
      .to(".prizes__pin", { opacity: 0.15, scale: 0.92, duration: 0.3 }, 0.7);

    gsap.from(".pcard-wrap", {
      y: 48,
      opacity: 0,
      stagger: 0.08,
      duration: 0.85,
      ease: "power3.out",
      clearProps: "transform",
      scrollTrigger: { trigger: "#pcards", start: "top 88%", once: true },
    });

    /* ===== non-pinned triggers (created after every pin so positions include pin spacing) ===== */
    $$(".sec-title").forEach((el) =>
      gsap.from(el.querySelectorAll(".ch"), {
        yPercent: 100,
        rotation: 8,
        opacity: 0,
        stagger: 0.018,
        duration: 0.8,
        ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      })
    );

    /* ----- VOICES + ALLIES ----- */
    gsap.from(".vcard", {
      y: 60,
      opacity: 0,
      stagger: 0.12,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: "#vgrid", start: "top 85%" },
    });
    gsap.from(".atile", {
      y: 40,
      opacity: 0,
      scale: 0.96,
      stagger: 0.04,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: "#agrid", start: "top 85%" },
    });
    gsap.from(".hanko", {
      scale: 2.2,
      opacity: 0,
      rotation: -30,
      stagger: 0.15,
      duration: 0.5,
      ease: "back.out(2)",
      scrollTrigger: { trigger: "#vgrid", start: "top 70%" },
    });

    /* ----- tone per section (kept for any tone-dependent styling) ----- */
    SECTIONS.forEach((sec) => {
      const spacer = sec.parentElement?.classList.contains("pin-spacer")
        ? (sec.parentElement as HTMLElement)
        : sec;
      ScrollTrigger.create({
        trigger: spacer,
        start: "top 32px",
        end: "bottom 32px",
        onToggle: (self) => {
          if (self.isActive) document.body.dataset.tone = sec.dataset.tone;
        },
      });
    });
    document.body.dataset.tone = "dark";

    /* The hero owns the only entrance timeline (and its own watchdog). Here we
       just re-measure once things settle; scroll-driven timelines are never
       force-completed. */
    const settle = window.setTimeout(() => ScrollTrigger.refresh(), 2500);
    cleanups.push(() => window.clearTimeout(settle));

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    cleanups.push(() => window.removeEventListener("load", onLoad));
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  });

  return () => {
    ctx.revert(); // kills + reverts every tween, trigger and inline style made above
    cleanups.forEach((fn) => fn());
  };
}

