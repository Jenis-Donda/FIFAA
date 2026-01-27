"use client";

import { useState, useRef, useEffect } from "react";

type DateSelectorProps = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
};

function generateDates(centerDate: Date, daysAround: number = 5): Date[] {
  const dates: Date[] = [];
  for (let i = -daysAround; i <= daysAround; i++) {
    const date = new Date(centerDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function formatDate(date: Date, today: Date): { day: string; dateStr: string; isToday: boolean } {
  const isToday = date.toDateString() === today.toDateString();
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return {
    day: isToday ? "TODAY" : dayNames[date.getDay()],
    dateStr: `${date.getDate()} ${months[date.getMonth()]}`,
    isToday,
  };
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const today = new Date();
  const [dates, setDates] = useState<Date[]>(() => generateDates(selectedDate || today, 5));
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Regenerate date window when `selectedDate` changes
  useEffect(() => {
    if (selectedDate) {
      setDates(generateDates(selectedDate, 5));
    }
  }, [selectedDate]);

  // Auto-center the selected date whenever dates or selection change
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const selectedElement = container.querySelector('[data-selected="true"]');
      if (selectedElement) {
        const containerWidth = container.offsetWidth;
        const elementLeft = (selectedElement as HTMLElement).offsetLeft;
        const elementWidth = (selectedElement as HTMLElement).offsetWidth;
        container.scrollLeft = elementLeft - containerWidth / 2 + elementWidth / 2;
      }
    }
  }, [dates, selectedDate]);

  const handlePrev = () => {
    // Add more dates to the beginning
    setDates((prev) => {
      const firstDate = prev[0];
      const newDates: Date[] = [];
      for (let i = 5; i >= 1; i--) {
        const date = new Date(firstDate);
        date.setDate(date.getDate() - i);
        newDates.push(date);
      }
      return [...newDates, ...prev];
    });
  };

  const handleNext = () => {
    // Add more dates to the end
    setDates((prev) => {
      const lastDate = prev[prev.length - 1];
      const newDates: Date[] = [];
      for (let i = 1; i <= 5; i++) {
        const date = new Date(lastDate);
        date.setDate(date.getDate() + i);
        newDates.push(date);
      }
      return [...prev, ...newDates];
    });
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // If we're near the left edge, prepend more dates then scroll to reveal them
    if (container.scrollLeft <= 20) {
      handlePrev();
      requestAnimationFrame(() => {
        // reveal older dates (half the container width)
        container.scrollBy({ left: -container.clientWidth / 2, behavior: "smooth" });
      });
      return;
    }

    container.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // If we're near the right edge, append more dates then scroll to reveal them
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 20) {
      handleNext();
      requestAnimationFrame(() => {
        container.scrollBy({ left: 200, behavior: "smooth" });
      });
      return;
    }

    container.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    <div className="bg-white border-b">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Previous dates"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Date Buttons */}
          <div
            ref={scrollContainerRef}
            className="flex-1 flex justify-center overflow-x-auto scrollbar-hide py-3 gap-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {dates.map((date, index) => {
              const { day, dateStr, isToday } = formatDate(date, today);
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isFirst = index === 0;

              const btnClass = `flex-shrink-0 px-5 py-3 min-w-[120px] text-center transition-all duration-150 ${isSelected
                ? "border-b-2 border-brand-blue text-navy-950 font-semibold bg-white shadow-sm rounded-lg"
                : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-transparent"
                } ${isFirst ? "" : "border-l border-gray-100 pl-4"}`;

              return (
                <button
                  key={index}
                  data-selected={isSelected}
                  onClick={() => onDateChange(date)}
                  className={btnClass}
                >
                  <div className={`text-sm ${isToday ? "font-semibold text-brand-blue" : "font-medium text-gray-600"}`}>{day}</div>
                  <div className="text-base mt-0.5 font-medium text-gray-700">{dateStr}</div>
                </button>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Next dates"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

