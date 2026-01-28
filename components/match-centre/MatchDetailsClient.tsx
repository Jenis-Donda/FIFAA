"use client";

import { useState, useEffect } from "react";
import { fetchMatchDetails } from "@/lib/api";
import type { MatchAPIItem } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries";

type MatchDetailsClientProps = {
  locale: string;
  dict: Dictionary;
  idCompetition: string;
  idSeason: string;
  idStage: string;
  idMatch: string;
};

type TeamNameLocale = {
  Locale: string;
  Description: string;
};

/**
 * Get team name from TeamNameLocale array
 */
function getTeamName(names: TeamNameLocale[], preferredLocale: string = "en-GB"): string {
  if (!names || names.length === 0) return "Unknown";
  const localized = names.find((n) => n.Locale === preferredLocale);
  return localized?.Description || names[0]?.Description || "Unknown";
}

/**
 * Format team logo URL - using teams-sq-4 for high quality
 */
function formatTeamLogo(teamId?: string): string | undefined {
  if (!teamId) return undefined;
  return `https://api.fifa.com/api/v3/picture/teams-sq-4/${teamId}`;
}

/**
 * Format competition logo URL
 */
function formatCompetitionLogo(competitionId?: string): string | undefined {
  if (!competitionId) return undefined;
  return `https://api.fifa.com/api/v3/picture/competitions-sq-4/${competitionId}`;
}

/**
 * Get match status from numeric status code
 */
function getMatchStatus(status: number): "scheduled" | "live" | "finished" {
  if (status === 0) return "scheduled";
  if (status === 3 || status === 4) return "live";
  if (status >= 10) return "finished";
  return "scheduled";
}

/**
 * Format date for display (e.g., "27 JAN 2026")
 */
function formatMatchDate(dateString: string, locale: string = "en"): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === "en" ? "en-GB" : locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).toUpperCase();
  } catch {
    return dateString;
  }
}

/**
 * Format time for display (e.g., "00:00")
 */
function formatMatchTime(dateString: string, locale: string = "en"): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale === "en" ? "en-GB" : locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "00:00";
  }
}

