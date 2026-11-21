"use client";

import { useEffect, useRef, useState } from "react";

const buttonStyle = "pointer-events-auto grid h-11 w-11 place-items-center rounded-full border border-paper/20 bg-ink/90 text-paper shadow-[0_10px_28px_rgba(0,0,0,0.45)] backdrop-blur-md transition-[opacity,transform,background-color,border-color] duration-300 ease-out hover:border-red hover:bg-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper";

export default function FloatingControls() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    const onScroll = () => setVisible(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      audio?.pause();
    };
  }, []);

  const scrollToTop = () => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.LENIS) {
      window.LENIS.scrollTo(0, { duration: 1.6 });
    } else {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }
  };

  const reportAudioError = () => {
    setPlaying(false);
    setAudioError(true);
  };

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    setAudioError(false);
    if (audio.error) audio.load();
    // Starting playback directly from the click lets mobile browsers play audio.
    void audio.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      reportAudioError();
    });
  };

  return (
    <div className="pointer-events-none fixed bottom-[clamp(18px,3vh,30px)] right-gut z-[55] grid justify-items-end gap-2">
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
        className={`group ${buttonStyle} ${visible ? "translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"}`}
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5">
          <path d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={toggleAudio}
        aria-label="Background music"
        aria-pressed={playing}
        title={playing ? "Pause music" : "Play music"}
        className={buttonStyle}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5">
          <path d="M3 9v6h4l5 4V5L7 9H3Z" />
          {playing ? <path d="M16 9a4 4 0 0 1 0 6m2.5-8.5a7.8 7.8 0 0 1 0 11" /> : <path d="m16 10 4 4m0-4-4 4" />}
        </svg>
      </button>
      <audio
        ref={audioRef}
        src="/assets/audio/innerve-theme.mp3"
        preload="none"
        loop
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={reportAudioError}
      />
      {audioError && (
        <p role="status" className="absolute bottom-0 right-14 w-max rounded-sm border border-paper/20 bg-ink px-3 py-2 text-sm text-paper">
          Couldn&apos;t play the music.
        </p>
      )}
    </div>
  );
}
