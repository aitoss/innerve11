import type { Prize } from "@/types/content";

/** Headline prize pool in lakhs (the counter in the prize section counts up to this). */
export const POOL_LACS = 12;

export const PRIZES: Prize[] = [
  { rank: "1st Prize", kanji: "壱", amt: "125K+", hot: true },
  { rank: "2nd Prize", kanji: "弐", amt: "75K+" },
  { rank: "3rd Prize", kanji: "参", amt: "50K+" },
  { rank: "Ingenious Spark", kanji: "閃", amt: "25K+", span: "wide" },
  { rank: "Visionary Spark", kanji: "光", amt: "15K+", span: "wide" },
];

export const PRIZE_PERKS = [
  "Innerve goodies and merch",
  "Funding and internship opportunities from our sponsors",
];

