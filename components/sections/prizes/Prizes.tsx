import { PRIZES, PRIZE_PERKS } from "@/data/prizes";
import type { Prize } from "@/types/content";
import "./prizes.css";

function PrizeCard({ prize }: { prize: Prize }) {
  const isHot = Boolean(prize.hot);
  const isBorderAccent = Boolean(prize.borderAccent);
  const isLarge = prize.size === "lg" || prize.span === "wide";

  const gridSpan = isLarge
    ? "col-span-3 max-[860px]:col-span-1"
    : "col-span-2 max-[860px]:col-span-1";

  const borderClass = isHot
    ? "pcard--hot border-red bg-red"
    : isBorderAccent
      ? "pcard--second border-red bg-ink2 hover:border-red hover:shadow-[0_0_30px_rgba(200,16,46,0.3)]"
      : "border-paper/20 bg-ink2 hover:border-red";

  return (
    <div className={`pcard-wrap ${gridSpan}`}>
      <article
        className={`pcard ${isLarge ? "pcard--lg" : "pcard--sm"} border ${borderClass}`}
      >
        <span
          aria-hidden="true"
          className={`pcard__k absolute leading-none [writing-mode:vertical-rl] font-brush ${
            isLarge
              ? "left-[20px] top-[24px] text-5xl md:text-6xl max-[430px]:text-4xl"
              : "left-[16px] top-[20px] text-4xl md:text-5xl max-[430px]:text-3xl"
          } ${isHot ? "text-ink" : "text-red"}`}
        >
          {prize.kanji}
        </span>

        <div
          className={`pcard__rank uppercase ${
            isLarge
              ? "text-xs md:text-sm font-bold tracking-[0.3em]"
              : "text-[11px] md:text-xs font-semibold tracking-[0.22em] text-paper/85"
          }`}
        >
          {prize.rank}
        </div>

        <div
          className={`pcard__amt mb-auto font-display leading-none ${
            isLarge
              ? "mt-4 text-[clamp(60px,5.8vw,100px)] max-[430px]:text-[52px]"
              : "mt-3 text-[clamp(42px,3.8vw,64px)] max-[430px]:text-[38px]"
          }`}
        >
          <small className="mr-1 align-top text-[0.45em]">₹</small>
          {prize.amt}
        </div>

        <ul
          className={`list-none ${
            isLarge
              ? "mt-6 text-[13px] md:text-sm opacity-[.88]"
              : "mt-4 text-xs md:text-[13px] opacity-[.82]"
          }`}
        >
          {PRIZE_PERKS.map((perk) => (
            <li
              key={perk}
              className={`border-t border-paper/20 ${isLarge ? "py-2.5" : "py-1.5"}`}
            >
              <span
                className={`mr-1.5 align-[2px] ${
                  isLarge ? "text-[10px]" : "text-[8px]"
                } ${isHot ? "text-ink" : "text-red"}`}
              >
                ◆
              </span>
              {perk}
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

export default function Prizes() {
  return (
    <section
      id="prizes"
      data-tone="dark"
      data-name="The Bounty"
      className="prizes relative overflow-hidden bg-ink pb-[clamp(80px,10vw,140px)]"
    >
      <div className="prizes__pin svh flex flex-col items-center justify-center px-gut text-center">
        <div className="eyebrow mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] opacity-80">
          <span className="h-0.5 w-7 bg-red" aria-hidden="true" />
          Prize pool
        </div>
        <div className="prizes__big flex items-start font-display leading-[0.8] tracking-[-0.02em] text-[clamp(80px,28vw,460px)] max-[430px]:text-[clamp(72px,24vw,110px)]">
          <span className="rs mr-[0.05em] mt-[0.25em] text-[0.32em] text-red">₹</span>
          <span id="poolNum">0</span>
          <span className="lacs mb-[0.2em] ml-[0.1em] self-end text-[0.18em] text-red">Lacs+</span>
        </div>
        <p className="prizes__note mt-6 max-w-[46ch] opacity-75 max-[430px]:text-sm max-[430px]:max-w-[90%]">
          Cash, goodies, certificates and a few surprises for those who survive the night.
        </p>
      </div>

      <div className="wrap mx-auto w-[min(1320px,100%)] px-gut">
        <div
          id="pcards"
          className="pcards grid grid-cols-6 gap-4 max-[860px]:grid-cols-1"
        >
          {PRIZES.map((prize) => (
            <PrizeCard key={prize.rank} prize={prize} />
          ))}
        </div>
      </div>
    </section>
  );
}
