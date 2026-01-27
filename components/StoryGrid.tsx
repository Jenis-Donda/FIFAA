import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Story } from "@/lib/types";

type StoryGridProps = {
  stories: Story[];
  dict: Dictionary;
};

export default function StoryGrid({ stories, dict }: StoryGridProps) {
  if (stories.length === 0) {
    return null;
  }

  const [featured, ...rest] = stories;

  return (
    <section className="py-10 lg:py-14 bg-surface-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-navy-950">
            {dict.sections.topStories}
          </h2>
          <Link
            href="#"
            className="flex items-center gap-2 text-brand-blue font-semibold text-sm hover:underline group"
          >
            {dict.sections.seeAll}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              <path
                d="M9 6L15 12L9 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column - Featured Story (Sticky) */}
          <div className="lg:w-1/2 xl:w-[55%] lg:sticky lg:top-28 lg:self-start">
            <Link href={featured.link} className="group block">
              {/* Featured Image */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>

              {/* Featured Content */}
              <div className="space-y-3">
                {/* Roofline */}
                <p className="text-brand-blue text-sm font-semibold">
                  {featured.eyebrow}
                </p>

                {/* Title */}
                <h3 className="text-xl lg:text-2xl font-bold text-navy-950 leading-tight group-hover:text-brand-blue transition-colors">
                  {featured.title}
                </h3>

                {/* Summary */}
                {featured.summary && (
                  <p className="text-content-secondary text-base leading-relaxed line-clamp-3">
                    {featured.summary}
                  </p>
                )}
              </div>
            </Link>
          </div>

          {/* Right Column - Story List (Scrollable) */}
          <div className="lg:w-1/2 xl:w-[45%] space-y-5">
            {rest.map((story) => (
              <Link
                key={story.id}
                href={story.link}
                className="group flex gap-4 items-start"
              >
                {/* Thumbnail */}
                <div className="relative w-[140px] sm:w-[160px] h-[90px] sm:h-[100px] flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-1">
                  {/* Roofline */}
                  <p className="text-brand-blue text-xs font-semibold mb-1.5 truncate">
                    {story.eyebrow}
                  </p>

                  {/* Title */}
                  <h4 className="text-base font-bold text-navy-950 leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">
                    {story.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
