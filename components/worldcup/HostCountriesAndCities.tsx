"use client";

import CityCard from "./CityCard";
import { hostCountriesData } from "@/lib/hostCitiesData";

export default function HostCountriesAndCities() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
                {hostCountriesData.map((country) => (
                    <div key={country.name} className="mb-12 sm:mb-16 md:mb-20">
                        {/* Country Header */}
                        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide text-gray-500">
                                {country.name}
                            </h2>
                            <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-gray-500"
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
                        </div>

                        {/* Cities Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                            {country.cities.map((city) => (
                                <CityCard
                                    key={city.name}
                                    cityName={city.name}
                                    color={city.color}
                                    textColor={city.textColor}
                                    imageUrl={city.imageUrl}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}