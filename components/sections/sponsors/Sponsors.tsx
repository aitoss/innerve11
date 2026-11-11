import { SPONSORS } from "@/data/sponsors";

export default function Sponsors() {
  return (
    <section
      id="allies"
      data-tone="light"
      data-name="Allies"
      className="allies paper paper-grain pb-[clamp(80px,10vw,150px)] pt-[clamp(60px,8vw,110px)]"
    >
      <div className="wrap mx-auto w-[min(1320px,100%)] px-gut">
        <div className="eyebrow mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] opacity-80">
          <span className="h-0.5 w-7 bg-red" aria-hidden="true" />
          Past sponsors
        </div>
        <h2 className="sec-title font-display uppercase leading-[0.9] tracking-[-0.01em] text-[clamp(48px,9vw,150px)]">
          Allies of the <em>corps.</em>
        </h2>
        <div
          id="agrid"
          className="agrid mt-[clamp(32px,5vw,60px)] grid auto-rows-[150px] grid-cols-4 gap-3 max-[960px]:auto-rows-[120px] max-[960px]:grid-cols-2"
        >
          {SPONSORS.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener"
              className={`atile group relative flex items-center justify-center overflow-hidden border border-ink/15 bg-card p-[34px_24px_20px] transition-[background,border-color] duration-[400ms] hover:border-red hover:bg-red ${
                s.size === "xl" ? "atile--xl col-span-2 row-span-2" : s.size === "l" ? "atile--l col-span-2" : ""
              }`}
            >
              <span className="atile__tier absolute left-[14px] top-3 text-[10px] font-semibold uppercase tracking-[0.22em] opacity-60 group-hover:text-paper group-hover:opacity-90">
                {s.tier}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`assets/logos/sponsors/${s.logo}`}
                alt={s.alt ?? s.name}
                loading="lazy"
                className={`max-w-[76%] object-contain transition-[transform,background,padding] duration-[400ms] group-hover:scale-[1.06] ${
                  s.size === "xl"
                    ? "max-h-[110px] bg-paper px-6 py-[18px]"
                    : "max-h-[54px] group-hover:bg-paper group-hover:px-4 group-hover:py-2.5"
                }`}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