export default function MatchDetailsClient({
  locale,
  dict,
  idCompetition,
  idSeason,
  idStage,
  idMatch,
}: MatchDetailsClientProps) {
  const [match, setMatch] = useState<MatchAPIItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "lineup" | "stats" | "table" | "related">("stats");

  useEffect(() => {
    const loadMatchDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const matchData = await fetchMatchDetails(
          idCompetition,
          idSeason,
          idStage,
          idMatch,
          locale
        );

        if (matchData) {
          console.log("Match data received:", matchData);
          setMatch(matchData);
        } else {
          console.error("No match data returned from API");
          setError("Match not found");
        }
      } catch (err) {
        console.error("Error loading match details:", err);
        setError("Failed to load match details");
      } finally {
        setIsLoading(false);
      }
    };

    loadMatchDetails();
  }, [idCompetition, idSeason, idStage, idMatch, locale]);

  if (isLoading) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fifa-header mx-auto mb-4"></div>
          <p className="text-gray-600">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-navy-950 mb-2">
            {error || "Match not found"}
          </h3>
          <p className="text-gray-500">
            {error || "The match you're looking for doesn't exist or has been removed."}
          </p>
        </div>
      </div>
    );
  }

  const matchStatus = getMatchStatus(match.MatchStatus);
  const isLive = matchStatus === "live";
  const isFinished = matchStatus === "finished";

  const homeTeamName = match.Home?.TeamName
    ? getTeamName(match.Home.TeamName, locale === "en" ? "en-GB" : locale)
    : match.Home?.ShortClubName || "TBD";
  const awayTeamName = match.Away?.TeamName
    ? getTeamName(match.Away.TeamName, locale === "en" ? "en-GB" : locale)
    : match.Away?.ShortClubName || "TBD";

  const competitionName = match.CompetitionName && match.CompetitionName.length > 0
    ? getTeamName(match.CompetitionName, locale === "en" ? "en-GB" : locale)
    : match.StageName && match.StageName.length > 0
      ? getTeamName(match.StageName, locale === "en" ? "en-GB" : locale)
      : "Competition";

  const stageName = match.StageName && match.StageName.length > 0
    ? getTeamName(match.StageName, locale === "en" ? "en-GB" : locale)
    : "Regular Season";

  const venue = match.Stadium?.Name && match.Stadium.Name.length > 0
    ? getTeamName(match.Stadium.Name, locale === "en" ? "en-GB" : locale)
    : undefined;

  const city = match.Stadium?.CityName && match.Stadium.CityName.length > 0
    ? getTeamName(match.Stadium.CityName, locale === "en" ? "en-GB" : locale)
    : undefined;

  const matchDate = formatMatchDate(match.Date, locale);
  const matchTime = formatMatchTime(match.Date, locale);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section - Match Summary */}
        <div className="mb-8">
          {/* Competition Logo - Centered */}
          <div className="flex justify-center mb-6">
            {match.IdCompetition && (
              <img
                src={formatCompetitionLogo(match.IdCompetition)}
                alt={competitionName}
                className="h-16 w-16 object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement | null;
                  if (target) target.style.display = "none";
                }}
              />
            )}
          </div>

          {/* Stage Name (left) and Date/Time (right) */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-sm font-medium text-gray-600">{stageName}</span>
            <span className="text-sm font-medium text-gray-600">
              {matchTime} • {matchDate}
            </span>
          </div>

          {/* Match Scoreboard */}
          <div className="flex items-center justify-between mb-6 px-4">
            {/* Home Team - Name on left, Logo on right */}
            <div className="flex-1 flex items-center gap-6">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-navy-950">{homeTeamName}</h2>
              </div>
              {match.Home?.IdTeam && (
                <img
                  src={formatTeamLogo(match.Home.IdTeam)}
                  alt={homeTeamName}
                  className="w-24 h-24 lg:w-28 lg:h-28 object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement | null;
                    if (target) target.src = "/images/fallback.png";
                  }}
                />
              )}
            </div>

            {/* Score */}
            <div className="mx-8 lg:mx-16 text-center">
              <div className="flex items-center gap-5 lg:gap-6 mb-4">
                <span className="text-6xl lg:text-7xl font-bold text-navy-950">
                  {match.HomeTeamScore ?? match.Home?.Score ?? 0}
                </span>
                <span className="text-4xl lg:text-5xl text-gray-400">-</span>
                <span className="text-6xl lg:text-7xl font-bold text-navy-950">
                  {match.AwayTeamScore ?? match.Away?.Score ?? 0}
                </span>
              </div>
              {isFinished && (
                <button className="bg-blue-600 text-white px-8 py-2.5 rounded-md text-sm font-semibold">
                  Full Time
                </button>
              )}
              {isLive && (
                <button className="bg-red-600 text-white px-8 py-2.5 rounded-md text-sm font-semibold animate-pulse">
                  LIVE {match.MatchTime || ""}
                </button>
              )}
              {matchStatus === "scheduled" && (
                <div className="text-lg font-semibold text-gray-500">
                  {matchTime}
                </div>
              )}
            </div>

            {/* Away Team - Logo on left, Name on right */}
            <div className="flex-1 flex items-center gap-6 justify-end">
              {match.Away?.IdTeam && (
                <img
                  src={formatTeamLogo(match.Away.IdTeam)}
                  alt={awayTeamName}
                  className="w-24 h-24 lg:w-28 lg:h-28 object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement | null;
                    if (target) target.src = "/images/fallback.png";
                  }}
                />
              )}
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-navy-950">{awayTeamName}</h2>
              </div>
            </div>
          </div>

          {/* Match Info - Better formatted to match FIFA */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2">
              <span className="text-base font-medium text-gray-700">{competitionName}</span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {city && <span>{city}</span>}
                {city && venue && <span className="text-gray-400">•</span>}
                {venue && <span>({venue})</span>}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-8 border-b border-gray-200">
            {[
              { id: "overview", label: "OVERVIEW" },
              { id: "lineup", label: "LINE UP" },
              { id: "stats", label: "STATS" },
              { id: "table", label: "TABLE" },
              { id: "related", label: "RELATED MATCHES" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`pb-4 px-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-8">
          {activeTab === "overview" && (
            <div className="text-center py-12">
              <p className="text-gray-600">Overview information will be displayed here</p>
            </div>
          )}

          {activeTab === "lineup" && (
            <div className="text-center py-12">
              <p className="text-gray-600">Line up information will be displayed here</p>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-12">
              {/* Head to Head Section */}
              <div>
                <h3 className="text-2xl font-bold text-navy-950 text-center mb-10">Head to Head</h3>
                <div className="flex items-center justify-center gap-16 lg:gap-20">
                  {/* Home Team Stats */}
                  <div className="flex items-center gap-5">
                    {match.Home?.IdTeam && (
                      <img
                        src={formatTeamLogo(match.Home.IdTeam)}
                        alt={homeTeamName}
                        className="w-16 h-16 object-contain"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement | null;
                          if (target) target.src = "/images/fallback.png";
                        }}
                      />
                    )}
                    <div>
                      <p className="text-xl font-bold text-navy-950">{homeTeamName}</p>
                      <p className="text-sm text-gray-600 mt-1">3 wins</p>
                    </div>
                  </div>

                  {/* Center Stats - Total Matches and Draws */}
                  <div className="text-center">
                    <p className="text-4xl lg:text-5xl font-semibold text-gray-700 mb-1">5</p>
                    <p className="text-sm text-gray-600">Draws: 1</p>
                  </div>

                  {/* Away Team Stats */}
                  <div className="flex items-center gap-5">
                    <div>
                      <p className="text-xl font-bold text-navy-950">{awayTeamName}</p>
                      <p className="text-sm text-gray-600 mt-1">1 wins</p>
                    </div>
                    {match.Away?.IdTeam && (
                      <img
                        src={formatTeamLogo(match.Away.IdTeam)}
                        alt={awayTeamName}
                        className="w-16 h-16 object-contain"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement | null;
                          if (target) target.src = "/images/fallback.png";
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Meetings Section */}
              <div>
                <h3 className="text-2xl font-bold text-navy-950 text-center mb-8">Recent meetings</h3>
                <div className="bg-gray-50 rounded-lg p-6 lg:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-3">
                        {venue && `${venue}, `}
                        {city && `${city} • `}
                        {stageName} • {matchDate}
                      </p>
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-navy-950">{homeTeamName}</span>
                          {match.Home?.IdTeam && (
                            <img
                              src={formatTeamLogo(match.Home.IdTeam)}
                              alt={homeTeamName}
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement | null;
                                if (target) target.src = "/images/fallback.png";
                              }}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-navy-950">
                            {match.HomeTeamScore ?? match.Home?.Score ?? 0}
                          </span>
                          <span className="text-xl text-gray-400">-</span>
                          <span className="text-2xl font-bold text-navy-950">
                            {match.AwayTeamScore ?? match.Away?.Score ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          {match.Away?.IdTeam && (
                            <img
                              src={formatTeamLogo(match.Away.IdTeam)}
                              alt={awayTeamName}
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement | null;
                                if (target) target.src = "/images/fallback.png";
                              }}
                            />
                          )}
                          <span className="text-lg font-bold text-navy-950">{awayTeamName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isFinished && (
                        <span className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-xs font-semibold">
                          FT
                        </span>
                      )}
                      <svg
                        className="w-6 h-6 text-gray-400"
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
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "table" && (
            <div className="text-center py-12">
              <p className="text-gray-600">League table will be displayed here</p>
            </div>
          )}

          {activeTab === "related" && (
            <div className="text-center py-12">
              <p className="text-gray-600">Related matches will be displayed here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
