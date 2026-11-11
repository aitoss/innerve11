import { TESTIMONIALS } from "@/data/testimonials";

export default function Testimonials() {
  return (
    <section
      id="voices"
      data-tone="light"
      data-name="Survivors"
      className="voices paper paper-grain pb-[clamp(40px,6vw,80px)] pt-[clamp(80px,10vw,150px)]"
    >
      <div className="wrap mx-auto w-[min(1320px,100%)] px-gut">
        <div className="eyebrow mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] opacity-80">
          <span className="h-0.5 w-7 bg-red" aria-hidden="true" />
          Testimonials
        </div>
        <h2 className="sec-title font-display uppercase leading-[0.9] tracking-[-0.01em] text-[clamp(48px,9vw,150px)]">
          Words from the <em>survivors.</em>
        </h2>
        <div id="vgrid" className="vgrid mt-[clamp(32px,5vw,60px)] grid grid-cols-3 gap-5 max-[960px]:grid-cols-1">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="vcard relative flex flex-col border border-ink/15 bg-card p-[34px_28px_28px]">
              <span aria-hidden="true" className="h-[44px] font-display text-[110px] leading-[0.6] text-red">
                &ldquo;
              </span>
              <blockquote className="flex-1 text-[15.5px]">{t.quote}</blockquote>
              <figcaption className="vcard__who mt-[26px] flex items-center gap-3.5 border-t border-ink/15 pt-[18px]">
                <span
                  aria-hidden="true"
                  className="hanko grid h-[46px] w-[46px] flex-none rotate-[-6deg] place-items-center rounded-md border-2 border-red font-display text-lg text-red"
                >
                  {t.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
                <span>
                  <b className="block text-[15px]">{t.name}</b>
                  <span className="text-xs opacity-[.65]">{t.org}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

