"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NewsResponse } from "@/lib/types";

type NewsListingClientProps = {
  newsData: NewsResponse;
  locale: string;
};

const ITEMS_PER_PAGE = 20;

export default function NewsListingClient({ newsData, locale }: NewsListingClientProps) {
  const [displayedItems, setDisplayedItems] = useState<number>(ITEMS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = () => {
    setLoadingMore(true);
    // Simulate loading delay
    setTimeout(() => {
      setDisplayedItems((prev) => prev + ITEMS_PER_PAGE);
      setLoadingMore(false);
    }, 300);
  };

  const itemsToShow = newsData.items.slice(0, displayedItems);
  const hasMore = displayedItems < newsData.items.length;
  const sectionTitle = newsData.title || "Latest news";

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      {/* Back Button */}
      <Link
        href={`/${locale}/news`}
        className="inline-flex items-center gap-2 text-brand-blue font-medium mb-8 hover:underline group"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200 group-hover:-translate-x-1"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Section Title */}
      <h1 className="text-3xl lg:text-4xl font-bold text-navy-950 mb-10">
        {sectionTitle}
      </h1>

      {/* News Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {itemsToShow.map((item) => (
          <Link
            key={item.entryId}
            href={item.articlePageUrl || "#"}
            className="group block"
          >
            <article className="h-full flex flex-col">
              {/* Image */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                <Image
                  src={item.image?.src || "/images/fallback.png"}
                  alt={item.image?.alt || item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                {/* Roofline */}
                {item.roofline && (
                  <p className="text-brand-blue text-xs font-semibold uppercase tracking-wider mb-2">
                    {item.roofline}
                  </p>
                )}

                {/* Title */}
                <h3 className="text-base lg:text-lg font-bold text-navy-950 leading-snug line-clamp-3 group-hover:text-brand-blue transition-colors">
                  {item.title}
                </h3>

                {/* Preview Text */}
                {item.previewText && (
                  <p className="text-content-secondary text-sm leading-relaxed line-clamp-2 mt-2">
                    {item.previewText}
                  </p>
                )}
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-8 py-3 bg-brand-blue text-white font-semibold rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </>
            ) : (
              <>
                Load more
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

