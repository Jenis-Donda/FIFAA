import HeroSlide from "./HeroSlide";
import type { Dictionary } from "@/i18n/dictionaries";

type HeroSlideData = {
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
};

type HeroProps = {
  slides: HeroSlideData[];
  dict: Dictionary;
};

export default function Hero({ slides, dict }: HeroProps) {
  const [primary, ...secondary] = slides;

  return (
    <section className="bg-gradient-to-b from-navy-900 to-navy-700 text-white py-13 pb-10">
      <div className="container-main grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-7">
        <article className="relative rounded-2xl-plus overflow-hidden min-h-[420px] max-lg:min-h-[360px] shadow-soft bg-[#0b1d38]">
          <div
            className="absolute inset-0 bg-cover bg-center saturate-[1.1]"
            style={{ backgroundImage: `url(${primary.image})` }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-[rgba(9,23,46,0.92)] to-[rgba(9,23,46,0.45)]"
            aria-hidden="true"
          />
          <div className="relative z-[1] p-10 max-lg:p-6 flex flex-col h-full justify-end gap-4">
            <div className="text-[0.7rem] uppercase tracking-[0.12em] text-white/60">
              {primary.eyebrow}
            </div>
            <h1 className="font-display text-[2.6rem] tracking-[0.02em] m-0">
              {primary.title}
            </h1>
            <p className="text-base text-white/80 max-w-[26rem]">
              {primary.subtitle}
            </p>
            <a
              className="inline-flex items-center gap-2.5 py-3 px-6 rounded-full bg-brand-blue text-white font-semibold uppercase text-[0.78rem] tracking-[0.08em] w-fit hover:bg-blue-400 transition-colors"
              href="#"
            >
              {dict.hero.secureTickets}
            </a>
          </div>
        </article>
        <div className="grid gap-4" aria-label="Featured highlights">
          {secondary.map((slide) => (
            <HeroSlide
              key={slide.title}
              image={slide.image}
              eyebrow={slide.eyebrow}
              title={slide.title}
              cta={dict.hero.readMore}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
