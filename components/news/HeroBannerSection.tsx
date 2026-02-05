import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";

type HeroBannerSectionProps = {
  data: any;
  dict: Dictionary;
};

export default function HeroBannerSection({ data, dict }: HeroBannerSectionProps) {
  // Hero banner structure may vary, adjust based on actual API response
  if (!data) {
    return null;
  }

  // Extract banner data - adjust based on actual API structure
  const bannerImage = data.image?.src || data.heroImage?.src;
  const bannerTitle = data.title || "";
  const bannerLink = data.readMorePageUrl || data.link || "#";
  const bannerDescription = data.description || data.previewText || "";

  if (!bannerImage && !bannerTitle) {
    return null;
  }

  return (
    <section className="py-10 lg:py-14 bg-surface-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <Link href={bannerLink} className="group block">
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden">
            {bannerImage && (
              <Image
                src={bannerImage}
                alt={bannerTitle || "Hero banner"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
            )}
            {(bannerTitle || bannerDescription) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end">
                <div className="p-6 lg:p-10 text-white">
                  {bannerTitle && (
                    <h2 className="text-2xl lg:text-4xl font-bold mb-3">
                      {bannerTitle}
                    </h2>
                  )}
                  {bannerDescription && (
                    <p className="text-lg opacity-90 line-clamp-2">
                      {bannerDescription}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>
    </section>
  );
}

