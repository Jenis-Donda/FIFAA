"use client";

import Image from "next/image";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/* Spinning Football Image */}
        <div className="relative w-24 h-24">
          <Image
            src="/images/loader.jpg"
            alt="Loading"
            width={96}
            height={96}
            className="animate-spin"
            style={{ animationDuration: '1s' }}
            priority
            unoptimized
          />
        </div>
        
        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-base font-bold text-[#1a5694] uppercase tracking-wider">
            Loading
          </p>
          {/* Animated dots */}
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-[#1a5694] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-[#00b8ff] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#1a5694] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

