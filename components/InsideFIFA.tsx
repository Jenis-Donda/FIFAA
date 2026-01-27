"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { InsideFIFAData } from "@/lib/types";

type InsideFIFAProps = {
  data: InsideFIFAData;
};

export default function InsideFIFA({ data }: InsideFIFAProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive items per page
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const maxIndex = Math.max(0, data.items.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  if (!data.items.length) {
    return null;
  }

  return (
    <section className="py-14 bg-surface-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl lg:text-2xl font-bold text-navy-950">
            {data.title}
          </h2>
          <Link
            href={data.seeAllLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-brand-blue font-medium hover:underline transition-colors"
          >
            {data.seeAllLabel}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div ref={containerRef} className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              }}
            >
              {data.items.map((item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / itemsPerPage}%` }}
                >
                  <Link
                    href={item.link}
                    target={item.target}
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    {/* Title */}
                    <h3 className="text-base lg:text-lg font-medium text-navy-950 line-clamp-2 group-hover:text-brand-blue transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows - Bottom Right */}
          <div className="flex items-center justify-end gap-2 mt-6">
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                canGoPrev
                  ? "border-gray-300 text-gray-600 hover:border-brand-blue hover:text-brand-blue"
                  : "border-gray-200 text-gray-300 cursor-not-allowed"
              }`}
              aria-label="Previous items"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                canGoNext
                  ? "border-gray-300 text-gray-600 hover:border-brand-blue hover:text-brand-blue"
                  : "border-gray-200 text-gray-300 cursor-not-allowed"
              }`}
              aria-label="Next items"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

