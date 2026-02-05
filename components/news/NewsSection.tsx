import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { NewsResponse } from "@/lib/types";

type NewsSectionProps = {
  data: NewsResponse;
  dict: Dictionary;
  locale?: string;
};

export default function NewsSection({ data, dict, locale = "en" }: NewsSectionProps) {
  if (!data.items || data.items.length === 0) {
    return null;
  }

  // Limit to 10 items: 1 featured + 9 in list
  const limitedItems = data.items.slice(0, 10);
  const [featured, ...rest] = limitedItems;
  const sectionTitle = data.title || "Latest news";
  // Use the entryId to create the seeAllLink path like /en/cat/{entryId}
  const seeAllLink = data.seeAllLink || (data.entryId ? `/${locale}/cat/${data.entryId}` : "#");

  // Layout 3: Featured on left, list on right (like "Latest news")
  // Layout 2: Similar layout (like "Top stories")
  const isLayout3 = data.layout === 3;

  return (
    <section className="py-10 lg:py-14 bg-surface-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-navy-950">
            {sectionTitle}
          </h2>
          {seeAllLink && (
            <Link
              href={seeAllLink}
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
          )}
        </div>

        {/* Main Content Grid - Matching FIFA layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Left Column - Featured Story (50% width) */}
          <div className="lg:w-1/2 lg:sticky lg:top-28 lg:self-start">
            <Link href={featured.articlePageUrl || "#"} className="group block">
              {/* Featured Image - Larger, more prominent */}
              <div className="relative aspect-[16/9] lg:aspect-[4/3] rounded-xl overflow-hidden mb-5">
                <Image
                  src={featured.image?.src || "/images/fallback.png"}
                  alt={featured.image?.alt || featured.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>

              {/* Featured Content */}
              <div className="space-y-3">
                {/* Roofline - Smaller, uppercase, blue */}
                {featured.roofline && (
                  <p className="text-brand-blue text-xs font-semibold uppercase tracking-wider mb-1">
                    {featured.roofline}
                  </p>
                )}

                {/* Title - Larger, bold */}
                <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold text-navy-950 leading-tight group-hover:text-brand-blue transition-colors">
                  {featured.title}
                </h3>

                {/* Summary - If available */}
                {featured.previewText && (
                  <p className="text-content-secondary text-base lg:text-lg leading-relaxed line-clamp-3 mt-2">
                    {featured.previewText}
                  </p>
                )}
              </div>
            </Link>
          </div>

          {/* Right Column - Story List (50% width) */}
          <div className="lg:w-1/2 space-y-5">
            {rest.map((story) => (
              <Link
                key={story.entryId}
                href={story.articlePageUrl || "#"}
                className="group flex gap-4 items-start"
              >
                {/* Thumbnail - Square, smaller */}
                <div className="relative w-[100px] sm:w-[120px] h-[100px] sm:h-[120px] flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={story.image?.src || "/images/fallback.png"}
                    alt={story.image?.alt || story.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  {/* Roofline - Very small, uppercase, blue */}
                  {story.roofline && (
                    <p className="text-brand-blue text-[10px] sm:text-xs font-semibold mb-1.5 uppercase tracking-wider truncate">
                      {story.roofline}
                    </p>
                  )}

                  {/* Title - Bold, darker */}
                  <h4 className="text-sm sm:text-base font-bold text-navy-950 leading-snug line-clamp-2 group-hover:text-brand-blue transition-colors">
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

