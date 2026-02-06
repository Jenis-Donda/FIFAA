"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Match } from "@/lib/types";

type Props = {
  match: Match;
};

export default function WorldCupMatchCard({ match }: Props) {
  const [homeLogoError, setHomeLogoError] = useState(false);
  const [awayLogoError, setAwayLogoError] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const showTimeBetweenTeams = match.status !== "scheduled";

  const matchUrl = `/en/match-centre/match/${match.idCompetition}/${match.idSeason}/${match.idStage}/${match.idMatch}`;

  return (
    <Link href={matchUrl} className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer block">
      {/* Header */}
      <div className="bg-gray-50 px-3 sm:px-4 py-2 border-b">
        <div className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase truncate">
          {match.seasonName || "FIFA World Cup 2026™"}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">
          {match.competition} · {match.venue || "Stadium TBD"}
        </div>
      </div>

      {/* Match Content */}
      <div className="p-3 sm:p-4">
        {/* Teams */}
        <div className="space-y-2 sm:space-y-3">
          {/* Home Team */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
                {match.homeTeamLogo && !homeLogoError ? (
                  <Image
                    src={match.homeTeamLogo}
                    alt={match.homeTeam}
                    fill
                    className="object-contain"
                    onError={() => setHomeLogoError(true)}
                  />
                ) : (
                  <Image
                    src="/images/fallback.png"
                    alt={match.homeTeam}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
              <span className="font-semibold text-xs sm:text-sm truncate">
                {match.homeTeam}
              </span>
            </div>
            {match.homeScore !== null && match.homeScore !== undefined && (
              <span className="text-xl sm:text-2xl font-bold ml-2 flex-shrink-0">
                {match.homeScore}
              </span>
            )}
          </div>

          {/* Time between teams (for live/finished matches) */}
          {showTimeBetweenTeams && (
            <div className="flex items-center justify-center py-1">
              <span className="text-xs sm:text-sm font-bold text-gray-700">
                {match.time}
              </span>
            </div>
          )}

          {/* Away Team */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
                {match.awayTeamLogo && !awayLogoError ? (
                  <Image
                    src={match.awayTeamLogo}
                    alt={match.awayTeam}
                    fill
                    className="object-contain"
                    onError={() => setAwayLogoError(true)}
                  />
                ) : (
                  <Image
                    src="/images/fallback.png"
                    alt={match.awayTeam}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
              <span className="font-semibold text-xs sm:text-sm truncate">
                {match.awayTeam}
              </span>
            </div>
            {match.awayScore !== null && match.awayScore !== undefined && (
              <span className="text-xl sm:text-2xl font-bold ml-2 flex-shrink-0">
                {match.awayScore}
              </span>
            )}
          </div>
        </div>

        {/* Match Info - Only show for scheduled matches */}
        {!showTimeBetweenTeams && (
          <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t flex items-center justify-between">
            <div className="text-[10px] sm:text-xs text-gray-600">
              {formatDate(match.date)}
            </div>
            <div className="text-base sm:text-xl font-bold text-gray-900">
              {match.time}
            </div>
          </div>
        )}

        {/* Match Info - For live/finished matches show only date */}
        {showTimeBetweenTeams && (
          <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t text-center">
            <div className="text-[10px] sm:text-xs text-gray-600">
              {formatDate(match.date)}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}