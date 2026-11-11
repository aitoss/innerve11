import type Lenis from "lenis";

declare global {
  interface Window {
    CASTLE?: {
      progress: number;
      visible?: boolean;
      nights?: unknown;
      info?: unknown;
    };
    SFX?: {
      play: (name?: string) => void;
      start: () => void;
      toggle: () => boolean;
      on: boolean;
      level: () => number;
    };
    LENIS?: Lenis | null;
  }
}

export {};

