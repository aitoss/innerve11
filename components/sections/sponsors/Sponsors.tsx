import { SPONSORS, SPONSOR_FORM_URL } from "@/data/sponsors";

interface SponsorsProps {
  formUrl?: string;
}

export default function Sponsors({ formUrl = SPONSOR_FORM_URL }: SponsorsProps) {
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
        <h2 className="sec-title font-display uppercase leading-[0.9] tracking-[-0.01em] text-[clamp(48px,9vw,150px)] max-[430px]:text-[clamp(36px,11vw,54px)]">
          Allies of the <em>corps.</em>
        </h2>
        <div
          id="agrid"
          className="agrid mt-[clamp(32px,5vw,60px)] grid auto-rows-[150px] grid-cols-4 gap-3 max-[960px]:auto-rows-[120px] max-[960px]:grid-cols-2 max-[640px]:grid-cols-2 max-[430px]:auto-rows-[100px] max-[430px]:grid-cols-1"
        >
          {SPONSORS.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener"
              className={`atile group relative flex items-center justify-center overflow-hidden border border-ink/15 bg-card p-[34px_24px_20px] transition-[background,border-color] duration-[400ms] hover:border-red hover:bg-red ${
                s.size === "xl" ? "atile--xl col-span-2 row-span-2 max-[430px]:col-span-1 max-[430px]:row-span-1" : s.size === "l" ? "atile--l col-span-2 max-[430px]:col-span-1" : ""
              }`}
            >
              <span className="atile__tier absolute left-[14px] top-3 text-[10px] font-semibold uppercase tracking-[0.22em] opacity-60 group-hover:text-paper group-hover:opacity-90">
                {s.tier}
              </span>
              <img
                src={`assets/logos/sponsors/${s.logo}`}
                alt={s.alt ?? s.name}
                loading="lazy"
                className={`max-w-[76%] object-contain transition-[transform,background,padding] duration-[400ms] group-hover:scale-[1.06] ${
                  s.size === "xl"
                    ? "max-h-[110px] group-hover:bg-paper group-hover:px-6 group-hover:py-[18px]"
                    : "max-h-[54px] group-hover:bg-paper group-hover:px-4 group-hover:py-2.5"
                }`}
              />
            </a>
          ))}
        </div>

        {/* Want to Sponsor Us Banner */}
        <div className="mt-4 flex items-center justify-between gap-6 border border-ink/15 bg-card px-8 py-6 max-[640px]:flex-col max-[640px]:items-start max-[640px]:p-5">
          <h3 className="font-display text-[clamp(24px,2.8vw,38px)] uppercase tracking-[-0.01em] text-ink leading-none">
            Want to sponsor us?
          </h3>
          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center justify-center gap-2.5 bg-red px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-red2 hover:shadow-[0_4px_20px_rgba(200,16,46,0.35)] active:scale-[0.98] max-[640px]:w-full"
          >
            <span>Fill the form</span>
            <span
              className="text-base leading-none transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            >
              &rarr;
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

