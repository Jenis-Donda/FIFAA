"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type CountdownTimerProps = {
  targetDate: Date;
  title: string;
  subtitle: string;
  logo?: string;
  ctaText?: string;
  ctaLink?: string;
};

export default function CountdownTimer({
  targetDate,
  title,
  subtitle,
  logo,
  ctaText = "View matches",
  ctaLink = "#",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="bg-gradient-to-r from-[#0033A0] to-[#0055CC] text-white py-4 px-4">
        <div className="max-w-[1440px] mx-auto h-16" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#0033A0] to-[#0055CC] text-white py-4 px-4 shadow-md">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-3">
            {logo && (
              <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                <Image
                  src={logo}
                  alt={title}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <h2 className="text-base md:text-lg font-bold leading-tight">
                {title}
              </h2>
              <p className="text-xs md:text-sm text-white/90">{subtitle}</p>
            </div>
          </div>

          {/* Right: Countdown + CTA Button */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Countdown */}
            <div className="flex items-center gap-2 md:gap-4">
              <TimeUnit value={timeLeft.days} label="days" />
              <TimeUnit value={timeLeft.hours} label="hours" />
              <TimeUnit value={timeLeft.mins} label="mins" />
              <TimeUnit value={timeLeft.secs} label="secs" />
            </div>

            {/* CTA Button */}
            <a
              href={ctaLink}
              className="bg-white text-[#0033A0] px-5 py-2 rounded-full font-semibold text-sm hover:bg-gray-100 transition-all hover:scale-105 whitespace-nowrap shadow-md"
            >
              {ctaText}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold tabular-nums leading-none">
        {value.toString().padStart(2, "0")}
      </div>
      <div className="text-[10px] md:text-xs text-white/80 mt-0.5 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}