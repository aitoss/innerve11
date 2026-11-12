import "./footer.css";

export default function Footer() {
  return (
    <footer className="foot foot-ichimatsu relative grid grid-cols-[2fr_1fr_1fr] gap-10 border-t border-paper/15 bg-ink px-gut pb-7 pt-[70px] max-[960px]:grid-cols-2 max-[640px]:grid-cols-1">
      <div className="foot__brand max-[960px]:col-span-2 max-[640px]:col-span-1">
        <div className="foot__word font-display leading-[0.9] text-[clamp(48px,7vw,100px)]">
          INNERVE <b className="font-normal text-red">11</b>
        </div>
        <p className="mt-3.5 max-w-[40ch] opacity-70">
          India&apos;s largest student-driven hackathon.
          <br />
          Organised by the OSS Club, Army Institute of Technology, Pune.
        </p>
      </div>
      <div className="foot__col">
        <h4 className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-red">Venue</h4>
        <p className="mb-2.5 opacity-80">
          Army Institute of Technology
          <br />
          Dighi Hills, Pune 411015
        </p>
        <a
          href="https://www.google.com/maps/place/Army+Institute+of+Technology/@18.606926,73.875087,15z/data=!4m6!3m5!1s0x3bc2c70090000001:0x160a20f3d0273495!8m2!3d18.6069264!4d73.8750865!16zL20vMGMxODE0?hl=en&entry=ttu&g_ep=EgoyMDI2MTEwOS4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noopener"
          className="inline-block py-[3px] opacity-[.85] transition-colors hover:text-red"
        >
          Open in Maps ↗
        </a>
        <div className="mt-3.5 w-full max-w-[215px] overflow-hidden rounded-xl border border-paper/20 transition-[border-color] duration-300 hover:border-red">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.332025732297!2d73.87251157585094!3d18.606931466614138!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c70090000001%3A0x160a20f3d0273495!2sArmy%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin"
            width="100%"
            height="160"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Army Institute of Technology Location"
            className="block w-full"
          />
        </div>
      </div>
      <div className="foot__col">
        <h4 className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-red">Navigate</h4>
        <a href="#tracks" data-scroll className="block py-[3px] opacity-[.85] hover:text-red">
          Tracks
        </a>
        <a href="#prizes" data-scroll className="block py-[3px] opacity-[.85] hover:text-red">
          Prizes
        </a>
        <a href="#timeline" data-scroll className="block py-[3px] opacity-[.85] hover:text-red">
          Timeline
        </a>
        <a href="#faq" data-scroll className="block py-[3px] opacity-[.85] hover:text-red">
          FAQ
        </a>
      </div>
      <div className="foot__base col-span-full flex flex-wrap justify-between gap-5 border-t border-paper/10 pt-6 text-xs opacity-60 lg:pr-16 max-lg:pb-12">
        <span>© 2026 Innerve · OSS Club AIT</span>
        <span>
          A fan-made tribute theme. Not affiliated with Demon Slayer, Koyoharu Gotouge or Ufotable. · psst… type{" "}
          <b className="text-red">hinokami</b>
        </span>
      </div>
    </footer>
  );
}

