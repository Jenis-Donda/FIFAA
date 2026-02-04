"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchMatchDetails, fetchHeadToHead, fetchStandingsData } from "@/lib/api";
import type { MatchAPIItem, HeadToHeadAPIResponse, Player, PlayerName, Standing } from "@/lib/types";
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
 * Get player name from PlayerName array
 */
function getPlayerName(names: PlayerName[], preferredLocale: string = "en-GB"): string {
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

/**
 * Get goal scorer name from player ID
 * Tries to find player in the team's players array
 */
function getGoalScorerName(
  playerId: string,
  players: Player[] | undefined,
  locale: string = "en-GB"
): string {
  if (!players || !playerId) return "Unknown";
  // Find player by IdPlayer (works for both starters and substitutes)
  const player = players.find((p) => p.IdPlayer === playerId);
  if (!player || !player.PlayerName) return "Unknown";
  return getPlayerName(player.PlayerName, locale);
}

/**
 * Format goal minute for display (e.g., "24'", "45'+4'")
 */
function formatGoalMinute(minute: string, period: number): string {
  if (!minute) return "";
  // Handle extra time notation (e.g., "45+4" becomes "45'+4'")
  // Also handle cases where minute already has apostrophe
  if (minute.includes("+")) {
    return minute.replace(/(\d+)\+(\d+)/, "$1'+$2'");
  }
  // If minute doesn't already end with apostrophe, add it
  return minute.endsWith("'") ? minute : `${minute}'`;
}

/**
 * Get goal type indicator
 * Type: 0 = Regular, 1 = Penalty, 2 = Own Goal, etc.
 */
function getGoalTypeIndicator(type: number): { icon: string; color: string } {
  switch (type) {
    case 1:
      return { icon: "⚽", color: "text-orange-500" }; // Penalty
    case 2:
      return { icon: "⚽", color: "text-red-500" }; // Own Goal
    default:
      return { icon: "⚽", color: "text-gray-700" }; // Regular goal
  }
}

/**
 * Match Event Types for Timeline
 */
type MatchEventType = "goal" | "yellow-card" | "red-card" | "substitution";

interface MatchEvent {
  id: string;
  type: MatchEventType;
  minute: string;
  period: number;
  teamId: string;
  isHome: boolean;
  playerId?: string;
  playerName?: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  playerOffId?: string;
  playerOffName?: string;
  playerOnId?: string;
  playerOnName?: string;
  goalType?: number;
  cardType?: number; // 1=Yellow, 2=Red, 3=Second Yellow
}

/**
 * Extract and combine all match events into a unified timeline
 */
function extractMatchEvents(
  match: MatchAPIItem,
  locale: string = "en-GB"
): MatchEvent[] {
  const events: MatchEvent[] = [];
  const homeTeam = match.HomeTeam || match.Home;
  const awayTeam = match.AwayTeam || match.Away;
  const homeTeamId = homeTeam?.IdTeam;
  const awayTeamId = awayTeam?.IdTeam;

  // Extract goals
  if (homeTeam?.Goals) {
    homeTeam.Goals.forEach((goal) => {
      const playerName = getGoalScorerName(goal.IdPlayer, homeTeam.Players, locale);
      const assistName = goal.IdAssistPlayer
        ? getGoalScorerName(goal.IdAssistPlayer, homeTeam.Players, locale)
        : undefined;
      
      events.push({
        id: goal.IdGoal || `goal-${goal.IdPlayer}-${goal.Minute}`,
        type: "goal",
        minute: goal.Minute,
        period: goal.Period,
        teamId: goal.IdTeam,
        isHome: true,
        playerId: goal.IdPlayer,
        playerName,
        assistPlayerId: goal.IdAssistPlayer || undefined,
        assistPlayerName: assistName !== "Unknown" ? assistName : undefined,
        goalType: goal.Type,
      });
    });
  }

  if (awayTeam?.Goals) {
    awayTeam.Goals.forEach((goal) => {
      const playerName = getGoalScorerName(goal.IdPlayer, awayTeam.Players, locale);
      const assistName = goal.IdAssistPlayer
        ? getGoalScorerName(goal.IdAssistPlayer, awayTeam.Players, locale)
        : undefined;
      
      events.push({
        id: goal.IdGoal || `goal-${goal.IdPlayer}-${goal.Minute}`,
        type: "goal",
        minute: goal.Minute,
        period: goal.Period,
        teamId: goal.IdTeam,
        isHome: false,
        playerId: goal.IdPlayer,
        playerName,
        assistPlayerId: goal.IdAssistPlayer || undefined,
        assistPlayerName: assistName !== "Unknown" ? assistName : undefined,
        goalType: goal.Type,
      });
    });
  }

  // Extract bookings (cards)
  if (homeTeam?.Bookings) {
    homeTeam.Bookings.forEach((booking) => {
      const playerName = getGoalScorerName(booking.IdPlayer, homeTeam.Players, locale);
      const eventType: MatchEventType = booking.Card === 2 || booking.Card === 3 ? "red-card" : "yellow-card";
      
      events.push({
        id: booking.IdEvent || `booking-${booking.IdPlayer}-${booking.Minute}`,
        type: eventType,
        minute: booking.Minute,
        period: booking.Period,
        teamId: booking.IdTeam,
        isHome: true,
        playerId: booking.IdPlayer,
        playerName,
        cardType: booking.Card,
      });
    });
  }

  if (awayTeam?.Bookings) {
    awayTeam.Bookings.forEach((booking) => {
      const playerName = getGoalScorerName(booking.IdPlayer, awayTeam.Players, locale);
      const eventType: MatchEventType = booking.Card === 2 || booking.Card === 3 ? "red-card" : "yellow-card";
      
      events.push({
        id: booking.IdEvent || `booking-${booking.IdPlayer}-${booking.Minute}`,
        type: eventType,
        minute: booking.Minute,
        period: booking.Period,
        teamId: booking.IdTeam,
        isHome: false,
        playerId: booking.IdPlayer,
        playerName,
        cardType: booking.Card,
      });
    });
  }

  // Extract substitutions
  if (homeTeam?.Substitutions) {
    homeTeam.Substitutions.forEach((sub) => {
      const playerOffName = getPlayerName(sub.PlayerOffName, locale);
      const playerOnName = getPlayerName(sub.PlayerOnName, locale);
      
      events.push({
        id: sub.IdEvent || `sub-${sub.IdPlayerOff}-${sub.Minute}`,
        type: "substitution",
        minute: sub.Minute,
        period: sub.Period,
        teamId: sub.IdTeam,
        isHome: true,
        playerOffId: sub.IdPlayerOff,
        playerOffName,
        playerOnId: sub.IdPlayerOn,
        playerOnName,
      });
    });
  }

  if (awayTeam?.Substitutions) {
    awayTeam.Substitutions.forEach((sub) => {
      const playerOffName = getPlayerName(sub.PlayerOffName, locale);
      const playerOnName = getPlayerName(sub.PlayerOnName, locale);
      
      events.push({
        id: sub.IdEvent || `sub-${sub.IdPlayerOff}-${sub.Minute}`,
        type: "substitution",
        minute: sub.Minute,
        period: sub.Period,
        teamId: sub.IdTeam,
        isHome: false,
        playerOffId: sub.IdPlayerOff,
        playerOffName,
        playerOnId: sub.IdPlayerOn,
        playerOnName,
      });
    });
  }

  // Sort events by period first, then by minute
  events.sort((a, b) => {
    if (a.period !== b.period) {
      return a.period - b.period;
    }
    const minuteA = parseInt(a.minute?.replace(/\D/g, '') || '0');
    const minuteB = parseInt(b.minute?.replace(/\D/g, '') || '0');
    return minuteA - minuteB;
  });

  return events;
}

/**
 * Get position label from position code
 */
function getPositionLabel(position: number): string {
  switch (position) {
    case 0:
      return "Goalkeeper";
    case 1:
      return "Defender";
    case 2:
      return "Midfield";
    case 3:
      return "Attack";
    default:
      return "Unknown";
  }
}

/**
 * Group players by position for lineup display
 */
interface GroupedPlayers {
  starters: {
    goalkeepers: Player[];
    defenders: Player[];
    midfielders: Player[];
    attackers: Player[];
  };
  substitutes: Player[];
}

function groupPlayersByPosition(players: Player[]): GroupedPlayers {
  const grouped: GroupedPlayers = {
    starters: {
      goalkeepers: [],
      defenders: [],
      midfielders: [],
      attackers: [],
    },
    substitutes: [],
  };

  if (!players) return grouped;

  players.forEach((player) => {
    if (player.Status === 2) {
      // Substitute
      grouped.substitutes.push(player);
    } else if (player.Status === 1) {
      // Starter
      switch (player.Position) {
        case 0:
          grouped.starters.goalkeepers.push(player);
          break;
        case 1:
          grouped.starters.defenders.push(player);
          break;
        case 2:
          grouped.starters.midfielders.push(player);
          break;
        case 3:
          grouped.starters.attackers.push(player);
          break;
      }
    }
  });

  return grouped;
}

/**
 * Player Card Component
 */
function PlayerCard({
  player,
  locale,
  teamBookings,
}: {
  player: Player;
  locale: string;
  teamBookings?: Array<{ Card: number; IdPlayer: string }>;
}) {
  const playerName = getPlayerName(
    player.PlayerName,
    locale === "en" ? "en-GB" : locale
  );

  // Determine substitution status
  const isSubbedOut = player.Status === 1 && player.FieldStatus === 2;
  const isSubbedIn = player.Status === 2 && player.FieldStatus === 1;

  // Check for yellow/red card from team bookings
  const playerBookings =
    teamBookings?.filter((b) => b.IdPlayer === player.IdPlayer) || [];
  const hasYellowCard = playerBookings.some((b) => b.Card === 1);
  const hasRedCard = playerBookings.some((b) => b.Card === 2 || b.Card === 3);

  return (
    <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-md">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-gray-600 min-w-[1.5rem]">
            {player.ShirtNumber}
          </span>
          <span className="text-sm font-medium text-navy-950 truncate max-w-[8.5rem]">
            {playerName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {player.Captain && (
          <span className="w-4 h-4 bg-yellow-400 text-black text-[10px] font-bold rounded-sm flex items-center justify-center">
            C
          </span>
        )}
        {hasYellowCard && (
          <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm" />
        )}
        {hasRedCard && (
          <div className="w-2.5 h-3.5 bg-red-600 rounded-sm" />
        )}
        {isSubbedOut && (
          <span className="text-red-600 text-xs">⬇️</span>
        )}
        {isSubbedIn && (
          <span className="text-green-600 text-xs">⬆️</span>
        )}
      </div>
    </div>
  );
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
  const [standings, setStandings] = useState<Standing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHeadToHead, setIsLoadingHeadToHead] = useState(false);
  const [isLoadingStandings, setIsLoadingStandings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "lineup" | "stats" | "table" | "related">("overview");
  const router = useRouter();

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

  // Poll match details for live updates every 30 seconds
  useEffect(() => {
    // Only poll if match is live
    if (!match || getMatchStatus(match.MatchStatus) !== "live") {
      return;
    }

    let mounted = true;

    const fetchLatestMatchDetails = async () => {
      try {
        const matchData = await fetchMatchDetails(
          idCompetition,
          idSeason,
          idStage,
          idMatch,
          locale
        );

        if (!mounted || !matchData) return;

        // Only update live data fields to avoid jarring UI changes
        setMatch((prevMatch) => {
          if (!prevMatch) return prevMatch;
          const updatedHomeTeam = matchData.HomeTeam || matchData.Home;
          const updatedAwayTeam = matchData.AwayTeam || matchData.Away;
          
          return {
            ...prevMatch,
            HomeTeamScore: matchData.HomeTeamScore ?? updatedHomeTeam?.Score ?? prevMatch.HomeTeamScore,
            AwayTeamScore: matchData.AwayTeamScore ?? updatedAwayTeam?.Score ?? prevMatch.AwayTeamScore,
            MatchStatus: matchData.MatchStatus,
            MatchTime: matchData.MatchTime,
            // Update scores and goals in Home/Away objects if they exist
            Home: prevMatch.Home ? {
              ...prevMatch.Home,
              Score: updatedHomeTeam?.Score ?? prevMatch.Home.Score,
              Goals: updatedHomeTeam?.Goals ?? prevMatch.Home.Goals,
              Players: updatedHomeTeam?.Players ?? prevMatch.Home.Players,
            } : prevMatch.Home,
            Away: prevMatch.Away ? {
              ...prevMatch.Away,
              Score: updatedAwayTeam?.Score ?? prevMatch.Away.Score,
              Goals: updatedAwayTeam?.Goals ?? prevMatch.Away.Goals,
              Players: updatedAwayTeam?.Players ?? prevMatch.Away.Players,
            } : prevMatch.Away,
            HomeTeam: prevMatch.HomeTeam ? {
              ...prevMatch.HomeTeam,
              Score: matchData.HomeTeam?.Score ?? prevMatch.HomeTeam.Score,
              Goals: matchData.HomeTeam?.Goals ?? prevMatch.HomeTeam.Goals,
              Players: matchData.HomeTeam?.Players ?? prevMatch.HomeTeam.Players,
            } : prevMatch.HomeTeam,
            AwayTeam: prevMatch.AwayTeam ? {
              ...prevMatch.AwayTeam,
              Score: matchData.AwayTeam?.Score ?? prevMatch.AwayTeam.Score,
              Goals: matchData.AwayTeam?.Goals ?? prevMatch.AwayTeam.Goals,
              Players: matchData.AwayTeam?.Players ?? prevMatch.AwayTeam.Players,
            } : prevMatch.AwayTeam,
          };
        });
      } catch (err) {
        // Silent fail - do not disturb UI if polling fails
        // console.debug("Polling error:", err);
      }
    };

    // Start polling every 30 seconds
    const id = setInterval(fetchLatestMatchDetails, 30_000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [match?.MatchStatus, idCompetition, idSeason, idStage, idMatch, locale]);

  // Fetch head-to-head data when match is loaded
  useEffect(() => {
    const loadHeadToHead = async () => {
      // Support both Home/Away (calendar API) and HomeTeam/AwayTeam (live API)
      const homeTeamId = match?.HomeTeam?.IdTeam || match?.Home?.IdTeam;
      const awayTeamId = match?.AwayTeam?.IdTeam || match?.Away?.IdTeam;
      
      if (!homeTeamId || !awayTeamId) return;

      setIsLoadingHeadToHead(true);
      try {
        // Don't pass toDate - FIFA includes the current match in the list
        // The API will return matches including the current one
        const h2hData = await fetchHeadToHead(
          homeTeamId,
          awayTeamId,
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
  }, [match?.HomeTeam?.IdTeam, match?.Home?.IdTeam, match?.AwayTeam?.IdTeam, match?.Away?.IdTeam, match?.Date, locale]);

  // Fetch standings when match is loaded
  useEffect(() => {
    const loadStandings = async () => {
      if (!match?.IdCompetition || !match?.IdSeason || !match?.IdStage) return;

      setIsLoadingStandings(true);
      try {
        const standingsData = await fetchStandingsData(
          match.IdCompetition,
          match.IdSeason,
          match.IdStage,
          locale === "en" ? "en" : locale
        );
        
        if (standingsData) {
          setStandings(standingsData);
        }
      } catch (err) {
        console.error("Error loading standings:", err);
      } finally {
        setIsLoadingStandings(false);
      }
    };

    loadStandings();
  }, [match?.IdCompetition, match?.IdSeason, match?.IdStage, locale]);

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

  // Support both Home/Away (calendar API) and HomeTeam/AwayTeam (live API)
  const homeTeam = match.HomeTeam || match.Home;
  const awayTeam = match.AwayTeam || match.Away;

  const homeTeamName = homeTeam?.TeamName
    ? getTeamName(homeTeam.TeamName, locale === "en" ? "en-GB" : locale)
    : homeTeam?.ShortClubName || "TBD";
  const awayTeamName = awayTeam?.TeamName
    ? getTeamName(awayTeam.TeamName, locale === "en" ? "en-GB" : locale)
    : awayTeam?.ShortClubName || "TBD";

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

  // Extract goals and sort by minute
  const homeGoals = (homeTeam?.Goals || []).slice().sort((a, b) => {
    const minuteA = parseInt(a.Minute?.replace(/\D/g, '') || '0');
    const minuteB = parseInt(b.Minute?.replace(/\D/g, '') || '0');
    return minuteA - minuteB;
  });
  const awayGoals = (awayTeam?.Goals || []).slice().sort((a, b) => {
    const minuteA = parseInt(a.Minute?.replace(/\D/g, '') || '0');
    const minuteB = parseInt(b.Minute?.replace(/\D/g, '') || '0');
    return minuteA - minuteB;
  });

  // Extract all match events for timeline
  const matchEvents = extractMatchEvents(match, locale === "en" ? "en-GB" : locale);

  // Map head-to-head stats to home/away teams
  const homeTeamId = homeTeam?.IdTeam;
  const awayTeamId = awayTeam?.IdTeam;
  const homeTeamStats = headToHeadData && homeTeamId && awayTeamId
    ? (headToHeadData.TeamA.IdTeam === homeTeamId ? headToHeadData.TeamA : headToHeadData.TeamB)
    : null;
  const awayTeamStats = headToHeadData && homeTeamId && awayTeamId
    ? (headToHeadData.TeamA.IdTeam === homeTeamId ? headToHeadData.TeamB : headToHeadData.TeamA)
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
          <div className="flex items-center justify-center mb-6">
            {/* Home Team - Name on left, Logo on right */}
            <div className="flex-1 flex items-center gap-2 sm:gap-3 lg:gap-4 justify-end">
              <div className="flex flex-col items-end">
                <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-navy-950 text-right max-w-[100px] sm:max-w-none truncate sm:whitespace-normal">{homeTeamName}</h2>
                {/* Goal Scorers - hidden on mobile */}
                {(isFinished || isLive) && homeGoals.length > 0 && (
                  <div className="mt-2 space-y-1 hidden sm:block">
                    {homeGoals.map((goal, index) => {
                      const scorerName = getGoalScorerName(
                        goal.IdPlayer,
                        homeTeam?.Players,
                        locale === "en" ? "en-GB" : locale
                      );
                      const goalMinute = formatGoalMinute(goal.Minute, goal.Period);
                      const goalType = getGoalTypeIndicator(goal.Type);
                      return (
                        <div key={goal.IdGoal || index} className="flex items-center justify-end gap-2 text-xs sm:text-sm text-gray-700">
                          <span className={goalType.color}>{goalType.icon}</span>
                          <span className="font-medium truncate max-w-[120px]">{scorerName}</span>
                          <span className="text-gray-500">{goalMinute}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {homeTeam?.IdTeam && (
                <img
                  src={formatTeamLogo(homeTeam.IdTeam)}
                  alt={homeTeamName}
                  className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain flex-shrink-0"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement | null;
                    if (target) target.src = "/images/fallback.png";
                  }}
                />
              )}
            </div>

            {/* Score */}
            <div className="mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-12 text-center flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-4 md:gap-5 lg:gap-6 mb-2 sm:mb-4">
                <span className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-navy-950">
                  {match.HomeTeamScore ?? homeTeam?.Score ?? 0}
                </span>
                <span className="text-xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-400">-</span>
                <span className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-navy-950">
                  {match.AwayTeamScore ?? awayTeam?.Score ?? 0}
                </span>
              </div>
              {isFinished && (
                <button className="bg-blue-600 text-white px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 md:py-2.5 rounded-md text-[10px] sm:text-xs md:text-sm font-semibold">
                  Full Time
                </button>
              )}
              {isLive && (
                <button className="bg-red-600 text-white px-4 sm:px-6 md:px-8 py-1.5 sm:py-2 md:py-2.5 rounded-md text-[10px] sm:text-xs md:text-sm font-semibold animate-pulse">
                  LIVE {match.MatchTime || ""}
                </button>
              )}
              {matchStatus === "scheduled" && (
                <div className="text-sm sm:text-base md:text-lg font-semibold text-gray-500">
                  {matchTime}
                </div>
              )}
            </div>

            {/* Away Team - Logo on left, Name on right */}
            <div className="flex-1 flex items-center gap-2 sm:gap-3 lg:gap-4 justify-start">
              {awayTeam?.IdTeam && (
                <img
                  src={formatTeamLogo(awayTeam.IdTeam)}
                  alt={awayTeamName}
                  className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain flex-shrink-0"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement | null;
                    if (target) target.src = "/images/fallback.png";
                  }}
                />
              )}
              <div className="flex flex-col items-start">
                <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-navy-950 text-left max-w-[100px] sm:max-w-none truncate sm:whitespace-normal">{awayTeamName}</h2>
                {/* Goal Scorers - hidden on mobile */}
                {(isFinished || isLive) && awayGoals.length > 0 && (
                  <div className="mt-2 space-y-1 hidden sm:block">
                    {awayGoals.map((goal, index) => {
                      const scorerName = getGoalScorerName(
                        goal.IdPlayer,
                        awayTeam?.Players,
                        locale === "en" ? "en-GB" : locale
                      );
                      const goalMinute = formatGoalMinute(goal.Minute, goal.Period);
                      const goalType = getGoalTypeIndicator(goal.Type);
                      return (
                        <div key={goal.IdGoal || index} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                          <span className={goalType.color}>{goalType.icon}</span>
                          <span className="font-medium truncate max-w-[120px]">{scorerName}</span>
                          <span className="text-gray-500">{goalMinute}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
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
          <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-6 md:gap-8 border-b border-gray-200 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
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
                className={`pb-3 sm:pb-4 px-1 sm:px-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
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
        <div className="mt-4 sm:mt-6 md:mt-8">
          {activeTab === "overview" && (
            <div className="max-w-5xl mx-auto px-2 sm:px-4">
              {/* Timeline Section */}
              {matchEvents.length > 0 ? (
                <div className="relative">
                  {/* Center Vertical Line - hidden on mobile */}
                  <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 w-px bg-gray-200 h-full"></div>
                  
                  {/* Mobile: Single column list */}
                  <div className="sm:hidden space-y-3">
                    {matchEvents.map((event) => (
                      <div key={event.id} className={`flex items-start gap-3 p-3 rounded-lg ${event.isHome ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        <div className="flex-shrink-0 mt-0.5">
                          {event.type === "goal" && (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              event.goalType === 1 ? "bg-orange-500" : 
                              event.goalType === 2 ? "bg-red-500" : 
                              "bg-gray-700"
                            }`}>
                              <span className="text-white text-xs">⚽</span>
                            </div>
                          )}
                          {event.type === "yellow-card" && (
                            <div className="w-3 h-4 bg-yellow-400 rounded-sm"></div>
                          )}
                          {event.type === "red-card" && (
                            <div className="w-3 h-4 bg-red-600 rounded-sm"></div>
                          )}
                          {event.type === "substitution" && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-600 text-xs">🔄</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-gray-500">
                              {formatGoalMinute(event.minute, event.period)}
                            </span>
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {event.playerName || event.playerOffName || "Unknown"}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${event.isHome ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                              {event.isHome ? homeTeamName : awayTeamName}
                            </span>
                          </div>
                          {event.type === "substitution" && event.playerOnName && (
                            <div className="text-xs text-gray-500 mt-1">
                              ⬆️ {event.playerOnName}
                            </div>
                          )}
                          {event.type === "goal" && event.assistPlayerName && (
                            <div className="text-xs text-gray-500 mt-1">
                              Assist: {event.assistPlayerName}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop: Two column layout */}
                  <div className="hidden sm:grid grid-cols-2 gap-4">
                    {/* Home Team Events (Left Column) */}
                    <div className="space-y-2 pr-4 md:pr-8">
                      {matchEvents
                        .filter((event) => event.isHome)
                        .map((event) => (
                          <div key={event.id} className="flex items-start gap-3 justify-end">
                            <div className="flex flex-col items-end text-right">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {event.playerName || event.playerOffName || "Unknown"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatGoalMinute(event.minute, event.period)}
                                </span>
                              </div>
                              {event.type === "substitution" && event.playerOnName && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  ⬆️ {event.playerOnName}
                                </div>
                              )}
                              {event.type === "goal" && event.assistPlayerName && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  Assist: {event.assistPlayerName}
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-0 mt-0.5">
                              {event.type === "goal" && (
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                  event.goalType === 1 ? "bg-orange-500" : 
                                  event.goalType === 2 ? "bg-red-500" : 
                                  "bg-gray-700"
                                }`}>
                                  <span className="text-white text-[10px]">⚽</span>
                                </div>
                              )}
                              {event.type === "yellow-card" && (
                                <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm"></div>
                              )}
                              {event.type === "red-card" && (
                                <div className="relative">
                                  <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm absolute"></div>
                                  <div className="w-2.5 h-3.5 bg-red-600 rounded-sm"></div>
                                </div>
                              )}
                              {event.type === "substitution" && (
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-600 text-[10px]">⬇️</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Away Team Events (Right Column) */}
                    <div className="space-y-2 pl-4 md:pl-8">
                      {matchEvents
                        .filter((event) => !event.isHome)
                        .map((event) => (
                          <div key={event.id} className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {event.type === "goal" && (
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                  event.goalType === 1 ? "bg-orange-500" : 
                                  event.goalType === 2 ? "bg-red-500" : 
                                  "bg-gray-700"
                                }`}>
                                  <span className="text-white text-[10px]">⚽</span>
                                </div>
                              )}
                              {event.type === "yellow-card" && (
                                <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm"></div>
                              )}
                              {event.type === "red-card" && (
                                <div className="relative">
                                  <div className="w-2.5 h-3.5 bg-yellow-400 rounded-sm absolute"></div>
                                  <div className="w-2.5 h-3.5 bg-red-600 rounded-sm"></div>
                                </div>
                              )}
                              {event.type === "substitution" && (
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-600 text-[10px]">⬇️</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-start text-left">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {formatGoalMinute(event.minute, event.period)}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {event.playerName || event.playerOffName || "Unknown"}
                                </span>
                              </div>
                              {event.type === "substitution" && event.playerOnName && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  ⬆️ {event.playerOnName}
                                </div>
                              )}
                              {event.type === "goal" && event.assistPlayerName && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  Assist: {event.assistPlayerName}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No match events available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "lineup" && (
            <div className="space-y-6 sm:space-y-8 px-2 sm:px-4 md:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Home Team Lineup */}
                <div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {homeTeam?.IdTeam && (
                          <img
                            src={formatTeamLogo(homeTeam.IdTeam)}
                            alt={homeTeamName}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement | null;
                              if (target) target.src = "/images/fallback.png";
                            }}
                          />
                        )}
                        <h3 className="text-lg font-bold text-navy-950">{homeTeamName}</h3>
                      </div>
                      {homeTeam?.Tactics && (
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {homeTeam.Tactics}
                        </span>
                      )}
                    </div>
                  </div>

                  {homeTeam?.Players && homeTeam.Players.length > 0 ? (
                    <>
                      {(() => {
                        const grouped = groupPlayersByPosition(homeTeam.Players);
                        return (
                          <div className="space-y-4">
                            <div className="text-xs font-semibold text-gray-600 mb-2">Starting Line Up</div>
                            
                            {/* Goalkeeper */}
                            {grouped.starters.goalkeepers.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                                  Goalkeeper
                                </h4>
                                <div className="space-y-1.5">
                                  {grouped.starters.goalkeepers.map((player) => (
                                    <PlayerCard 
                                      key={player.IdPlayer} 
                                      player={player} 
                                      locale={locale}
                                      teamBookings={homeTeam?.Bookings}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Defenders */}
                            {grouped.starters.defenders.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                                  Defender
                                </h4>
                                <div className="space-y-1.5">
                                  {grouped.starters.defenders.map((player) => (
                                    <PlayerCard 
                                      key={player.IdPlayer} 
                                      player={player} 
                                      locale={locale}
                                      teamBookings={homeTeam?.Bookings}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Midfielders */}
                            {grouped.starters.midfielders.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                                  Midfield
                                </h4>
                                <div className="space-y-1.5">
                                  {grouped.starters.midfielders.map((player) => (
                                    <PlayerCard 
                                      key={player.IdPlayer} 
                                      player={player} 
                                      locale={locale}
                                      teamBookings={homeTeam?.Bookings}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Attackers */}
                            {grouped.starters.attackers.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                                  Attack
                                </h4>
                                <div className="space-y-1.5">
                                  {grouped.starters.attackers.map((player) => (
                                    <PlayerCard 
                                      key={player.IdPlayer} 
                                      player={player} 
                                      locale={locale}
                                      teamBookings={homeTeam?.Bookings}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Substitutes */}
                            {grouped.substitutes.length > 0 && (
                              <div className="mt-6">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                                  Substitutes
                                </h4>
                                <div className="space-y-1.5">
                                  {grouped.substitutes.map((player) => (
                                    <PlayerCard 
                                      key={player.IdPlayer} 
                                      player={player} 
                                      locale={locale}
                                      teamBookings={homeTeam?.Bookings}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Lineup not available</p>
                    </div>
                  )}

                  {/* Manager Section */}
                  {homeTeam?.Coaches && homeTeam.Coaches.length > 0 && (
                    <>
                      {(() => {
                        const headCoach = homeTeam.Coaches.find((coach) => coach.Role === 0);
                        if (!headCoach) return null;
                        
                        const coachName = getPlayerName(headCoach.Name, locale === "en" ? "en-GB" : locale);
                        const coachAlias = headCoach.Alias && headCoach.Alias.length > 0
                          ? getPlayerName(headCoach.Alias, locale === "en" ? "en-GB" : locale)
                          : coachName;
                        
                        return (
                          <div className="mt-6">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2">Manager</h4>
                            <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-md">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-navy-950">
                                  M {coachAlias}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>

                {/* Away Team Lineup */}
                <div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {awayTeam?.IdTeam && (
                          <img
                            src={formatTeamLogo(awayTeam.IdTeam)}
                            alt={awayTeamName}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement | null;
                              if (target) target.src = "/images/fallback.png";
                            }}
                          />
                        )}
                        <h3 className="text-lg font-bold text-navy-950">{awayTeamName}</h3>
                      </div>
                      {awayTeam?.Tactics && (
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {awayTeam.Tactics}
                        </span>
                      )}
                    </div>
                  </div>

                  {awayTeam?.Players && awayTeam.Players.length > 0 ? (
                    <>
                      {(() => {
                        const grouped = groupPlayersByPosition(awayTeam.Players);
                        return (
                          <div className="space-y-4">
                            <div className="text-xs font-semibold text-gray-600 mb-2">Starting Line Up</div>
                            
                            {/* Goalkeeper */}
                            {grouped.starters.goalkeepers.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                                  Goalkeeper
                                </h4>
                                <div className="space-y-1.5">
                                  {grouped.starters.goalkeepers.map((player) => (
                                    <PlayerCard 
                                      key={player.IdPlayer} 
                                      player={player} 
                                      locale={locale}
                                      teamBookings={awayTeam?.Bookings}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Defenders */}
                            {grouped.starters.defenders.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                                  Defender
                                </h4>
                                <div className="space-y-1.5">
                                  {grouped.starters.defenders.map((player) => (
                                    <PlayerCard 
                                      key={player.IdPlayer} 
                                      player={player} 
                                      locale={locale}
                                      teamBookings={awayTeam?.Bookings}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Midfielders */}
                            {grouped.starters.midfielders.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                                  Midfield
                                </h4>
                                <div className="space-y-1.5">
                                  {grouped.starters.midfielders.map((player) => (
                                    <PlayerCard 
                                      key={player.IdPlayer} 
                                      player={player} 
                                      locale={locale}
                                      teamBookings={awayTeam?.Bookings}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Attackers */}
                            {grouped.starters.attackers.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                                  Attack
                                </h4>
                                <div className="space-y-1.5">
                                  {grouped.starters.attackers.map((player) => (
                                    <PlayerCard 
                                      key={player.IdPlayer} 
                                      player={player} 
                                      locale={locale}
                                      teamBookings={awayTeam?.Bookings}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Substitutes */}
                            {grouped.substitutes.length > 0 && (
                              <div className="mt-6">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1.5">
                                  Substitutes
                                </h4>
                                <div className="space-y-1.5">
                                  {grouped.substitutes.map((player) => (
                                    <PlayerCard 
                                      key={player.IdPlayer} 
                                      player={player} 
                                      locale={locale}
                                      teamBookings={awayTeam?.Bookings}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Lineup not available</p>
                    </div>
                  )}

                  {/* Manager Section */}
                  {awayTeam?.Coaches && awayTeam.Coaches.length > 0 && (
                    <>
                      {(() => {
                        const headCoach = awayTeam.Coaches.find((coach) => coach.Role === 0);
                        if (!headCoach) return null;
                        
                        const coachName = getPlayerName(headCoach.Name, locale === "en" ? "en-GB" : locale);
                        const coachAlias = headCoach.Alias && headCoach.Alias.length > 0
                          ? getPlayerName(headCoach.Alias, locale === "en" ? "en-GB" : locale)
                          : coachName;
                        
                        return (
                          <div className="mt-6">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2">Manager</h4>
                            <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-md">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-navy-950">
                                  M {coachAlias}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
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
                        {homeTeamId && (
                          <img
                            src={formatTeamLogo(homeTeamId)}
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
                        {awayTeamId && (
                          <img
                            src={formatTeamLogo(awayTeamId)}
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
                      
                      // Handle click to navigate to match details
                      const handleMatchClick = () => {
                        if (historicalMatch.IdCompetition && historicalMatch.IdSeason && historicalMatch.IdStage && historicalMatch.IdMatch) {
                          router.push(`/${locale}/match-centre/match/${historicalMatch.IdCompetition}/${historicalMatch.IdSeason}/${historicalMatch.IdStage}/${historicalMatch.IdMatch}`);
                        }
                      };
                      
                      return (
                        <div 
                          key={historicalMatch.IdMatch} 
                          onClick={handleMatchClick}
                          className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          {/* Mobile: Stacked layout */}
                          <div className="block sm:hidden">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {historicalMatch.Home?.IdTeam && (
                                  <img
                                    src={formatTeamLogo(historicalMatch.Home.IdTeam)}
                                    alt={historicalHomeTeamName}
                                    className="w-8 h-8 object-contain"
                                    onError={(e) => {
                                      const target = e.currentTarget as HTMLImageElement | null;
                                      if (target) target.src = "/images/fallback.png";
                                    }}
                                  />
                                )}
                                <span className="text-sm font-semibold text-navy-950">{historicalHomeTeamName}</span>
                              </div>
                              <span className="text-lg font-bold text-navy-950">{historicalHomeScore}</span>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {historicalMatch.Away?.IdTeam && (
                                  <img
                                    src={formatTeamLogo(historicalMatch.Away.IdTeam)}
                                    alt={historicalAwayTeamName}
                                    className="w-8 h-8 object-contain"
                                    onError={(e) => {
                                      const target = e.currentTarget as HTMLImageElement | null;
                                      if (target) target.src = "/images/fallback.png";
                                    }}
                                  />
                                )}
                                <span className="text-sm font-semibold text-navy-950">{historicalAwayTeamName}</span>
                              </div>
                              <span className="text-lg font-bold text-navy-950">{historicalAwayScore}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{historicalDate}</span>
                              {historicalIsFinished && (
                                <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-semibold">FT</span>
                              )}
                            </div>
                          </div>
                          
                          {/* Desktop: Horizontal layout */}
                          <div className="hidden sm:flex items-center justify-center gap-4 sm:gap-6 lg:gap-12">
                            {/* Left: Venue and Date Info */}
                            <div className="flex-1 max-w-[180px] text-left hidden md:block">
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
                            <div className="flex-shrink-0 px-2 sm:px-4 lg:px-8">
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
                                <span className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs font-semibold whitespace-nowrap">
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
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {isLoadingStandings ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fifa-header mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading league table...</p>
                </div>
              ) : standings.length > 0 ? (
                <>
                  {/* Table */}
                  <div className="overflow-x-auto bg-gray-50">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-gray-200">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">#</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">TEAM</th>
                          <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">P</th>
                          <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">W</th>
                          <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">D</th>
                          <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">L</th>
                          <th className="hidden sm:table-cell px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">GF</th>
                          <th className="hidden sm:table-cell px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">GA</th>
                          <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">GD</th>
                          <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">PTS</th>
                          <th className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">FORM</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {standings.map((row, index) => {
                          // Use real form data from API, fallback to empty form if not available
                          const formResults = row.form || ["-", "-", "-", "-", "-"];
                          
                          // Check if this team is playing in the current match
                          const homeTeamId = homeTeam?.IdTeam;
                          const awayTeamId = awayTeam?.IdTeam;
                          const isPlayingInCurrentMatch = isLive && (
                            row.teamId === homeTeamId || row.teamId === awayTeamId
                          );
                          
                          return (
                            <tr
                              key={row.position}
                              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                isPlayingInCurrentMatch
                                  ? "bg-blue-100 border-l-4 border-l-blue-600"
                                  : index % 2 === 0
                                  ? "bg-white"
                                  : "bg-gray-50/50"
                              }`}
                            >
                              {/* Position */}
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                <span className="font-semibold text-gray-900 text-xs sm:text-sm">{row.position}</span>
                              </td>

                              {/* Team */}
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  {row.teamLogo ? (
                                    <img
                                      src={row.teamLogo}
                                      alt={row.team}
                                      className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                                      onError={(e) => {
                                        const target = e.currentTarget as HTMLImageElement | null;
                                        if (target) target.src = "/images/fallback.png";
                                      }}
                                    />
                                  ) : (
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-gray-500 flex-shrink-0">
                                      {row.teamAbbr.substring(0, 2)}
                                    </div>
                                  )}
                                  {/* Show 3-letter abbreviation on mobile, full name on desktop */}
                                  <span className="sm:hidden font-medium text-gray-900 text-xs">{row.teamAbbr.substring(0, 3).toUpperCase()}</span>
                                  <span className="hidden sm:inline font-medium text-gray-900 text-sm truncate max-w-none">{row.team}</span>
                                </div>
                              </td>

                              {/* Stats */}
                              <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-gray-700 text-xs sm:text-sm">{row.played}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-gray-700 text-xs sm:text-sm">{row.won}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-gray-700 text-xs sm:text-sm">{row.drawn}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-gray-700 text-xs sm:text-sm">{row.lost}</td>
                              <td className="hidden sm:table-cell px-2 sm:px-3 py-2 sm:py-3 text-center text-gray-700 text-xs sm:text-sm">{row.goalsFor}</td>
                              <td className="hidden sm:table-cell px-2 sm:px-3 py-2 sm:py-3 text-center text-gray-700 text-xs sm:text-sm">{row.goalsAgainst}</td>
                              <td className={`px-2 sm:px-3 py-2 sm:py-3 text-center font-medium text-xs sm:text-sm ${
                                row.goalDiff > 0 ? "text-green-600" : row.goalDiff < 0 ? "text-red-600" : "text-gray-700"
                              }`}>
                                {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                              </td>
                              <td className="px-2 sm:px-3 py-2 sm:py-3 text-center font-bold text-gray-900 text-xs sm:text-sm">{row.points}</td>

                              {/* Form - hidden on mobile */}
                              <td className="hidden sm:table-cell px-2 sm:px-4 py-2 sm:py-3">
                                <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                                  {[...formResults].reverse().map((result, i) => (
                                    <div
                                      key={i}
                                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-white ${
                                        result === "W"
                                          ? "bg-green-500"
                                          : result === "D"
                                          ? "bg-gray-400"
                                          : result === "L"
                                          ? "bg-red-500"
                                          : "bg-white border-2 border-gray-300"
                                      }`}
                                    >
                                      {result === "-" ? "" : result}
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Legend Section Below Table */}
                  <div className="px-3 sm:px-6 py-3 sm:py-4 bg-white border-t border-gray-200">
                    <div className="space-y-3 sm:space-y-4">
                      {/* LAST 5 MATCHES Legend - Hidden on mobile since form column is hidden */}
                      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm">
                        <span className="font-semibold text-gray-900">LAST 5 MATCHES</span>
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-white text-[8px] sm:text-[10px] font-bold">W</span>
                            </div>
                            <span className="text-gray-700">Win</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-400 flex items-center justify-center">
                              <span className="text-white text-[8px] sm:text-[10px] font-bold">D</span>
                            </div>
                            <span className="text-gray-700">Draw</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 flex items-center justify-center">
                              <span className="text-white text-[8px] sm:text-[10px] font-bold">L</span>
                            </div>
                            <span className="text-gray-700">Lose</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                              <span className="text-gray-400 text-[8px] sm:text-[10px] font-bold">-</span>
                            </div>
                            <span className="text-gray-700">Not played</span>
                          </div>
                        </div>
                      </div>

                      {/* KEY Section - Hidden on mobile, shown on larger screens */}
                      <div className="hidden sm:flex items-center gap-6 text-sm">
                        <span className="font-semibold text-gray-900">KEY</span>
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                          <span className="text-gray-700"><span className="font-semibold">P</span> = Played</span>
                          <span className="text-gray-700"><span className="font-semibold">W</span> = Wins</span>
                          <span className="text-gray-700"><span className="font-semibold">D</span> = Draws</span>
                          <span className="text-gray-700"><span className="font-semibold">L</span> = Loss</span>
                          <span className="text-gray-700"><span className="font-semibold">GF</span> = Goals For</span>
                          <span className="text-gray-700"><span className="font-semibold">GA</span> = Goals Against</span>
                          <span className="text-gray-700"><span className="font-semibold">GD</span> = Goal Diff</span>
                          <span className="text-gray-700"><span className="font-semibold">PTS</span> = Points</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">League table not available</p>
                </div>
              )}
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
