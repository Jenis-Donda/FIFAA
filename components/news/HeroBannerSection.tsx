"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";

type NewsImage = {
  src: string;
  alt: string;
  title: string;
};

type HeroBannerSectionProps = {
  data: any;
  dict: Dictionary;
  locale: string;
  newsImages?: NewsImage[];
};

export default function HeroBannerSection({ data, dict, locale, newsImages = [] }: HeroBannerSectionProps) {
  // Hero banner structure may vary, adjust based on actual API response
  if (!data) {
    return null;
  }

  // Extract banner data - check multiple possible API response structures
  const bannerImage = 
    data.image?.src || 
    data.heroImage?.src || 
    data.backgroundImage?.src ||
    data.bannerImage?.src ||
    data.media?.src ||
    "";
  
  const bannerTitle = data.title || data.headline || "See all news";
  const bannerDescription = data.description || data.previewText || data.subtitle || "Find all the latest news and interviews from across world football";
  
  // Link to the "all news" page - entryId from FIFA news page
  // The entryId "2lsGSGYOtykcJRJQu7bdDg" is the "all news" section
  const bannerLink = data.readMorePageUrl || data.link || `/${locale}/cat/2lsGSGYOtykcJRJQu7bdDg`;
  const ctaText = data.ctaButtonText || data.ctaText || "Discover";

  // Use news images if available, otherwise fall back to banner image
  const availableImages = newsImages.length > 0 ? newsImages : (bannerImage ? [{ src: bannerImage, alt: bannerTitle, title: bannerTitle }] : []);
  
  // Randomly select an initial image and rotate through them
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (availableImages.length === 0) return;

    // Set initial random image
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    setCurrentImageIndex(randomIndex);

    // Rotate images every 3 seconds without animation
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % availableImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [availableImages.length]);

  const currentImage = availableImages[currentImageIndex];

  // Show banner even if only title/description exists (image might be optional)
  if (!bannerTitle && !bannerDescription) {
    return null;
  }

  return (
    <section className="relative bg-surface-100 overflow-hidden">
      <Link href={bannerLink} className="group block">
        <div className="relative min-h-[500px] lg:min-h-[600px] flex flex-col lg:flex-row">
          {/* Left Content Section */}
          <div className="relative z-10 lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-16 py-12 lg:py-16 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
            <div className="max-w-lg">
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 lg:mb-6 font-display leading-tight">
                {bannerTitle}
              </h2>
              {bannerDescription && (
                <p className="text-lg lg:text-xl text-white/80 mb-6 lg:mb-8 leading-relaxed">
                  {bannerDescription}
                </p>
              )}
              <div className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold uppercase tracking-wide text-sm hover:bg-white hover:text-navy-900 transition-all duration-200">
                {ctaText}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover:translate-x-1"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Image Section - Rotating Images */}
          {currentImage && (
            <div className="relative lg:w-1/2 min-h-[300px] lg:min-h-[600px] overflow-hidden">
              <Image
                key={currentImageIndex}
                src={currentImage.src}
                alt={currentImage.alt || bannerTitle}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                priority={currentImageIndex === 0}
                unoptimized
              />
              {/* Gradient overlay for better text readability if needed */}
              <div className="absolute inset-0 bg-gradient-to-l from-navy-900/20 to-transparent lg:hidden" />
            </div>
          )}
          
          {/* Fallback gradient if no images */}
          {!currentImage && (
            <div className="relative lg:w-1/2 min-h-[300px] lg:min-h-[600px] bg-gradient-to-br from-navy-800 to-navy-900">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
              </div>
            </div>
          )}
        </div>
      </Link>
    </section>
  );
}

