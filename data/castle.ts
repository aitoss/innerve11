import type { NightGateSeed, UpperMoon } from "@/types/content";

export const CASTLE_FLOOR_A = -2.2;
export const CASTLE_FLOOR_B = -82.2;
export const CASTLE_SHAFT_Z = -104;

/** Upper Moon encounters in Infinity Castle flythrough order. */
export const UPPER_MOONS: UpperMoon[] = [
  { id: "daki", kanji: "上弦の陸", caption: "Upper Six · Daki", x: -2.1, fy: CASTLE_FLOOR_A, z: -26, height: 4.2 },
  { id: "gyokko", kanji: "上弦の伍", caption: "Upper Five · Gyokko", x: 2.1, fy: CASTLE_FLOOR_A, z: -52, height: 3.8 },
  { id: "hantengu", kanji: "上弦の肆", caption: "Upper Four · Hantengu", x: -2.0, fy: CASTLE_FLOOR_A, z: -78, height: 3.2 },
  { id: "akaza", kanji: "上弦の参", caption: "Upper Three · Akaza", x: 2.3, fy: -46, z: CASTLE_SHAFT_Z, height: 3.6, onPlatform: true },
  { id: "doma", kanji: "上弦の弐", caption: "Upper Two · Doma", x: -2.2, fy: CASTLE_FLOOR_B, z: -136, height: 4.2 },
  { id: "kokushibo", kanji: "上弦の壱", caption: "Upper One · Kokushibo", x: 2.1, fy: CASTLE_FLOOR_B, z: -160, height: 4.4 },
  { id: "nakime", kanji: "琵琶", caption: "The Biwa · Nakime", x: -2.3, fy: CASTLE_FLOOR_B, z: -190, height: 4.2 },
];

/** Hanging timeline gate plaques along the Infinity Castle descent. */
export const NIGHT_GATES: NightGateSeed[] = [
  { k: "壱", n: "01", day: "15 NOV", yr: "2026", what: "Registration starts", at: "12:00 AM IST", z: -12, fy: CASTLE_FLOOR_A },
  { k: "弐", n: "02", day: "31 DEC", yr: "2026", what: "Registration ends", at: "11:59 PM IST", z: -62, fy: CASTLE_FLOOR_A },
  { k: "参", n: "03", day: "08 JAN", yr: "2027", what: "Shortlisted teams announced", at: "", z: -124, fy: CASTLE_FLOOR_B },
  { k: "肆", n: "04", day: "30 JAN", yr: "2027", what: "Hackathon begins", at: "24-hour coding marathon", z: -148, fy: CASTLE_FLOOR_B },
  { k: "伍", n: "05", day: "31 JAN", yr: "2027", what: "Results announced", at: "", z: -178, fy: CASTLE_FLOOR_B },
];

