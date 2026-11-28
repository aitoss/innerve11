"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { EVENT } from "@/data/event";

export interface NavSection {
  id: string;
  number: string;
  title: string;
  jpTitle: string;
  kanji: string;
  category: string;
  subtitle: string;
  desc: string;
  image: string;
  highlights: string[];
  accent: string;
  glowColor: string;
  tag: string;
  isExternalPdf?: boolean;
}

export const MENU_SECTIONS: NavSection[] = [
  {
    id: "arrival",
    number: "01",
    title: "ARRIVAL",
    jpTitle: "炎柱 · 降臨",
    kanji: "炎",
    category: "The Flame Hashira",
    subtitle: "Set Your Heart Ablaze",
    desc: "Kick off the ultimate 24-hour hackathon journey. Set your heart ablaze alongside hundreds of passionate developers at AIT Pune.",
    image: "/assets/img/chars/rengoku.webp",
    highlights: [EVENT.dates, "AIT Pune", "24h Hackathon", "OSS Club"],
    accent: "from-[#ff2a48] via-[#ea6a1c] to-[#f6bd33]",
    glowColor: "rgba(234, 106, 28, 0.2)",
    tag: "HERO CHAPTER",
  },
  {
    id: "tracks",
    number: "02",
    title: "TRACKS",
    jpTitle: "全集中 · 呼吸法",
    kanji: "息",
    category: "Breathing Styles & Domains",
    subtitle: "8 Battle-Tested Problem Domains",
    desc: "Harness your breathing form across 8 specialized domains: Health, AR/VR, EduTech, GameDev, Web3, FinTech, Open Innovation, and AI/ML.",
    image: "/assets/img/chars/tengen.webp",
    highlights: ["8 Domains", "Hashira Guided", "Industry Problem Sets", "Mentor Access"],
    accent: "from-[#d6a640] via-[#ea6a1c] to-[#ff2a48]",
    glowColor: "rgba(214, 166, 64, 0.2)",
    tag: "CHALLENGES",
  },
  {
    id: "castle",
    number: "03",
    title: "INFINITY CASTLE",
    jpTitle: "異空間 · 無限城",
    kanji: "城",
    category: "Interactive 3D Realm",
    subtitle: "Dimensional Fortress of Nakime",
    desc: "Venture through the shifting architecture of the dimensional fortress. An interactive WebGL experience warping space and perspective.",
    image: "/assets/img/chars/nakime.webp",
    highlights: ["Interactive 3D WebGL", "Procedural Motion", "Nakime Biwa Strum", "Dynamic Lighting"],
    accent: "from-[#b8122c] via-[#8e0a1f] to-[#17131a]",
    glowColor: "rgba(184, 18, 44, 0.2)",
    tag: "IMMERSIVE EXPERIENCE",
  },
  {
    id: "prizes",
    number: "04",
    title: "PRIZES",
    jpTitle: "討伐 · 報奨金",
    kanji: "賞",
    category: "Bounty & Spoils",
    subtitle: "₹12,00,000+ Total Pool",
    desc: "Claim bounties worthy of Hashira. High-value cash awards, category prizes, sponsored track bounties, cloud credits, and exclusive swag.",
    image: "/assets/img/chars/gyomei.webp",
    highlights: ["₹12 Lakhs+ Pool", "1st Prize: ₹1,25,000+", "Track Bounties", "Internships & Perks"],
    accent: "from-[#f6bd33] via-[#d6a640] to-[#ea6a1c]",
    glowColor: "rgba(246, 189, 51, 0.2)",
    tag: "REWARDS",
  },
  {
    id: "voices",
    number: "05",
    title: "HASHIRA VOICES",
    jpTitle: "歴代の証言 · 記録",
    kanji: "声",
    category: "Chronicles & Tales",
    subtitle: "Wisdom From Past Champions",
    desc: "Discover how past winners conquered the arena: battle-tested strategies, sleepless night triumphs, and groundbreaking projects.",
    image: "/assets/img/chars/mitsuri.webp",
    highlights: ["Past Champions", "Winning Project Demos", "Community Wisdom", "Hacker Culture"],
    accent: "from-[#ff6a80] via-[#ff2a48] to-[#9b7fd1]",
    glowColor: "rgba(255, 106, 128, 0.2)",
    tag: "TESTIMONIALS",
  },
  {
    id: "allies",
    number: "06",
    title: "CORPS ALLIES",
    jpTitle: "協賛 · 支援部隊",
    kanji: "盟",
    category: "Sponsors & Partners",
    subtitle: "Global Industry Leaders",
    desc: "Backed by the finest tech organizations providing powerful toolkits, APIs, infrastructure credits, and direct developer recruitment pipelines.",
    image: "/assets/img/chars/giyu.webp",
    highlights: ["Devfolio", "MongoDB", "CodeCrafters", "Global Tech Network"],
    accent: "from-[#1f6b4a] via-[#9b7fd1] to-[#b8122c]",
    glowColor: "rgba(31, 107, 74, 0.2)",
    tag: "SPONSORS",
  },
  {
    id: "faq",
    number: "07",
    title: "ANCIENT SCROLLS",
    jpTitle: "掟と心得 · 質疑",
    kanji: "巻",
    category: "FAQ & Sacred Rules",
    subtitle: "Rules, Logistics & Travel",
    desc: "All questions answered: eligibility requirements, team size (2–4), free lodging and meals, judging criteria, and submission deadlines.",
    image: "/assets/img/chars/sanemi.webp",
    highlights: ["Free Food & Stay", "Teams of 2–4", "Zero Entry Fee", "Offline at AIT Pune"],
    accent: "from-[#e3d9c8] via-[#ea6a1c] to-[#b8122c]",
    glowColor: "rgba(227, 217, 200, 0.2)",
    tag: "FAQ & RULES",
  },
];

