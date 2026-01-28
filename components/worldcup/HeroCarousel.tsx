"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CarouselSlide } from "@/lib/types";
import CountdownTimer from "./CountdownTimer";

type HeroCarouselProps = {
    slides: CarouselSlide[];   autoPlayInterval?: number;
};

function ChevronLeft() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ChevronRight() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function HeroCarousel({
    slides,
    autoPlayInterval = 6000,
}: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
    const [isPaused, setIsPaused] = useState(false);
    const [navStartIndex, setNavStartIndex] = useState(0);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const slideTimeout = useRef<NodeJS.Timeout | null>(null);

    const VISIBLE_NAV_ITEMS = 4;
    const nextIndex = (currentIndex + 1) % slides.length;
    const currentSlide = slides[currentIndex];
    const nextSlide = slides[nextIndex];

    // Get visible navigation items
    const visibleNavItems = slides.slice(navStartIndex, navStartIndex + VISIBLE_NAV_ITEMS);
    const canNavPrev = navStartIndex > 0;
    const canNavNext = navStartIndex + VISIBLE_NAV_ITEMS < slides.length;

    const clearTimers = useCallback(() => {
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
            progressInterval.current = null;
        }
        if (slideTimeout.current) {
            clearTimeout(slideTimeout.current);
            slideTimeout.current = null;
        }
    }, []);

    const goToSlide = useCallback(
        (index: number, direction?: "next" | "prev") => {
            if (isAnimating || index === currentIndex) return;

            clearTimers();
            setIsAnimating(true);
            setSlideDirection(direction || (index > currentIndex ? "next" : "prev"));
            setProgress(0);

            // Update nav position to show current slide
            if (index < navStartIndex) {
                setNavStartIndex(Math.max(0, index));
            } else if (index >= navStartIndex + VISIBLE_NAV_ITEMS) {
                setNavStartIndex(Math.min(slides.length - VISIBLE_NAV_ITEMS, index - VISIBLE_NAV_ITEMS + 1));
            }

            setTimeout(() => {
                setCurrentIndex(index);
                setTimeout(() => {
                    setIsAnimating(false);
                }, 500);
            }, 50);
        },
        [currentIndex, isAnimating, navStartIndex, slides.length, clearTimers]
    );

    const goToNext = useCallback(() => {
        goToSlide(nextIndex, "next");
    }, [goToSlide, nextIndex]);

    const navPrev = () => {
        if (canNavPrev) {
            setNavStartIndex(navStartIndex - 1);
        }
    };

    const navNext = () => {
        if (canNavNext) {
            setNavStartIndex(navStartIndex + 1);
        }
    };

    // Auto-play with progress
    useEffect(() => {
        if (isPaused || isAnimating || slides.length === 0) return;

        const progressStep = 100 / (autoPlayInterval / 50);

        progressInterval.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    return 100;
                }
                return prev + progressStep;
            });
        }, 50);

        slideTimeout.current = setTimeout(() => {
            goToNext();
        }, autoPlayInterval);

        return () => {
            clearTimers();
        };
    }, [currentIndex, isPaused, isAnimating, autoPlayInterval, goToNext, clearTimers, slides.length]);

    // Don't render if no slides
    if (slides.length === 0) {
        return (
            <section className="relative w-full bg-[#d9e8f5] h-[calc(100vh-104px)]">
                <div className="px-4 sm:px-6 lg:px-8 xl:px-12 py-4 lg:py-6 h-full">
                    <div className="relative rounded-2xl overflow-hidden bg-[#1a5694] h-full flex items-center justify-center"></div>
                    <p className="text-white/70">Loading...</p>
                </div>
            </section>
        );
    }

    return (
        <>
        
        <section className="relative w-full bg-[#d9e8f5] h-[calc(100vh-104px)]">
            {/* Main Carousel Container - Full height */}
            <div className="px-4 sm:px-6 lg:px-8 xl:px-12 py-4 lg:py-6 h-full">
                <div
                    className="relative overflow-hidden bg-[#1a5694] h-full flex flex-col"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    
                    {/* Main Content Area - Takes remaining height */}
                    <div className="relative flex flex-col lg:flex-row flex-1 min-h-0">
                        {/* Left Content Panel */}
                        <div className="relative z-10 w-full lg:w-[44%] flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-16 py-8 sm:py-10 lg:py-12">
                            <div
                                className={`transition-all duration-500 ease-out ${isAnimating
                                        ? slideDirection === "next"
                                            ? "opacity-0 -translate-y-4"
                                            : "opacity-0 translate-y-4"
                                        : "opacity-100 translate-y-0"
                                    }`}
                            >
                                {/* Eyebrow */}
                                <p className="text-white/80 text-xs sm:text-sm font-medium tracking-wide mb-4">
                                    {currentSlide.eyebrow}
                                </p>

                                {/* Title */}
                                <h1 className="text-white text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] 2xl:text-5xl font-bold leading-[1.15] mb-5 lg:mb-6 font-display">
                                    {currentSlide.title}
                                </h1>

                                {/* Subtitle */}
                                {currentSlide.subtitle && currentSlide.subtitle.trim() !== "" && (
                                    <p className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed mb-8 lg:mb-10 max-w-lg">
                                        {currentSlide.subtitle}
                                    </p>
                                )}

                                {/* CTA Button */}
                                <Link
                                    href={currentSlide.link}
                                    className="inline-flex items-center px-7 sm:px-8 py-3 bg-white text-[#1a5694] text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:bg-gray-50"
                                >
                                    {currentSlide.cta}
                                </Link>
                            </div>
                        </div>

                        {/* Main Image Area */}
                        <div className="relative w-full lg:w-[56%] flex-1 lg:flex-none min-h-[200px] lg:min-h-0">
                            <div className="absolute inset-0 overflow-hidden">
                                {slides.map((slide, index) => (
                                    <div
                                        key={slide.id}
                                        className={`absolute inset-0 transition-all duration-700 ease-out ${index === currentIndex
                                                ? "opacity-100 scale-100"
                                                : "opacity-0 scale-105"
                                            }`}
                                    >
                                        <Image
                                            src={slide.image}
                                            alt={slide.title}
                                            fill
                                            className="object-cover"
                                            priority={index === 0}
                                            unoptimized
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Next Up Preview Panel - Desktop */}
                            <div
                                className="hidden lg:flex absolute right-0 top-0 bottom-0 w-[180px] xl:w-[200px] 2xl:w-[220px] bg-[#0d3a5c]/90 backdrop-blur-sm flex-col cursor-pointer group z-10"
                                onClick={() => goToSlide(nextIndex, "next")}
                            >
                                {/* Text Section */}
                                <div className="flex-1 flex flex-col justify-center px-5 xl:px-6 py-8">
                                    <span className="text-white/50 text-[11px] uppercase tracking-widest mb-2 font-medium">
                                        Next Up
                                    </span>
                                    <span className="text-white text-sm xl:text-base font-semibold leading-snug">
                                        {nextSlide.category}
                                    </span>
                                </div>

                                {/* Next Slide Preview Image */}
                                <div className="relative h-[180px] xl:h-[220px] 2xl:h-[260px] overflow-hidden flex-shrink-0">
                                    <Image
                                        src={nextSlide.image}
                                        alt={nextSlide.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        unoptimized
                                    />
                                    {/* Hover Arrow Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#1a5694] translate-x-0.5">
                                                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Navigation - Inside the blue card */}
                    <div className="bg-[#0d3a5c] flex-shrink-0">
                        <div className="flex items-stretch">
                            {/* Previous Arrow */}
                            <button
                                onClick={navPrev}
                                disabled={!canNavPrev}
                                className={`w-12 sm:w-14 lg:w-16 flex-shrink-0 flex items-center justify-center transition-colors border-r border-white/10 ${canNavPrev
                                        ? "text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                                        : "text-white/30 cursor-not-allowed"
                                    }`}
                                aria-label="Previous slides"
                            >
                                <ChevronLeft />
                            </button>

                            {/* Navigation Items */}
                            <div className="flex-1 flex">
                                {visibleNavItems.map((slide, idx) => {
                                    const actualIndex = navStartIndex + idx;
                                    const isActive = actualIndex === currentIndex;

                                    return (
                                        <button
                                            key={slide.id}
                                            onClick={() => goToSlide(actualIndex)}
                                            className={`flex-1 text-left px-4 sm:px-5 lg:px-6 py-5 sm:py-6 transition-all duration-300 relative border-r border-white/10 last:border-r-0 ${isActive ? "bg-[#1a5694]" : "hover:bg-white/5"
                                                }`}
                                        >
                                            {/* Eyebrow */}
                                            <p
                                                className={`text-[10px] sm:text-xs font-medium mb-1.5 transition-colors truncate ${isActive ? "text-white/90" : "text-white/60"
                                                    }`}
                                            >
                                                {slide.eyebrow}
                                            </p>

                                            {/* Title */}
                                            <p
                                                className={`text-xs sm:text-sm font-semibold line-clamp-2 transition-colors leading-snug ${isActive ? "text-white" : "text-white/80"
                                                    }`}
                                            >
                                                {slide.title}
                                            </p>

                                            {/* Progress Bar */}
                                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 overflow-hidden">
                                                {isActive ? (
                                                    <div
                                                        className="h-full bg-white transition-[width] duration-100 ease-linear"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                ) : null}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Next Arrow */}
                            <button
                                onClick={navNext}
                                disabled={!canNavNext}
                                className={`w-12 sm:w-14 lg:w-16 flex-shrink-0 flex items-center justify-center transition-colors border-l border-white/10 ${canNavNext
                                        ? "text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                                        : "text-white/30 cursor-not-allowed"
                                    }`}
                                aria-label="Next slides"
                            >
                                <ChevronRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Next Up Indicator */}
            <div className="lg:hidden px-4 sm:px-6 pb-4 absolute bottom-0 left-0 right-0">
                <button
                    onClick={() => goToSlide(nextIndex, "next")}
                    className="flex items-center justify-between w-full bg-[#0d3a5c] text-white rounded-xl px-5 py-4"
                >
                    <div>
                        <span className="text-white/50 text-[10px] uppercase tracking-wider block font-medium">
                            Next Up
                        </span>
                        <span className="text-sm font-semibold">{nextSlide.category}</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <ChevronRight />
                    </div>
                </button>
            </div>
        </section>
        </>
    );
}
