"use client";

import { useState, useEffect } from "react";
import { fetchMatchDetails, fetchHeadToHead } from "@/lib/api";
import type { MatchAPIItem, HeadToHeadAPIResponse } from "@/lib/types";
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
  const [headToHeadData, setHeadToHeadData] = useState<HeadToHeadAPIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHeadToHead, setIsLoadingHeadToHead] = useState(false);
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

  // Fetch head-to-head data when match is loaded
  useEffect(() => {
    const loadHeadToHead = async () => {
      if (!match?.Home?.IdTeam || !match?.Away?.IdTeam) return;

      setIsLoadingHeadToHead(true);
      try {
        // Don't pass toDate - FIFA includes the current match in the list
        // The API will return matches including the current one
        const h2hData = await fetchHeadToHead(
          match.Home.IdTeam,
          match.Away.IdTeam,
          locale === "en" ? "en" : locale,
          5 // count - match FIFA's default
        );
        
        if (h2hData) {
          setHeadToHeadData(h2hData);
        }
      } catch (err) {
        console.error("Error loading head-to-head:", err);
      } finally {
        setIsLoadingHeadToHead(false);
      }
    };

    loadHeadToHead();
  }, [match?.Home?.IdTeam, match?.Away?.IdTeam, match?.Date, locale]);

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

  // Map head-to-head stats to home/away teams
  const homeTeamStats = headToHeadData && match.Home?.IdTeam && match.Away?.IdTeam
    ? (headToHeadData.TeamA.IdTeam === match.Home.IdTeam ? headToHeadData.TeamA : headToHeadData.TeamB)
    : null;
  const awayTeamStats = headToHeadData && match.Home?.IdTeam && match.Away?.IdTeam
    ? (headToHeadData.TeamA.IdTeam === match.Home.IdTeam ? headToHeadData.TeamB : headToHeadData.TeamA)
    : null;

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
            <div className="flex-1 flex items-center gap-3 lg:gap-4 justify-end pr-4 lg:pr-8">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-950">{homeTeamName}</h2>
              </div>
              {match.Home?.IdTeam && (
                <img
                  src={formatTeamLogo(match.Home.IdTeam)}
                  alt={homeTeamName}
                  className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement | null;
                    if (target) target.src = "/images/fallback.png";
                  }}
                />
              )}
            </div>

            {/* Score */}
            <div className="mx-4 sm:mx-6 lg:mx-8 xl:mx-12 text-center flex-shrink-0">
              <div className="flex items-center gap-4 sm:gap-5 lg:gap-6 mb-4">
                <span className="text-5xl sm:text-6xl lg:text-7xl font-bold text-navy-950">
                  {match.HomeTeamScore ?? match.Home?.Score ?? 0}
                </span>
                <span className="text-3xl sm:text-4xl lg:text-5xl text-gray-400">-</span>
                <span className="text-5xl sm:text-6xl lg:text-7xl font-bold text-navy-950">
                  {match.AwayTeamScore ?? match.Away?.Score ?? 0}
                </span>
              </div>
              {isFinished && (
                <button className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-semibold">
                  Full Time
                </button>
              )}
              {isLive && (
                <button className="bg-red-600 text-white px-6 sm:px-8 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-semibold animate-pulse">
                  LIVE {match.MatchTime || ""}
                </button>
              )}
              {matchStatus === "scheduled" && (
                <div className="text-base sm:text-lg font-semibold text-gray-500">
                  {matchTime}
                </div>
              )}
            </div>

            {/* Away Team - Logo on left, Name on right */}
            <div className="flex-1 flex items-center gap-3 lg:gap-4 justify-start pl-4 lg:pl-8">
              {match.Away?.IdTeam && (
                <img
                  src={formatTeamLogo(match.Away.IdTeam)}
                  alt={awayTeamName}
                  className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement | null;
                    if (target) target.src = "/images/fallback.png";
                  }}
                />
              )}
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-950">{awayTeamName}</h2>
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
            <div className="space-y-10">
              {/* Head to Head Section */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-navy-950 text-center mb-8 sm:mb-10">Head to Head</h3>
                {isLoadingHeadToHead ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fifa-header mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Loading head-to-head statistics...</p>
                  </div>
                ) : headToHeadData && homeTeamStats && awayTeamStats ? (
                  <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center gap-6 sm:gap-8 lg:gap-12">
                      {/* Home Team Stats */}
                      <div className="flex flex-col items-center gap-2 flex-1 max-w-[180px]">
                        {match.Home?.IdTeam && (
                          <img
                            src={formatTeamLogo(match.Home.IdTeam)}
                            alt={homeTeamName}
                            className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement | null;
                              if (target) target.src = "/images/fallback.png";
                            }}
                          />
                        )}
                        <p className="text-sm sm:text-base font-bold text-navy-950 text-center leading-tight">{homeTeamName}</p>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-950 mt-1">
                          {homeTeamStats.Wins} {homeTeamStats.Wins === 1 ? 'win' : 'wins'}
                        </p>
                      </div>

                      {/* Center Stats - Total Matches and Draws */}
                      <div className="text-center flex-shrink-0 px-4 sm:px-6 lg:px-8">
                        <p className="text-5xl sm:text-6xl lg:text-7xl font-bold text-navy-950 mb-1">
                          {headToHeadData.TeamA.MatchesPlayed}
                        </p>
                        <p className="text-sm sm:text-base text-gray-600">Draws: {headToHeadData.TeamA.Draws}</p>
                      </div>

                      {/* Away Team Stats */}
                      <div className="flex flex-col items-center gap-2 flex-1 max-w-[180px]">
                        {match.Away?.IdTeam && (
                          <img
                            src={formatTeamLogo(match.Away.IdTeam)}
                            alt={awayTeamName}
                            className="w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement | null;
                              if (target) target.src = "/images/fallback.png";
                            }}
                          />
                        )}
                        <p className="text-sm sm:text-base font-bold text-navy-950 text-center leading-tight">{awayTeamName}</p>
                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-950 mt-1">
                          {awayTeamStats.Wins} {awayTeamStats.Wins === 1 ? 'win' : 'wins'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No head-to-head data available</p>
                  </div>
                )}
              </div>

              {/* Recent Meetings Section */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-navy-950 text-center mb-6 sm:mb-8">Recent meetings</h3>
                {isLoadingHeadToHead ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fifa-header mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Loading historical matches...</p>
                  </div>
                ) : headToHeadData && headToHeadData.MatchesList && headToHeadData.MatchesList.length > 0 ? (
                  <div className="max-w-4xl mx-auto space-y-2">
                    {headToHeadData.MatchesList.map((historicalMatch) => {
                      const historicalHomeTeamName = historicalMatch.Home?.TeamName
                        ? getTeamName(historicalMatch.Home.TeamName, locale === "en" ? "en-GB" : locale)
                        : historicalMatch.Home?.ShortClubName || "TBD";
                      const historicalAwayTeamName = historicalMatch.Away?.TeamName
                        ? getTeamName(historicalMatch.Away.TeamName, locale === "en" ? "en-GB" : locale)
                        : historicalMatch.Away?.ShortClubName || "TBD";
                      
                      const historicalVenue = historicalMatch.Stadium?.Name && historicalMatch.Stadium.Name.length > 0
                        ? getTeamName(historicalMatch.Stadium.Name, locale === "en" ? "en-GB" : locale)
                        : undefined;
                      const historicalCity = historicalMatch.Stadium?.CityName && historicalMatch.Stadium.CityName.length > 0
                        ? getTeamName(historicalMatch.Stadium.CityName, locale === "en" ? "en-GB" : locale)
                        : undefined;
                      const historicalStageName = historicalMatch.StageName && historicalMatch.StageName.length > 0
                        ? getTeamName(historicalMatch.StageName, locale === "en" ? "en-GB" : locale)
                        : "Regular Season";
                      const historicalDate = formatMatchDate(historicalMatch.Date, locale);
                      
                      const historicalHomeScore = historicalMatch.HomeTeamScore ?? historicalMatch.Home?.Score ?? 0;
                      const historicalAwayScore = historicalMatch.AwayTeamScore ?? historicalMatch.Away?.Score ?? 0;
                      const historicalIsFinished = getMatchStatus(historicalMatch.MatchStatus) === "finished";
                      
                      // Determine winner for dot indicator
                      const homeWon = historicalIsFinished && historicalHomeScore > historicalAwayScore;
                      const awayWon = historicalIsFinished && historicalAwayScore > historicalHomeScore;
                      
                      return (
                        <div key={historicalMatch.IdMatch} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:bg-gray-50 transition-colors cursor-pointer">
                          {/* Use same layout structure as Head to Head for perfect alignment */}
                          <div className="flex items-center justify-center gap-6 sm:gap-8 lg:gap-12">
                            {/* Left: Venue and Date Info */}
                            <div className="flex-1 max-w-[180px] text-left">
                              <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1 leading-tight">
                                {historicalVenue && historicalCity 
                                  ? `${historicalVenue}, ${historicalCity}`
                                  : historicalVenue || historicalCity || 'Venue TBD'}
                              </p>
                              <p className="text-xs text-gray-500 leading-tight">
                                {historicalStageName} • {historicalDate}
                              </p>
                            </div>

                            {/* Center: Logos, Score, and Team Names - aligned with Head to Head center */}
                            <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8">
                              <div className="flex flex-col items-center justify-center min-w-0">
                                {/* Top Row: Logos and Score */}
                                <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 mb-2">
                                  {/* Home Team Logo */}
                                  <div className="flex flex-col items-center">
                                    {historicalMatch.Home?.IdTeam && (
                                      <img
                                        src={formatTeamLogo(historicalMatch.Home.IdTeam)}
                                        alt={historicalHomeTeamName}
                                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                                        onError={(e) => {
                                          const target = e.currentTarget as HTMLImageElement | null;
                                          if (target) target.src = "/images/fallback.png";
                                        }}
                                      />
                                    )}
                                    {/* Home Team Name below logo */}
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                      <span className={`text-xs sm:text-sm font-semibold text-navy-950 text-center max-w-[120px] sm:max-w-[140px] truncate ${homeWon ? 'text-blue-600' : ''}`}>
                                        {historicalHomeTeamName}
                                      </span>
                                      {homeWon && (
                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Score - centered */}
                                  <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className="text-2xl sm:text-3xl lg:text-3xl font-bold text-navy-950">
                                      {historicalHomeScore}
                                    </span>
                                    <span className="text-xl sm:text-2xl text-gray-400">·</span>
                                    <span className="text-2xl sm:text-3xl lg:text-3xl font-bold text-navy-950">
                                      {historicalAwayScore}
                                    </span>
                                  </div>

                                  {/* Away Team Logo */}
                                  <div className="flex flex-col items-center">
                                    {historicalMatch.Away?.IdTeam && (
                                      <img
                                        src={formatTeamLogo(historicalMatch.Away.IdTeam)}
                                        alt={historicalAwayTeamName}
                                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                                        onError={(e) => {
                                          const target = e.currentTarget as HTMLImageElement | null;
                                          if (target) target.src = "/images/fallback.png";
                                        }}
                                      />
                                    )}
                                    {/* Away Team Name below logo */}
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                      {awayWon && (
                                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                                      )}
                                      <span className={`text-xs sm:text-sm font-semibold text-navy-950 text-center max-w-[120px] sm:max-w-[140px] truncate ${awayWon ? 'text-blue-600' : ''}`}>
                                        {historicalAwayTeamName}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right: Status and Arrow */}
                            <div className="flex-1 max-w-[180px] flex items-center justify-end gap-2">
                              {historicalIsFinished && (
                                <span className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold whitespace-nowrap">
                                  FT
                                </span>
                              )}
                              <svg
                                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0"
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
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No previous meetings found</p>
                  </div>
                )}
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
