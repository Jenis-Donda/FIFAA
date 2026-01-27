import Image from "next/image";

type StoryCardProps = {
  eyebrow: string;
  title: string;
  summary?: string;
  image: string;
  variant?: "featured" | "compact";
  readMoreLabel?: string;
};

export default function StoryCard({
  eyebrow,
  title,
  summary,
  image,
  variant = "compact",
  readMoreLabel = "Read more",
}: StoryCardProps) {
  if (variant === "featured") {
    return (
      <article className="bg-white rounded-2xl-plus shadow-soft overflow-hidden grid grid-rows-[260px_1fr]">
        <Image
          src={image}
          alt={title}
          width={960}
          height={540}
          className="w-full h-full object-cover"
        />
        <div className="p-6 px-7 grid gap-3">
          <div className="text-[0.7rem] uppercase tracking-[0.12em] text-content-muted">
            {eyebrow}
          </div>
          <h3 className="m-0 text-2xl text-navy-900">{title}</h3>
          <p className="m-0 text-content-secondary">{summary}</p>
          <a
            className="text-brand-blue font-semibold text-sm uppercase tracking-[0.1em]"
            href="#"
          >
            {readMoreLabel}
          </a>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-2xl p-4 grid grid-cols-[92px_1fr] gap-4 shadow-card">
      <Image src={image} alt={title} width={120} height={120} className="rounded-xl" />
      <div>
        <div className="text-[0.7rem] uppercase tracking-[0.12em] text-content-muted">
          {eyebrow}
        </div>
        <h4 className="my-1.5 text-base">{title}</h4>
        <a
          className="text-brand-blue font-semibold text-sm uppercase tracking-[0.1em]"
          href="#"
        >
          {readMoreLabel}
        </a>
      </div>
    </article>
  );
}
