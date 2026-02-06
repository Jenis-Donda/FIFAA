"use client";

import type { Standing } from "@/lib/types";

type StandingsPanelProps = {
  standings: Standing[];
  competition: string | null;
  competitionLogo?: string;
  isLoading?: boolean;
  onShowTable: () => void;
};

// Sample standings data when no API data is available
const sampleStandings: Standing[] = [
  { position: 1, team: "Arsenal", teamAbbr: "ARS", played: 22, won: 15, drawn: 5, lost: 2, goalsFor: 45, goalsAgainst: 18, goalDiff: 27, points: 50 },
  { position: 2, team: "Manchester City", teamAbbr: "MCI", played: 23, won: 14, drawn: 4, lost: 5, goalsFor: 52, goalsAgainst: 24, goalDiff: 28, points: 46 },
  { position: 3, team: "Aston Villa", teamAbbr: "AVL", played: 22, won: 13, drawn: 4, lost: 5, goalsFor: 48, goalsAgainst: 32, goalDiff: 16, points: 43 },
  { position: 4, team: "Liverpool", teamAbbr: "LIV", played: 23, won: 10, drawn: 6, lost: 7, goalsFor: 38, goalsAgainst: 28, goalDiff: 10, points: 36 },
];

function StandingsSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b">
              <th className="px-3 py-2 text-left font-medium">Pos</th>
              <th className="px-3 py-2 text-left font-medium">Team</th>
              <th className="px-3 py-2 text-center font-medium">P</th>
              <th className="px-3 py-2 text-center font-medium">W</th>
              <th className="px-3 py-2 text-center font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4].map((i) => (
              <tr key={i} className="border-b border-gray-50 last:border-b-0">
                <td className="px-3 py-3">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mx-auto" />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse" />
                    <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="w-6 h-4 bg-gray-200 rounded animate-pulse mx-auto" />
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="w-6 h-4 bg-gray-200 rounded animate-pulse mx-auto" />
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="w-8 h-4 bg-gray-200 rounded animate-pulse mx-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Skeleton */}
      <div className="px-4 py-3 border-t bg-gray-50">
        <div className="w-full h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function StandingsPanel({
  standings,
  competition,
  competitionLogo,
  isLoading = false,
  onShowTable,
}: StandingsPanelProps) {
  const displayStandings = standings.length > 0 ? standings.slice(0, 4) : [];
  const displayCompetition = competition || "Competition";

  if (isLoading) {
    return <StandingsSkeleton />;
  }

  if (displayStandings.length === 0) {
    return null; // Don't show panel if no standings
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          {/* Competition Logo */}
          {competitionLogo ? (
            <img
              src={competitionLogo}
              alt={displayCompetition}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement | null;
                if (target) target.src = "/images/fallback.png";
              }}
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {displayCompetition.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onShowTable}
          className="text-xs text-gray-500 hover:text-brand-blue transition-colors"
        >
          Show table
        </button>
      </div>

      {/* Standings Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b">
              <th className="px-3 py-2 text-left font-medium">Pos</th>
              <th className="px-3 py-2 text-left font-medium">Team</th>
              <th className="px-3 py-2 text-center font-medium">P</th>
              <th className="px-3 py-2 text-center font-medium">W</th>
              <th className="px-3 py-2 text-center font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {displayStandings.map((row) => (
              <tr
                key={row.position}
                className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <td className="px-3 py-3 text-gray-900 font-medium">{row.position}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    {row.teamLogo ? (
                      <img
                        src={row.teamLogo}
                        alt={row.team}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement | null;
                          if (target) target.src = "/images/fallback.png";
                        }}
                      />
                    ) : (
                      <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-[8px] font-bold text-gray-500">
                        {row.teamAbbr.substring(0, 2)}
                      </div>
                    )}
                    <span className="text-gray-900 font-medium truncate max-w-[100px]">
                      {row.team}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center text-gray-600">{row.played}</td>
                <td className="px-3 py-3 text-center text-gray-600">{row.won}</td>
                <td className="px-3 py-3 text-center font-semibold text-gray-900">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Full table link removed per request */}
    </div>
  );
}

