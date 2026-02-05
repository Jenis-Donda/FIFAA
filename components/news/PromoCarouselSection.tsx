import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { PromoCarouselResponse } from "@/lib/types";

type PromoCarouselSectionProps = {
  data: PromoCarouselResponse;
  dict: Dictionary;
};

export default function PromoCarouselSection({ data, dict }: PromoCarouselSectionProps) {
  if (!data.items || data.items.length === 0) {
    return null;
  }

  const sectionTitle = data.title || "Featured";
  const seeAllLink = data.seeAllLink || "#";
  const seeAllLabel = data.seeAllLabel || dict.sections.seeAll;

  return (
    <section className="py-14 bg-surface-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl lg:text-2xl font-bold text-navy-950">
            {sectionTitle}
          </h2>
        </div>

        {/* Grid - 3 items per row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.slice(0, 3).map((item) => (
            <Link
              key={item.entryId}
              href={item.readMorePageUrl || "#"}
              target={item.readMoreTarget || "_self"}
              className="block group"
            >
              {/* Image Container - 4:3 aspect ratio */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4">
                <Image
                  src={item.image?.src || "/images/fallback.png"}
                  alt={item.image?.alt || item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                />
              </div>
              {/* Title */}
              <h3 className="text-base lg:text-lg font-medium text-navy-950 line-clamp-2 group-hover:text-brand-blue transition-colors">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

