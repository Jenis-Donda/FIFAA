import Image from "next/image";

type HeroSlideProps = {
  image: string;
  eyebrow: string;
  title: string;
  cta: string;
};

export default function HeroSlide({ image, eyebrow, title, cta }: HeroSlideProps) {
  return (
    <article className="grid grid-cols-[120px_1fr] gap-4 bg-white/[0.06] p-4 rounded-2xl border border-white/[0.12]">
      <Image src={image} alt={title} width={120} height={90} className="rounded-xl" />
      <div>
        <div className="text-[0.7rem] uppercase tracking-[0.12em] text-white/60">
          {eyebrow}
        </div>
        <h3 className="mt-1.5 mb-1.5 text-[1.05rem] font-semibold">
          {title}
        </h3>
        <a
          className="text-brand-blue font-semibold text-sm uppercase tracking-[0.1em]"
          href="#"
        >
          {cta}
        </a>
      </div>
    </article>
  );
}
