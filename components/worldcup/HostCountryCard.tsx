import Image from "next/image";

type Props = {
  country: {
    name: string;
    flag: string;
    stage: string;
    group: string;
    worldRanking: number;
    participations: number;
    color: string;
    textColor: string;
    hostTeam: boolean;
  };
};

export default function HostCountryCard({ country }: Props) {
  return (
    <div className="flex-shrink-0 w-[240px] sm:w-[260px] md:w-[280px] rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      {/* Country Header with Flag */}
      <div 
        className="p-4 sm:p-6 h-32 sm:h-36 flex flex-col justify-between"
        style={{ 
          backgroundColor: country.color,
          color: country.textColor
        }}
      >
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-6 sm:w-10 sm:h-8">
            <Image
              src={country.flag}
              alt={country.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div>
            {country.hostTeam && <div className="text-[10px] sm:text-xs opacity-90 mb-1">Host country</div>}
          <h3 className="text-2xl sm:text-3xl font-bold">{country.name}</h3>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white p-3 sm:p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Stage</span>
          <span className="text-xs sm:text-sm font-semibold">{country.group}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">World Ranking</span>
          <span className="text-lg sm:text-xl font-bold">{country.worldRanking}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Participations</span>
          <span className="text-lg sm:text-xl font-bold">{country.participations}</span>
        </div>
      </div>
    </div>
  );
}