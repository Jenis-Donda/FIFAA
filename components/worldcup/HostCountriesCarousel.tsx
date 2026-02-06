"use client";

import { useRef } from "react";
import HostCountryCard from "./HostCountryCard";

type Props = {
  countries: any[];
};

function ChevronLeft() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HostCountriesCarousel({ countries }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === "right" ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  if (countries.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-10 md:py-12 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-4">
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
              aria-label="Scroll left"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
              aria-label="Scroll right"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {countries.map((country, index) => (
            <HostCountryCard key={index} country={country} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}