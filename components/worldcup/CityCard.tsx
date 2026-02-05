"use client";

import { useState } from "react";
import Image from "next/image";

interface CityCardProps {
    cityName: string;
    color: string;
    textColor: string;
    imageUrl?: string;
}

export default function CityCard({ cityName, color, textColor, imageUrl }: CityCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative rounded-lg overflow-hidden p-6 sm:p-8 flex items-center justify-center min-h-[120px] sm:min-h-[140px] hover:scale-105 transition-all duration-300 cursor-pointer shadow-md group"
            style={{ backgroundColor: color, color: textColor }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Image on Hover */}
            {imageUrl && (
                <div
                    className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <Image
                        src={imageUrl}
                        alt={cityName}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
            )}

            {/* City Name */}
            <h3 className="relative z-10 text-xl sm:text-2xl md:text-3xl font-bold text-center">
                {cityName}
            </h3>
        </div>
    );
}