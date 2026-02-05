"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PromoCarouselProps {
    carouselData: any;
}

export default function PromoCarousel({ carouselData }: PromoCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    console.log("Promo Carousel Data:", JSON.stringify(carouselData, null, 2));

    if (!carouselData?.items || carouselData.items.length === 0) {
        return null;
    }

    const items = carouselData.items;

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.offsetWidth;
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === "right" ? scrollAmount : -scrollAmount);
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: "smooth",
            });

            const newIndex = direction === "right"
                ? Math.min(currentIndex + 1, items.length - 1)
                : Math.max(currentIndex - 1, 0);
            setCurrentIndex(newIndex);
        }
    };

    return (
        <section className="py-8 sm:py-10 md:py-12 bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation Arrows */}
                <div className="flex justify-end gap-2 mb-4">
                    <button
                        onClick={() => scroll("left")}
                        disabled={currentIndex === 0}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        disabled={currentIndex === items.length - 1}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Carousel */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {items.map((item: any, index: number) => {
                        // Try multiple possible image URL paths
                        const imageUrl = item.image?.url ||
                            item.imageUrl ||
                            item.image?.src ||
                            item.backgroundImage?.url ||
                            item.media?.url ||
                            item.picture?.url;

                        const title = item.title || item.headline || item.name;
                        const description = item.description || item.summary || item.text;
                        const link = item.link?.url || item.url || item.href || "#";

                        console.log(`Item ${index}:`, { imageUrl, title, description, link });

                        return (
                            <Link
                                key={index}
                                href={link}
                                className="flex-shrink-0 w-full snap-start group"
                            >
                                <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-lg overflow-hidden bg-gray-900">
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt={title || "Promo"}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white">
                                            <p>No Image Available</p>
                                        </div>
                                    )}

                                    {/* Overlay Content */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-8 md:p-10">
                                        {title && (
                                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
                                                {title}
                                            </h3>
                                        )}
                                        {description && (
                                            <p className="text-sm sm:text-base text-white/90 max-w-2xl line-clamp-2">
                                                {description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}