import { PRIZES, PRIZE_PERKS } from "@/data/prizes";
import type { Prize } from "@/types/content";
import "./prizes.css";

function PrizeCard({ prize }: { prize: Prize }) {
  const isHot = Boolean(prize.hot);
  const gridSpan =
    prize.span === "wide"
      ? "col-span-3 max-[960px]:col-span-1"
      : "col-span-2 max-[960px]:col-span-1 max-[960px]:first:col-span-2 max-[640px]:first:col-span-1";

  return (
    <div className={`pcard-wrap ${gridSpan}`}>
      <article
        className={`pcard border ${
          isHot ? "pcard--hot border-red bg-red" : "border-paper/20 bg-ink2 hover:border-red"
        }`}
      >
        <span
          aria-hidden="true"
          className={`pcard__k absolute left-[18px] top-[22px] font-brush text-5xl leading-none [writing-mode:vertical-rl] ${
            isHot ? "text-ink" : "text-red"
          }`}
        >
          {prize.kanji}
        </span>

        <div className="pcard__rank text-xs font-semibold uppercase tracking-[0.3em]">
          {prize.rank}
        </div>

        <div className="pcard__amt mb-auto mt-[14px] font-display leading-none text-[clamp(56px,6vw,96px)]">
          <small className="mr-1 align-top text-[0.45em]">₹</small>
          {prize.amt}
        </div>

        <ul className="mt-6 list-none text-[13px] opacity-[.85]">
          {PRIZE_PERKS.map((perk) => (
            <li key={perk} className="border-t border-paper/20 py-2">
              <span className={`mr-1 align-[2px] text-[9px] ${isHot ? "text-ink" : "text-red"}`}>
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
        <div className="prizes__big flex items-start font-display leading-[0.8] tracking-[-0.02em] text-[clamp(110px,30vw,460px)]">
          <span className="rs mr-[0.05em] mt-[0.25em] text-[0.32em] text-red">₹</span>
          <span id="poolNum">0</span>
          <span className="lacs mb-[0.2em] ml-[0.1em] self-end text-[0.18em] text-red">Lacs+</span>
        </div>
        <p className="prizes__note mt-6 max-w-[46ch] opacity-75">
          Cash, goodies, certificates and a few surprises for those who survive the night.
        </p>
      </div>

      <div className="wrap mx-auto w-[min(1320px,100%)] px-gut">
        <div
          id="pcards"
          className="pcards grid grid-cols-6 gap-4 max-[960px]:grid-cols-2 max-[640px]:grid-cols-1"
        >
          {PRIZES.map((prize) => (
            <PrizeCard key={prize.rank} prize={prize} />
          ))}
        </div>
      </div>
    </section>
  );
}
