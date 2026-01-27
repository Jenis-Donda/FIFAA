"use client";

import { useState, useEffect } from "react";
import DateSelector from "./DateSelector";
import MatchList from "./MatchList";
import StandingsPanel from "./StandingsPanel";
import StandingsModal from "./StandingsModal";
import type { MatchesByCompetition, Standing, MatchAPIItem, Match, StandingsAPIResponse } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries";

// FIFA API endpoints
const FIFA_CALENDAR_API = "https://api.fifa.com/api/v3/calendar";

// Common headers for FIFA API requests
const FIFA_API_HEADERS = {
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Origin": "https://www.fifa.com",
  "Referer": "https://www.fifa.com/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
};

type MatchCentreClientProps = {
  locale: string;
  dict: Dictionary;
};

type CompetitionMetadata = {
  competitionId: string;
  seasonId: string;
  stageId: string;
  competitionName: string;
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
  
  // Try preferred locale first
  const localized = names.find((n) => n.Locale === preferredLocale);
  if (localized?.Description) return localized.Description;
  
  // Try English variants
  const englishVariants = ["en-GB", "en-US", "en", "EN"];
  for (const locale of englishVariants) {
    const found = names.find((n) => n.Locale === locale || n.Locale.toLowerCase().startsWith("en"));
    if (found?.Description) return found.Description;
  }
  
  // Fall back to first available description
  const firstValid = names.find((n) => n.Description && n.Description.trim() !== "");
  return firstValid?.Description || names[0]?.Description || "Unknown";
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
 * Format team logo URL - use the FIFA picture API with teams-sq-1 format
 */
function formatTeamLogo(teamId?: string): string | undefined {
  if (!teamId) return undefined;
  // Use the FIFA picture API pattern: https://api.fifa.com/api/v3/picture/teams-sq-1/{teamId}
  return `https://api.fifa.com/api/v3/picture/teams-sq-1/${teamId}`;
}

/**
 * Transform API match to component-friendly format
 */
function transformMatch(match: MatchAPIItem): Match {
  const homeTeamName = match.Home?.TeamName
    ? getTeamName(match.Home.TeamName)
    : match.Home?.ShortClubName || "TBD";
  const awayTeamName = match.Away?.TeamName
    ? getTeamName(match.Away.TeamName)
    : match.Away?.ShortClubName || "TBD";

  let competitionName = "Competition";
  if (match.CompetitionName && match.CompetitionName.length > 0) {
    competitionName = getTeamName(match.CompetitionName);
  } else if (match.StageName && match.StageName.length > 0) {
    competitionName = getTeamName(match.StageName);
  }

  const seasonName = match.SeasonName && match.SeasonName.length > 0
    ? getTeamName(match.SeasonName)
    : undefined;

  // Format competition logo URL
  const competitionLogo = match.IdCompetition
    ? `https://api.fifa.com/api/v3/picture/competitions-sq-4/${match.IdCompetition}`
    : undefined;

  return {
    id: match.IdMatch,
    homeTeam: homeTeamName,
    homeTeamAbbr: match.Home?.Abbreviation || homeTeamName.substring(0, 3).toUpperCase(),
    homeTeamLogo: formatTeamLogo(match.Home?.IdTeam),
    homeScore: match.HomeTeamScore ?? match.Home?.Score,
    awayTeam: awayTeamName,
    awayTeamAbbr: match.Away?.Abbreviation || awayTeamName.substring(0, 3).toUpperCase(),
    awayTeamLogo: formatTeamLogo(match.Away?.IdTeam),
    awayScore: match.AwayTeamScore ?? match.Away?.Score,
    time: match.Date,
    date: match.Date,
    status: getMatchStatus(match.MatchStatus),
    statusCode: match.MatchStatus,
    competition: competitionName,
    competitionId: match.IdCompetition,
    competitionLogo,
    seasonName,
    matchDay: match.MatchDay ? parseInt(match.MatchDay, 10) : undefined,
    venue: match.Stadium?.Name && match.Stadium.Name.length > 0
      ? getTeamName(match.Stadium.Name)
      : undefined,
    winner: match.Winner,
  };
}

/**
 * Extract competition metadata from raw API matches
 */
function extractCompetitionMetadata(matches: MatchAPIItem[]): Map<string, CompetitionMetadata> {
  const metadata = new Map<string, CompetitionMetadata>();

  matches.forEach((match) => {
    if (match.IdCompetition && match.IdSeason && match.IdStage) {
      const key = match.IdCompetition;
      if (!metadata.has(key)) {
        const competitionName = match.CompetitionName && match.CompetitionName.length > 0
          ? getTeamName(match.CompetitionName)
          : match.StageName && match.StageName.length > 0
            ? getTeamName(match.StageName)
            : "Competition";

        metadata.set(key, {
          competitionId: match.IdCompetition,
          seasonId: match.IdSeason,
          stageId: match.IdStage,
          competitionName,
        });
      }
    }
  });

  return metadata;
}

/**
 * Extract last 5 match results (form) from MatchResults array
 */
function extractForm(matchResults: any[] | undefined, teamId: string): ("W" | "D" | "L" | "-")[] {
  if (!matchResults || matchResults.length === 0) {
    return ["-", "-", "-", "-", "-"];
  }

  // Filter only played matches (Result !== 3) and sort by date descending
  const playedMatches = matchResults
    .filter((m) => m.Result !== 3 && (m.HomeTeamScore !== null || m.AwayTeamScore !== null))
    .sort((a, b) => new Date(b.StartTime).getTime() - new Date(a.StartTime).getTime())
    .slice(0, 5);

  const form: ("W" | "D" | "L" | "-")[] = [];

  for (let i = 0; i < 5; i++) {
    if (i >= playedMatches.length) {
      form.push("-");
    } else {
      const match = playedMatches[i];
      const isHome = match.HomeTeamId === teamId;
      const homeScore = match.HomeTeamScore ?? 0;
      const awayScore = match.AwayTeamScore ?? 0;

      if (homeScore === awayScore) {
        form.push("D");
      } else if (isHome) {
        form.push(homeScore > awayScore ? "W" : "L");
      } else {
        form.push(awayScore > homeScore ? "W" : "L");
      }
    }
  }

  return form;
}

/**
 * Transform standings data to component-friendly format
 */
function transformStandings(data: StandingsAPIResponse | null): Standing[] {
  if (!data) return [];

  const entries = data.Groups?.[0]?.Entries || data.Results || [];

  return entries.map((entry) => {
    // Use team ID to build the logo URL
    const teamId = entry.Team?.IdTeam || entry.IdTeam;
    const teamLogo = teamId
      ? `https://api.fifa.com/api/v3/picture/teams-sq-1/${teamId}`
      : undefined;

    // Get team name with multiple fallbacks
    // API returns Team.Name (not Team.TeamName) for standings
    let teamName = "Unknown";
    if (entry.Team?.Name && entry.Team.Name.length > 0) {
      teamName = getTeamName(entry.Team.Name);
    } else if (entry.Team?.TeamName && entry.Team.TeamName.length > 0) {
      // Fallback to TeamName if Name is not available
      teamName = getTeamName(entry.Team.TeamName);
    } else if (entry.Team?.ShortClubName) {
      teamName = entry.Team.ShortClubName;
    } else if (entry.Team?.Abbreviation) {
      teamName = entry.Team.Abbreviation;
    }

    // Get abbreviation with fallbacks
    const teamAbbr = entry.Team?.Abbreviation || 
                     entry.Team?.ShortClubName?.substring(0, 3).toUpperCase() || 
                     teamName.substring(0, 3).toUpperCase() || 
                     "UNK";

    // Get goal difference (API sometimes has typo "GoalsDiference")
    const goalDiff = entry.GoalsDifference ?? entry.GoalsDiference ?? (entry.For - entry.Against);

    // Extract form from MatchResults
    const form = extractForm(entry.MatchResults, teamId);

    return {
      position: entry.Position,
      team: teamName,
      teamId,
      teamAbbr,
      teamLogo,
      played: entry.Played,
      won: entry.Won,
      drawn: entry.Drawn,
      lost: entry.Lost,
      goalsFor: entry.For,
      goalsAgainst: entry.Against,
      goalDiff,
      points: entry.Points,
      form,
    };
  });
}

/**
 * Extract date string in YYYY-MM-DD format from ISO date string
 */
function extractDateString(dateString: string): string {
  if (!dateString) return "";
  const match = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

/**
 * Group matches by competition ID and date
 */
function groupMatchesByCompetitionLocal(matches: Match[]): MatchesByCompetition[] {
  const grouped = new Map<string, Match[]>();

  matches.forEach((match) => {
    const dateStr = extractDateString(match.date);
    const competitionKey = match.competitionId || match.competition;
    const groupKey = `${competitionKey}|${dateStr}`;

    const existing = grouped.get(groupKey) || [];
    existing.push(match);
    grouped.set(groupKey, existing);
  });

  return Array.from(grouped.entries()).map(([key, groupMatches]) => {
    const firstMatch = groupMatches[0];
    const dateStr = extractDateString(firstMatch.date);

    const sortedMatches = [...groupMatches].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return {
      competition: firstMatch.competition,
      competitionId: firstMatch.competitionId,
      competitionLogo: firstMatch.competitionLogo,
      seasonName: firstMatch.seasonName,
      matchDay: firstMatch.matchDay,
      date: dateStr,
      matches: sortedMatches,
    };
  }).sort((a, b) => {
    // Sort groups by competition name first
    const nameCompare = a.competition.localeCompare(b.competition);
    if (nameCompare !== 0) return nameCompare;

    // If competition names are the same, sort by date (fewer days first)
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;

    // If dates are also the same, sort by matchDay
    return (a.matchDay || 0) - (b.matchDay || 0);
  });
}

// Modal state type
type StandingsModalState = {
  isOpen: boolean;
  standings: Standing[];
  competition: string;
  competitionLogo?: string;
  seasonName?: string;
};

export default function MatchCentreClient({ locale, dict }: MatchCentreClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [matches, setMatches] = useState<MatchesByCompetition[]>([]);
  const [competitionMetadata, setCompetitionMetadata] = useState<Record<string, CompetitionMetadata>>({});
  const [expandedCompetitions, setExpandedCompetitions] = useState<Set<string>>(new Set());
  const [standingsMap, setStandingsMap] = useState<Record<string, Standing[]>>({});
  const [loadingStandings, setLoadingStandings] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"men" | "women">("men");
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState<string | null>(null);
  
  // Standings modal state
  const [standingsModal, setStandingsModal] = useState<StandingsModalState>({
    isOpen: false,
    standings: [],
    competition: "",
  });

  // Open standings modal handler
  const openStandingsModal = (
    standings: Standing[],
    competition: string,
    competitionLogo?: string,
    seasonName?: string
  ) => {
    setStandingsModal({
      isOpen: true,
      standings,
      competition,
      competitionLogo,
      seasonName,
    });
  };

  // Close standings modal handler
  const closeStandingsModal = () => {
    setStandingsModal((prev) => ({ ...prev, isOpen: false }));
  };

  /**
   * Helper function to check if a match falls on the selected date in user's local timezone
   */
  const isMatchOnSelectedDate = (matchDate: string, selectedDay: Date): boolean => {
    // Parse the match date (could be ISO string like "2026-01-26T02:00:00Z" or local date "2026-01-26")
    const matchDateTime = new Date(matchDate);

    // Get the local date components for both dates
    const matchLocalDate = new Date(
      matchDateTime.getFullYear(),
      matchDateTime.getMonth(),
      matchDateTime.getDate()
    );

    const selectedLocalDate = new Date(
      selectedDay.getFullYear(),
      selectedDay.getMonth(),
      selectedDay.getDate()
    );

    // Compare dates (ignoring time)
    return matchLocalDate.getTime() === selectedLocalDate.getTime();
  };

  /**
   * Helper function to format match time in user's local timezone
   */
  const formatMatchTimeLocal = (match: { date: string; time: string; status?: string; winner?: string | null; statusCode?: number }): string => {
    // For live matches or completed matches (determined by statusCode === 0), use the existing time field
    if (match.status === "live" || (match as any).statusCode === 0) {
      return match.time;
    }

    // For scheduled matches, convert UTC date to local time
    try {
      const matchDate = new Date(match.date);
      return matchDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      // Fallback to original time if parsing fails
      return match.time;
    }
  };

  /**
   * Helper function to check if a competition ID is numeric (not alphanumeric)
   */
  const isNumericCompetitionId = (competitionId?: string): boolean => {
    if (!competitionId) return false;
    // Check if the string contains only digits
    return /^\d+$/.test(competitionId);
  };

  /**
   * Helper function to filter matches by selected date in local timezone
   * and re-group by competition + matchDay
   */
  const filterMatchesByLocalDate = (
    matchGroups: MatchesByCompetition[],
    selectedDay: Date
  ): MatchesByCompetition[] => {
    // First, flatten all matches and filter by local date AND numeric competitionId
    const allFilteredMatches = matchGroups.flatMap((group) =>
      group.matches
        .filter((match) =>
          isMatchOnSelectedDate(match.date, selectedDay) &&
          isNumericCompetitionId(match.competitionId)
        )
        .map((match) => ({
          ...match,
          // Preserve group metadata for regrouping
          _competitionLogo: group.competitionLogo,
          _seasonName: group.seasonName,
        }))
    );

    // Re-group by competitionId + matchDay (to avoid duplicate sections)
    const grouped = new Map<string, {
      competition: string;
      competitionId?: string;
      competitionLogo?: string;
      seasonName?: string;
      matchDay?: number;
      matches: typeof allFilteredMatches;
    }>();

    allFilteredMatches.forEach((match) => {
      // Create group key: competitionId + matchDay (or just competitionId if no matchDay)
      const competitionKey = match.competitionId || match.competition;
      const matchDayKey = match.matchDay !== undefined ? `-md${match.matchDay}` : '';
      const groupKey = `${competitionKey}${matchDayKey}`;

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, {
          competition: match.competition,
          competitionId: match.competitionId,
          competitionLogo: (match as any)._competitionLogo,
          seasonName: (match as any)._seasonName || match.seasonName,
          matchDay: match.matchDay,
          matches: [],
        });
      }

      grouped.get(groupKey)!.matches.push(match);
    });

    // Get the selected date in YYYY-MM-DD format
    const year = selectedDay.getFullYear();
    const month = String(selectedDay.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDay.getDate()).padStart(2, '0');
    const localDateStr = `${year}-${month}-${day}`;

    // Convert to array and sort matches within each group by time
    return Array.from(grouped.values())
      .map((group) => ({
        competition: group.competition,
        competitionId: group.competitionId,
        competitionLogo: group.competitionLogo,
        seasonName: group.seasonName,
        matchDay: group.matchDay,
        date: localDateStr,
        matches: group.matches
          .map(({ _competitionLogo, _seasonName, ...match }) => match as any)
          .sort((a, b) => {
            // Sort by match time (using the UTC date for consistent ordering)
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }),
      }))
      .sort((a, b) => {
        // Sort groups by competition name first
        const nameCompare = a.competition.localeCompare(b.competition);
        if (nameCompare !== 0) return nameCompare;

        // If competition names are the same, sort by date (fewer days first)
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;

        // If dates are also the same, sort by matchDay
        return (a.matchDay || 0) - (b.matchDay || 0);
      });
  };

  // Fetch matches when date or tab changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Calculate date range: fetch 1 day before and 1 day after to handle timezone differences
        // This ensures we capture all matches that might appear on the selected date in any timezone
        const prevDay = new Date(selectedDate);
        prevDay.setDate(prevDay.getDate() - 1);

        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Format dates in UTC
        const formatDateUTC = (date: Date): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const from = `${formatDateUTC(prevDay)}T00:00:00Z`;
        const to = `${formatDateUTC(nextDay)}T23:59:59Z`;

        // Fetch matches directly from FIFA API
        const response = await fetch(
          `${FIFA_CALENDAR_API}/matches?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&language=${locale}&count=500`,
          { headers: FIFA_API_HEADERS }
        );

        if (response.ok) {
          const data = await response.json();
          const rawMatches: MatchAPIItem[] = data.Results || [];

          // Transform raw matches to our format
          const transformedMatches = rawMatches.map(transformMatch);

          // Group matches by competition
          const groupedMatches = groupMatchesByCompetitionLocal(transformedMatches);

          // Extract competition metadata
          const metadataMap = extractCompetitionMetadata(rawMatches);
          const metadata: Record<string, CompetitionMetadata> = {};
          metadataMap.forEach((value, key) => {
            metadata[key] = value;
          });

          // Filter matches to only show those on the selected date in user's local timezone
          const filteredMatchesData = filterMatchesByLocalDate(groupedMatches, selectedDate);

          setMatches(filteredMatchesData);
          setCompetitionMetadata(metadata);

          // Clear old standings when matches change (different date = different competitions/seasons)
          setStandingsMap({});
          setLoadingStandings(new Set());

          // Automatically expand all competitions that have IDs
          const allCompetitionIds = new Set<string>();
          filteredMatchesData.forEach((group: MatchesByCompetition) => {
            if (group.competitionId && metadata[group.competitionId]) {
              allCompetitionIds.add(group.competitionId);
            }
          });
          setExpandedCompetitions(allCompetitionIds);
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
        setMatches([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, activeTab, locale]);

  // Fetch standings for all competitions automatically
  useEffect(() => {
    const fetchStandingsForCompetitions = async () => {
      // Mark all competitions as loading
      setLoadingStandings(new Set(expandedCompetitions));

      // Always fetch fresh standings for current competitions (don't use cache)
      // This ensures standings update when date/competitions change
      const promises = Array.from(expandedCompetitions).map(async (competitionId) => {
        const metadata = competitionMetadata[competitionId];
        if (!metadata) {
          setLoadingStandings((prev) => {
            const newSet = new Set(prev);
            newSet.delete(competitionId);
            return newSet;
          });
          return null;
        }

        try {
          // Fetch standings directly from FIFA API
          const response = await fetch(
            `${FIFA_CALENDAR_API}/${metadata.competitionId}/${metadata.seasonId}/${metadata.stageId}/standing?language=${locale}&count=200`,
            { headers: FIFA_API_HEADERS }
          );

          if (response.ok) {
            const data: StandingsAPIResponse = await response.json();
            const standings = transformStandings(data);
            return { competitionId, standings };
          }
          return { competitionId, standings: [] };
        } catch (error) {
          console.error(`Error fetching standings for ${competitionId}:`, error);
          return { competitionId, standings: [] };
        } finally {
          setLoadingStandings((prev) => {
            const newSet = new Set(prev);
            newSet.delete(competitionId);
            return newSet;
          });
        }
      });

      const results = await Promise.all(promises);
      const updates: Record<string, Standing[]> = {};
      results.forEach((result) => {
        if (result) {
          updates[result.competitionId] = result.standings;
        }
      });

      // Always update standings map (even if empty) to clear old data
      setStandingsMap(updates);
    };

    if (expandedCompetitions.size > 0 && Object.keys(competitionMetadata).length > 0) {
      fetchStandingsForCompetitions();
    }
  }, [expandedCompetitions, competitionMetadata, locale]);

  // Poll latest match scores every 30 seconds and update existing matches in-place
  useEffect(() => {
    let mounted = true;

    const fetchLatestScores = async () => {
      try {
        // Build from/to range around selected date (same as initial fetch)
        const prevDay = new Date(selectedDate);
        prevDay.setDate(prevDay.getDate() - 1);

        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const formatDateUTC = (date: Date): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const from = `${formatDateUTC(prevDay)}T00:00:00Z`;
        const to = `${formatDateUTC(nextDay)}T23:59:59Z`;

        const response = await fetch(
          `${FIFA_CALENDAR_API}/matches?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&language=${locale}&count=500`,
          { headers: FIFA_API_HEADERS }
        );

        if (!mounted || !response.ok) return;

        const data = await response.json();
        const rawMatches: MatchAPIItem[] = data.Results || [];
        const transformed = rawMatches.map(transformMatch);

        // Map by match id for quick lookup
        const updatesById = new Map<string | number, Match>();
        transformed.forEach((m) => updatesById.set(m.id, m));

        // Update scores in existing grouped matches without restructuring groups
        setMatches((prevGroups) =>
          prevGroups.map((group) => ({
            ...group,
            matches: group.matches.map((match) => {
              const latest = updatesById.get(match.id);
              if (!latest) return match;
              // Only update score/time/status/winner fields to avoid jarring UI changes
              return {
                ...match,
                homeScore: latest.homeScore,
                awayScore: latest.awayScore,
                time: latest.time,
                status: latest.status,
                winner: latest.winner,
              };
            }),
          }))
        );
      } catch (err) {
        // silent fail - do not disturb UI if polling fails
        // console.debug("Polling error:", err);
      }
    };

    // Start immediate fetch then poll every 30s
    fetchLatestScores();
    const id = setInterval(fetchLatestScores, 30_000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [selectedDate, locale]);

  // Filter matches based on live toggle and search
  const filteredMatches = matches
    .map((group) => ({
      ...group,
      matches: group.matches.filter((match) => {
        if (showLiveOnly && match.status !== "live") return false;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            match.homeTeam.toLowerCase().includes(query) ||
            match.awayTeam.toLowerCase().includes(query) ||
            match.competition.toLowerCase().includes(query)
          );
        }
        return true;
      }),
    }))
    .filter((group) => group.matches.length > 0);

  // Count live matches
  const liveCount = matches.reduce(
    (count, group) => count + group.matches.filter((m) => m.status === "live").length,
    0
  );

  return (
    <>
      {/* Page Header */}
      <div className="bg-fifa-header text-white py-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold italic">Match Score</h1>

            {/* Gender Toggle */}
            <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
              <button
                onClick={() => setActiveTab("men")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "men"
                  ? "bg-white text-fifa-header"
                  : "text-white hover:bg-white/10"
                  }`}
              >
                MEN
              </button>
              <button
                onClick={() => setActiveTab("women")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "women"
                  ? "bg-white text-fifa-header"
                  : "text-white hover:bg-white/10"
                  }`}
              >
                WOMEN
              </button>
            </div>

            {/* Matches Tab */}
            <div className="sm:ml-8">
              <span className="text-sm font-medium border-b-2 border-white pb-2">
                MATCHES
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search for a competition or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Filters Bar */}
      <div className="bg-white border-b">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Live Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showLiveOnly}
                    onChange={(e) => setShowLiveOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-12 h-6 rounded-full transition-colors ${showLiveOnly ? "bg-brand-blue" : "bg-gray-200"
                      }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showLiveOnly ? "translate-x-6" : ""
                        }`}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Live<span className="text-gray-400">({liveCount})</span>
                </span>
              </label>

              {/* Change Day Button */}
              <button
                onClick={() => {
                  const d = selectedDate || new Date();
                  const yyyy = d.getFullYear();
                  const mm = String(d.getMonth() + 1).padStart(2, "0");
                  const dd = String(d.getDate()).padStart(2, "0");
                  setCalendarDate(`${yyyy}-${mm}-${dd}`);
                  setShowCalendar(true);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                CHANGE DAY
              </button>

              {/* Calendar Modal */}
              {showCalendar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setShowCalendar(false)} />
                  <div className="relative bg-white rounded-xl w-96 p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-navy-950 mb-4">Select Date</h3>
                    <input
                      type="date"
                      value={calendarDate ?? ""}
                      onChange={(e) => setCalendarDate(e.target.value)}
                      className="w-full border border-gray-200 rounded px-3 py-2 mb-4"
                    />
                    <div className="flex items-center gap-2 justify-between">
                      <button
                        onClick={() => {
                          const today = new Date();
                          const yyyy = today.getFullYear();
                          const mm = String(today.getMonth() + 1).padStart(2, "0");
                          const dd = String(today.getDate()).padStart(2, "0");
                          const iso = `${yyyy}-${mm}-${dd}`;
                          setCalendarDate(iso);
                          // Immediately apply today and close modal
                          setSelectedDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
                          setShowCalendar(false);
                        }}
                        className="px-4 py-2 border rounded text-sm font-medium text-gray-700"
                      >
                        GO TO TODAY
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowCalendar(false)}
                          className="px-4 py-2 rounded border text-sm font-medium text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (calendarDate) {
                              const parts = calendarDate.split("-");
                              const newDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                              setSelectedDate(newDate);
                            }
                            setShowCalendar(false);
                          }}
                          className="px-4 py-2 bg-brand-blue text-white rounded text-sm font-medium"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sort/Filter buttons removed per UX request */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <MatchList
            matchGroups={[]}
            isLoading={isLoading}
          />
        ) : filteredMatches.length === 0 ? (
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-navy-950 mb-2">No matches scheduled</h3>
            <p className="text-gray-500">There are no matches scheduled for this date.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMatches.map((group) => {
              const metadata = group.competitionId ? competitionMetadata[group.competitionId] : null;
              const standings = group.competitionId ? standingsMap[group.competitionId] || [] : [];
              const isLoadingStandings = group.competitionId ? loadingStandings.has(group.competitionId) : false;

              // Format date for display - use the selected date since matches are already filtered
              const displayDate = (() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const selected = new Date(selectedDate);
                selected.setHours(0, 0, 0, 0);

                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                if (selected.getTime() === today.getTime()) {
                  return "Today";
                } else if (selected.getTime() === tomorrow.getTime()) {
                  return "Tomorrow";
                } else if (selected.getTime() === yesterday.getTime()) {
                  return "Yesterday";
                } else {
                  return selected.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  });
                }
              })();

              return (
                <div
                  key={`${group.competitionId || group.competition}-${group.date}`}
                  className="flex flex-col lg:flex-row gap-6"
                >
                  {/* Competition Matches - Left Side */}
                  <div className="flex-1">
                    <div className="bg-[#e8f4fc] rounded-lg overflow-hidden shadow-sm">
                      {/* Competition Header */}
                      <div className="flex items-start px-6 py-3 relative">
                        {/* Competition Logo */}
                        <div className="absolute left-6 top-5">
                          {group.competitionLogo ? (
                            <img
                              src={group.competitionLogo}
                              alt={group.competition}
                              className="w-12 h-12 object-contain"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement | null;
                                if (target) target.src = "/images/fallback.png";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center border border-white/20 shadow-sm">
                              <span className="text-white text-sm font-bold">
                                {group.competition.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Competition Info - Centered */}
                        <div className="flex-1 text-center">
                          <h3 className="text-lg md:text-xl font-extrabold text-navy-950 tracking-tight">{group.competition}</h3>
                          <div className="w-64 border-t border-gray-300 mx-auto my-3 opacity-80" />
                          <div className="flex flex-col items-center gap-1 mt-1">
                            {group.matchDay ? (
                              <>
                                {displayDate !== "Today" && (
                                  <p className="text-sm text-gray-600 mt-0 mb-0 leading-tight">{displayDate}</p>
                                )}
                                <div className="mt-1">
                                  <span className="inline-block bg-white/60 text-gray-600 px-3 py-1 rounded-full text-sm font-medium border border-gray-200 shadow-sm">Match Day {group.matchDay}</span>
                                </div>
                              </>
                            ) : (
                              <p className="text-sm text-gray-600 mt-0 mb-0 leading-tight">{displayDate}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Match Rows */}
                      <div className="bg-white mx-0">
                        {group.matches.map((match) => {
                          const isLive = match.status === "live";
                          const isFinished = match.statusCode === 0;

                          return (
                            <div key={match.id} className="flex items-center py-4 px-6 hover:bg-blue-50/50 transition-colors border-t border-gray-200/60">
                              {/* Home Team */}
                              <div className="flex-1 flex items-center justify-end gap-3">
                                <span className="text-sm font-medium text-navy-950 text-right">
                                  {match.homeTeam}
                                </span>
                                {match.homeTeamLogo ? (
                                  <img
                                    src={match.homeTeamLogo}
                                    alt={match.homeTeam}
                                    className="w-7 h-7 object-contain"
                                    onError={(e) => {
                                      const target = e.currentTarget as HTMLImageElement | null;
                                      if (target) target.src = "/images/fallback.png";
                                    }}
                                  />
                                ) : (
                                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
                                    {match.homeTeamAbbr?.substring(0, 2) || "??"}
                                  </div>
                                )}
                              </div>

                              {/* Score / Time */}
                              <div className="w-28 text-center px-4">
                                {isFinished ? (
                                  <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-semibold text-white bg-navy-950 px-2 py-0.5 rounded mb-1">
                                      FT
                                    </span>
                                    <div className="flex items-center justify-center gap-2">
                                      <span className="text-base font-bold text-navy-950">
                                        {match.homeScore ?? 0}
                                      </span>
                                      <span className="text-gray-400">-</span>
                                      <span className="text-base font-bold text-navy-950">
                                        {match.awayScore ?? 0}
                                      </span>
                                    </div>
                                  </div>
                                ) : isLive ? (
                                  <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-semibold text-white bg-red-600 px-2 py-0.5 rounded mb-1 animate-pulse">
                                      LIVE
                                    </span>
                                    <div className="flex items-center justify-center gap-2">
                                      <span className="text-base font-bold text-red-600">
                                        {match.homeScore ?? 0}
                                      </span>
                                      <span className="text-gray-400">-</span>
                                      <span className="text-base font-bold text-red-600">
                                        {match.awayScore ?? 0}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-base font-semibold text-navy-950">
                                    {formatMatchTimeLocal(match)}
                                  </span>
                                )}
                              </div>

                              {/* Away Team */}
                              <div className="flex-1 flex items-center gap-3">
                                {match.awayTeamLogo ? (
                                  <img
                                    src={match.awayTeamLogo}
                                    alt={match.awayTeam}
                                    className="w-7 h-7 object-contain"
                                    onError={(e) => {
                                      const target = e.currentTarget as HTMLImageElement | null;
                                      if (target) target.src = "/images/fallback.png";
                                    }}
                                  />
                                ) : (
                                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
                                    {match.awayTeamAbbr?.substring(0, 2) || "??"}
                                  </div>
                                )}
                                <span className="text-sm font-medium text-navy-950">
                                  {match.awayTeam}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Standings Panel - Right Side (only if competition has ID) */}
                  {group.competitionId && metadata && (
                    <div className="lg:w-80 xl:w-96 flex-shrink-0">
                      <StandingsPanel
                        standings={standings}
                        competition={metadata.competitionName}
                        competitionLogo={group.competitionLogo}
                        isLoading={isLoadingStandings}
                        onShowTable={() => openStandingsModal(
                          standings,
                          metadata.competitionName,
                          group.competitionLogo,
                          group.seasonName
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Standings Modal */}
      <StandingsModal
        isOpen={standingsModal.isOpen}
        onClose={closeStandingsModal}
        standings={standingsModal.standings}
        competition={standingsModal.competition}
        competitionLogo={standingsModal.competitionLogo}
        seasonName={standingsModal.seasonName}
      />
    </>
  );
}