const BROCHURE_SECTION: NavSection = {
  id: "brochure",
  number: "PDF",
  title: "BROCHURE",
  jpTitle: "案内書 · 規則",
  kanji: "冊",
  category: "Official Event Guidebook",
  subtitle: "Rules, Schedule & Problem Statements",
  desc: "Download and view the official Innerve 11 hackathon brochure. Includes in-depth track guidelines, schedule, venue directions at AIT Pune, food and lodging details, and submission guidelines.",
  image: "/assets/img/chars/shinobu.webp",
  highlights: ["Official Rulebook", "Full Event Schedule", "Judging Parameters", "Travel & Lodging Guide"],
  accent: "from-[#b8122c] via-[#ea6a1c] to-[#d6a640]",
  glowColor: "rgba(184, 18, 44, 0.25)",
  tag: "OFFICIAL PDF GUIDE",
  isExternalPdf: true,
};

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  brochureUrl?: string;
}

export default function MenuModal({
  isOpen,
  onClose,
  brochureUrl = "https://drive.google.com/file/d/1n9jZB292vtvmzalmzUfWMRTLrL6opSuO/view",
}: MenuModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isBrochureHovered, setIsBrochureHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When opened, always select the Hero item (ARRIVAL)
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
      setHoveredIndex(null);
      setIsBrochureHovered(false);
    }
  }, [isOpen]);

  // Lock body scroll and stop Lenis when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (window.LENIS) {
      window.LENIS.stop();
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      if (window.LENIS) {
        window.LENIS.start();
      }
    };
  }, [isOpen]);

  // Navigate to section and close modal
  const handleNavigate = useCallback(
    (id: string) => {
      onClose();
      setTimeout(() => {
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (id === "arrival") {
          if (window.LENIS) {
            window.LENIS.scrollTo(0, { duration: 1.6 });
          } else {
            window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
          }
          return;
        }

        const target = document.getElementById(id);
        if (!target) return;

        if (window.LENIS) {
          window.LENIS.scrollTo(target, { duration: 1.6 });
        } else {
          target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
        }
      }, 100);
    },
    [onClose]
  );

  // Keyboard navigation: Escape to close, arrows to cycle, Enter to select
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setIsBrochureHovered(false);
        setActiveIndex((prev) => (prev + 1) % MENU_SECTIONS.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setIsBrochureHovered(false);
        setActiveIndex((prev) => (prev - 1 + MENU_SECTIONS.length) % MENU_SECTIONS.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (isBrochureHovered) {
          window.open(brochureUrl, "_blank");
          onClose();
          return;
        }
        const current = hoveredIndex !== null ? hoveredIndex : activeIndex;
        handleNavigate(MENU_SECTIONS[current].id);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, activeIndex, hoveredIndex, isBrochureHovered, brochureUrl, handleNavigate, onClose]);

  if (!mounted || !isOpen) return null;

  const activeSection = isBrochureHovered
    ? BROCHURE_SECTION
    : MENU_SECTIONS[hoveredIndex !== null ? hoveredIndex : activeIndex];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Innerve 11 Navigation Menu"
      style={{ backgroundColor: "rgba(251, 244, 228, 0.96)" }}
      className="fixed inset-0 z-[100] flex flex-col justify-between overflow-y-auto backdrop-blur-2xl text-coat transition-all duration-300"
    >
      {/* Background authentic paper grain texture */}
      <div
        className="pointer-events-none fixed inset-0 opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />
      {/* Ambient subtle warm glow */}
      <div
        className="pointer-events-none fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[140px] transition-colors duration-700"
        style={{ backgroundColor: activeSection.glowColor }}
        aria-hidden="true"
      />

      {/* ================= MODAL HEADER ================= */}
      <header className="relative z-10 flex shrink-0 items-center justify-between px-gut pt-[clamp(20px,3svh,36px)] pb-4">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl sm:text-2xl uppercase tracking-wider text-coat">
                INNERVE 11
              </span>
              <span className="rounded border border-crimson/30 bg-crimson/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-crimson">
                Directory
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-coat/65">
              Set Your Heart Ablaze · AIT Pune
            </span>
          </div>
        </div>

        {/* Right Cross (X) Close Button - Clean without black background */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="group flex h-10 w-10 cursor-pointer items-center justify-center bg-transparent text-[#B9172E] transition-transform duration-200 hover:scale-115 active:scale-90 focus:outline-none"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7 transition-transform duration-300 group-hover:rotate-90"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </header>

      {/* ================= MAIN CONTENT (CRED-STYLE LIGHT MODE SPLIT) ================= */}
      <main className="relative z-10 flex flex-1 items-center px-gut py-4 sm:py-6">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-12">
          
          {/* ----- LEFT: MENU ITEMS VERTICALLY + BROCHURE BUTTON ----- */}
          <div className="flex flex-col justify-center space-y-1 sm:space-y-2 lg:col-span-5 xl:col-span-5">
            <div className="mb-2 hidden sm:block text-[11px] font-bold uppercase tracking-[0.22em] text-coat/50">
              Select Destination
            </div>

            <nav aria-label="Sections" className="flex flex-col space-y-[clamp(3px,0.6svh,6px)]">
              {MENU_SECTIONS.map((section, idx) => {
                const isSelected = !isBrochureHovered && idx === (hoveredIndex !== null ? hoveredIndex : activeIndex);
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleNavigate(section.id)}
                    onMouseEnter={() => {
                      setIsBrochureHovered(false);
                      setHoveredIndex(idx);
                      setActiveIndex(idx);
                    }}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onFocus={() => {
                      setIsBrochureHovered(false);
                      setActiveIndex(idx);
                    }}
                    className={`group relative flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-[clamp(5px,0.9svh,12px)] text-left transition-all duration-200 focus:outline-none ${
                      isSelected
                        ? "bg-white/85 border border-crimson/40 shadow-[0_6px_28px_rgba(185,23,46,0.15)] translate-x-1 sm:translate-x-2"
                        : "border border-coat/10 bg-coat/[0.03] hover:bg-coat/[0.07] hover:border-coat/20 hover:translate-x-1"
                    }`}
                  >
                    {/* Active flame indicator bar */}
                    <div
                      className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 rounded-r-full bg-gradient-to-b from-crimson to-flame transition-all duration-300 ${
                        isSelected ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
                      }`}
                      aria-hidden="true"
                    />

                    {/* Left details: Number + Title + Subtitle */}
                    <div className="flex items-center gap-3 sm:gap-4 pl-1">
                      <span
                        className={`font-mono text-xs sm:text-sm font-bold tracking-widest transition-colors duration-200 ${
                          isSelected ? "text-crimson" : "text-coat/60 group-hover:text-crimson"
                        }`}
                      >
                        {section.number}
                      </span>

                      <div className="flex flex-col">
                        <span
                          className={`font-display text-2xl sm:text-3xl lg:text-[clamp(22px,3.6svh,36px)] lg:leading-[1.1] uppercase tracking-tight transition-colors duration-200 ${
                            isSelected
                              ? "text-crimson drop-shadow-[0_2px_8px_rgba(185,23,46,0.12)]"
                              : "text-coat group-hover:text-crimson"
                          }`}
                        >
                          {section.title}
                        </span>
                        <span
                          className={`text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-200 ${
                            isSelected ? "text-flame" : "text-coat/65 group-hover:text-coat/90"
                          }`}
                        >
                          {section.category}
                        </span>
                      </div>
                    </div>

                    {/* Right: Japanese Kanji & Arrow Indicator */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-kanji text-lg sm:text-xl font-bold transition-all duration-200 ${
                          isSelected
                            ? "text-crimson scale-110 drop-shadow-[0_0_8px_rgba(185,23,46,0.25)]"
                            : "text-coat/40 group-hover:text-crimson"
                        }`}
                      >
                        {section.kanji}
                      </span>
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className={`h-4 w-4 transition-all duration-200 ${
                          isSelected
                            ? "opacity-100 translate-x-0 text-crimson"
                            : "opacity-0 -translate-x-2 text-coat/40 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-crimson"
                        }`}
                        aria-hidden="true"
                      >
                        <path
                          d="M3 8H13M13 8L9 4M13 8L9 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>
                );
              })}

              
              <div className="pt-[clamp(2px,0.8svh,8px)]">
                <a
                  href={brochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setIsBrochureHovered(true)}
                  onMouseLeave={() => setIsBrochureHovered(false)}
                  onFocus={() => setIsBrochureHovered(true)}
                  onBlur={() => setIsBrochureHovered(false)}
                  className={`group relative flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-[clamp(5px,0.9svh,12px)] text-left transition-all duration-200 focus:outline-none ${
                    isBrochureHovered
                      ? "bg-white border-2 border-crimson shadow-[0_8px_30px_rgba(185,23,46,0.22)] translate-x-1 sm:translate-x-2"
                      : "border-2 border-crimson/35 bg-gradient-to-r from-crimson/[0.08] via-flame/[0.05] to-amber/[0.08] hover:border-crimson hover:bg-white hover:translate-x-1 shadow-[0_4px_16px_rgba(185,23,46,0.1)]"
                  }`}
                >
                 
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 rounded-r-full bg-gradient-to-b from-crimson to-flame transition-all duration-300 ${
                      isBrochureHovered ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
                    }`}
                    aria-hidden="true"
                  />

                  
                  <div className="flex items-center gap-3 sm:gap-4 pl-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-crimson/15 text-crimson transition-colors duration-200 group-hover:bg-crimson group-hover:text-white">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-2xl sm:text-3xl lg:text-[clamp(22px,3.6svh,30px)] lg:leading-[1.1] uppercase tracking-tight text-crimson group-hover:text-red transition-colors">
                          BROCHURE
                        </span>
                        <span className="rounded bg-crimson px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
                          PDF
                        </span>
                      </div>
                      <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-coat/75 group-hover:text-coat">
                        Open In Browser · Official Guidebook
                      </span>
                    </div>
                  </div>

                 
                  <div className="flex items-center gap-2 pr-1">
                    <span className="hidden sm:inline-block font-mono text-[10px] font-bold uppercase tracking-wider text-crimson/80">
                      View
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-crimson transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                </a>
              </div>
            </nav>
          </div>

         
          <div className="hidden lg:flex lg:col-span-7 xl:col-span-7 flex-col justify-center">
            <div className="relative overflow-hidden rounded-2xl border border-coat/15 bg-white/90 p-8 shadow-[0_20px_50px_rgba(42,27,22,0.1)] backdrop-blur-xl transition-all duration-500 min-h-[460px] flex items-center">
              
             
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-[100px] opacity-25 transition-all duration-700"
                style={{ backgroundColor: activeSection.glowColor }}
                aria-hidden="true"
              />

              
              <div
                className="pointer-events-none absolute -right-4 -bottom-10 select-none font-kanji text-[15rem] font-black text-coat/[0.04] leading-none"
                aria-hidden="true"
              >
                {activeSection.kanji}
              </div>

             
              <div className="relative z-10 grid w-full grid-cols-12 items-center gap-6">
                
                
                <div className="col-span-7 flex flex-col space-y-4">
                 
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-coat/15 bg-coat/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-coat/80">
                      {activeSection.tag}
                    </span>
                    <span className="font-mono text-xs font-bold text-crimson">
                      SEC // {activeSection.number}
                    </span>
                  </div>

                  
                  <div>
                    <h2 className="font-display text-4xl xl:text-5xl uppercase tracking-tight text-coat">
                      {activeSection.title}
                    </h2>
                    <p className="font-kanji text-sm font-semibold tracking-wider text-crimson mt-1">
                      {activeSection.jpTitle}
                    </p>
                  </div>

                
                  <p className="text-sm xl:text-base leading-relaxed text-coat/80">
                    {activeSection.desc}
                  </p>

                 
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activeSection.highlights.map((item, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-coat/15 bg-coat/[0.04] px-2.5 py-1 text-xs font-medium text-coat/90"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  
                  <div className="pt-2">
                    {activeSection.isExternalPdf ? (
                      <a
                        href={brochureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-crimson to-red px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_6px_22px_rgba(184,18,44,0.35)] transition-all duration-300 hover:brightness-105 hover:shadow-[0_8px_28px_rgba(184,18,44,0.45)] active:scale-95"
                      >
                        <span>Open PDF in Browser</span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleNavigate(activeSection.id)}
                        className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-crimson to-red px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_6px_22px_rgba(184,18,44,0.35)] transition-all duration-300 hover:brightness-105 hover:shadow-[0_8px_28px_rgba(184,18,44,0.45)] active:scale-95"
                      >
                        <span>Jump to {activeSection.title}</span>
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 8H13M13 8L9 4M13 8L9 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right side Character Artwork */}
                <div className="col-span-5 flex items-center justify-center">
                  <div className="relative aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-xl border border-coat/15 bg-gradient-to-t from-[#efe8dc] via-[#fbf4e4]/70 to-white/50 p-2 shadow-lg">
                    <div
                      className="pointer-events-none absolute inset-0 opacity-25 blur-xl transition-all duration-700"
                      style={{ backgroundColor: activeSection.glowColor }}
                      aria-hidden="true"
                    />
                    <img
                      src={activeSection.image}
                      alt={activeSection.title}
                      draggable={false}
                      className="relative z-10 h-full w-full object-contain object-bottom drop-shadow-[0_16px_32px_rgba(42,27,22,0.25)] transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ================= MODAL FOOTER ================= */}
      <footer className="relative z-10 flex shrink-0 items-center justify-between border-t border-coat/10 px-gut py-3 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.16em] text-coat/60">
        <div>OSS Club · AIT Pune</div>
        <div className="hidden md:block">
          Use <kbd className="rounded bg-coat/10 px-1.5 py-0.5 text-coat font-mono">↑</kbd> <kbd className="rounded bg-coat/10 px-1.5 py-0.5 text-coat font-mono">↓</kbd> to explore · <kbd className="rounded bg-coat/10 px-1.5 py-0.5 text-coat font-mono">Enter</kbd> to jump · <kbd className="rounded bg-coat/10 px-1.5 py-0.5 text-coat font-mono">Esc</kbd> to close
        </div>
        <div>{EVENT.dates}</div>
      </footer>
    </div>,
    document.body
  );
}
