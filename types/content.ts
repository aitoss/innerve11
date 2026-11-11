export type BreathingForm =
  | "insect"
  | "mist"
  | "flame"
  | "sound"
  | "stone"
  | "serpent"
  | "love"
  | "wind"
  | "water";

export interface Track {
  name: string;
  form: BreathingForm;
  formJp: string;
  formEn: string;
  /** Path under /public. */
  img: string;
  hashira: string;
  style: string;
  kanji: string;
  /** SVG pattern id defined in components/sections/tracks/PatternDefs.tsx. */
  pat: string;
  desc: string;
}

export interface Prize {
  rank: string;
  kanji: string;
  amt: string;
  hot?: boolean;
  span?: "wide";
}

export interface Testimonial {
  name: string;
  org: string;
  quote: string;
}

export interface Sponsor {
  tier: string;
  name: string;
  logo: string;
  url: string;
  alt?: string;
  size?: "xl" | "l";
}

export interface TimelineItem {
  date: string;
  title: string;
  text: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface CastleGate {
  k: string;
  n: string;
  day: string;
  yr: string;
  what: string;
  at: string;
  p: number;
}

export interface NightGateSeed {
  k: string;
  n: string;
  day: string;
  yr: string;
  what: string;
  at: string;
  z: number;
  fy: number;
}

export interface UpperMoon {
  id: string;
  kanji: string;
  caption: string;
  x: number;
  fy: number;
  z: number;
  height: number;
  onPlatform?: boolean;
}

