import type { FIFAPageResponse, CarouselSlide, NewsResponse, Story, RankingsResponse, RankingRow, RankingsData, PromoCarouselResponse, InsideFIFAData, InsideFIFAItem } from "./types";

const FIFA_API_BASE = "https://cxm-api.fifa.com/fifaplusweb/api/pages";
const FIFA_SECTIONS_API = "https://cxm-api.fifa.com/fifaplusweb/api/sections";

// Common headers for FIFA API requests
const FIFA_API_HEADERS = {
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Origin": "https://www.fifa.com",
  "Referer": "https://www.fifa.com/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
};

/**
 * Fetch FIFA homepage data for a specific locale
 */
export async function fetchFIFAPage(locale: string): Promise<FIFAPageResponse | null> {
  try {
    const response = await fetch(`${FIFA_API_BASE}/${locale}`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: FIFA_API_HEADERS,
    });

    if (!response.ok) {
      console.error(`Failed to fetch FIFA page: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching FIFA page:", error);
    return null;
  }
}

/**
 * Extract hero carousel slides from FIFA API response
 */
export function extractHeroSlides(data: FIFAPageResponse | null): CarouselSlide[] {
  if (!data) return [];

  // Find the heroSection in sections
  const heroSection = data.sections.find(
    (section) => section.entryType === "heroSection" && section.heroSection
  );

  if (!heroSection?.heroSection?.heroItems) {
    return [];
  }

  return heroSection.heroSection.heroItems.map((item) => ({
    id: item.entryId,
    eyebrow: item.roofline,
    title: item.title,
    subtitle: item.description || "",
    cta: item.ctaButtonText || "Read more",
    image: item.heroImage?.src || "",
    imageMobile: item.heroImageMobile?.src || item.heroImage?.src || "",
    category: item.rooflineSecondary || "",
    link: item.readMorePageUrl || "#",
  }));
}

/**
 * Fetch hero carousel data for a locale
 */
export async function fetchHeroSlides(locale: string): Promise<CarouselSlide[]> {
  const pageData = await fetchFIFAPage(locale);
  return extractHeroSlides(pageData);
}

/**
 * Fetch news/top stories from FIFA API
 */
export async function fetchNewsSection(locale: string, limit: number = 20): Promise<NewsResponse | null> {
  try {
    const response = await fetch(
      `${FIFA_SECTIONS_API}/news/5TSUVautxNVjLKkYs8bCON?locale=${locale}&limit=${limit}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: FIFA_API_HEADERS,
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch news: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching news:", error);
    return null;
  }
}

/**
 * Extract and transform stories from news response
 */
export function extractStories(data: NewsResponse | null): Story[] {
  if (!data?.items) return [];

  return data.items.map((item) => ({
    id: item.entryId,
    eyebrow: item.roofline,
    title: item.title,
    summary: item.previewText || "",
    image: item.image?.src || "",
    link: item.articlePageUrl || "#",
  }));
}

/**
 * Fetch top stories for a locale
 */
export async function fetchTopStories(locale: string, limit: number = 20): Promise<Story[]> {
  const newsData = await fetchNewsSection(locale, limit);
  return extractStories(newsData);
}

const FIFA_RANKINGS_API = "https://api.fifa.com/api/v3/rankings";

/**
 * Fetch FIFA Rankings from API
 * @param gender - 1 for men, 2 for women
 * @param count - number of teams to fetch
 * @param language - language code
 */
export async function fetchRankings(
  gender: 1 | 2,
  count: number = 5,
  language: string = "en"
): Promise<RankingsResponse | null> {
  try {
    const response = await fetch(
      `${FIFA_RANKINGS_API}?gender=${gender}&count=${count}&language=${language}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour (rankings update less frequently)
        headers: FIFA_API_HEADERS,
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch rankings (gender=${gender}): ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching rankings (gender=${gender}):`, error);
    return null;
  }
}

/**
 * Transform API ranking data to component-friendly format
 */
export function transformRankings(data: RankingsResponse | null): RankingRow[] {
  if (!data?.Results) return [];

  return data.Results.map((team) => {
    const teamName = team.TeamName.find((t) => t.Locale === "en-GB")?.Description 
      || team.TeamName[0]?.Description 
      || "Unknown";
    
    const pointsDiff = team.DecimalTotalPoints - team.DecimalPrevPoints;
    const pointsChange = pointsDiff === 0 
      ? "-" 
      : (pointsDiff > 0 ? `+${pointsDiff.toFixed(2)}` : pointsDiff.toFixed(2));

    return {
      rank: team.Rank,
      team: teamName,
      code: team.IdCountry,
      points: team.DecimalTotalPoints.toFixed(team.DecimalTotalPoints % 1 === 0 ? 0 : 3),
      pointsChange,
      movement: team.RankingMovement,
      prevRank: team.PrevRank,
    };
  });
}

/**
 * Format date string for display
 */
function formatRankingsDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Fetch both men's and women's rankings
 */
export async function fetchAllRankings(language: string = "en"): Promise<RankingsData> {
  const [mensData, womensData] = await Promise.all([
    fetchRankings(1, 5, language),
    fetchRankings(2, 5, language),
  ]);

  const men = transformRankings(mensData);
  const women = transformRankings(womensData);

  // Get last update dates from first result
  const mensLastUpdate = mensData?.Results?.[0]?.PubDate 
    ? formatRankingsDate(mensData.Results[0].PubDate) 
    : "N/A";
  const womensLastUpdate = womensData?.Results?.[0]?.PubDate 
    ? formatRankingsDate(womensData.Results[0].PubDate) 
    : "N/A";

  return {
    men,
    women,
    mensLastUpdate,
    womensLastUpdate,
  };
}

const INSIDE_FIFA_ENTRY_ID = "2afzuqESTl2Q38r85PkCKw";
const UPCOMING_TOURNAMENTS_ENTRY_ID = "1ieWwpV6XXrpmck97gAf9D";

/**
 * Fetch Inside FIFA promo carousel data
 */
export async function fetchInsideFIFA(locale: string): Promise<PromoCarouselResponse | null> {
  try {
    const response = await fetch(
      `${FIFA_SECTIONS_API}/promoCarousel/${INSIDE_FIFA_ENTRY_ID}?locale=${locale}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: FIFA_API_HEADERS,
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch Inside FIFA: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching Inside FIFA:", error);
    return null;
  }
}

/**
 * Transform Inside FIFA API response to component-friendly format
 */
export function transformInsideFIFA(data: PromoCarouselResponse | null): InsideFIFAData {
  if (!data) {
    return {
      title: "Inside FIFA",
      seeAllLabel: "See all",
      seeAllLink: "https://inside.fifa.com/all-stories",
      items: [],
    };
  }

  const items: InsideFIFAItem[] = data.items.map((item) => ({
    id: item.entryId,
    title: item.title,
    image: item.image?.src || "",
    link: item.readMorePageUrl || "#",
    target: item.readMoreTarget || "_blank",
  }));

  return {
    title: data.title || "Inside FIFA",
    seeAllLabel: data.seeAllLabel || "See all",
    seeAllLink: data.seeAllLink || "https://inside.fifa.com/all-stories",
    items,
  };
}

/**
 * Fetch and transform Inside FIFA data for a locale
 */
export async function fetchInsideFIFAData(locale: string): Promise<InsideFIFAData> {
  const data = await fetchInsideFIFA(locale);
  return transformInsideFIFA(data);
}

/**
 * Fetch Upcoming Tournaments promo carousel data
 */
export async function fetchUpcomingTournaments(locale: string): Promise<PromoCarouselResponse | null> {
  try {
    const response = await fetch(
      `${FIFA_SECTIONS_API}/promoCarousel/${UPCOMING_TOURNAMENTS_ENTRY_ID}?locale=${locale}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: FIFA_API_HEADERS,
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch Upcoming Tournaments: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching Upcoming Tournaments:", error);
    return null;
  }
}

/**
 * Transform Upcoming Tournaments API response to component-friendly format
 */
export function transformUpcomingTournaments(data: PromoCarouselResponse | null): InsideFIFAData {
  if (!data) {
    return {
      title: "Upcoming tournaments & events",
      seeAllLabel: "See all",
      seeAllLink: "/en/tournaments",
      items: [],
    };
  }

  const items: InsideFIFAItem[] = data.items.map((item) => ({
    id: item.entryId,
    title: item.title,
    image: item.image?.src || "",
    link: item.readMorePageUrl || "#",
    target: "_self", // Internal links
  }));

  return {
    title: data.title || "Upcoming tournaments & events",
    seeAllLabel: data.seeAllLabel || "See all",
    seeAllLink: data.seeAllLink || "/en/tournaments",
    items,
  };
}

/**
 * Fetch and transform Upcoming Tournaments data for a locale
 */
export async function fetchUpcomingTournamentsData(locale: string): Promise<InsideFIFAData> {
  const data = await fetchUpcomingTournaments(locale);
  return transformUpcomingTournaments(data);
}

// ============================================
// Match Centre API Functions
// ============================================

import type { 
  MatchesAPIResponse, 
  MatchAPIItem, 
  Match, 
  MatchesByCompetition,
  StandingsAPIResponse,
  Standing,
  TeamNameLocale
} from "./types";

const FIFA_CALENDAR_API = "https://api.fifa.com/api/v3/calendar";

/**
 * Get team name from TeamNameLocale array
 */
function getTeamName(names: TeamNameLocale[], preferredLocale: string = "en-GB"): string {
  if (!names || names.length === 0) return "Unknown";
  const localized = names.find((n) => n.Locale === preferredLocale);
  return localized?.Description || names[0]?.Description || "Unknown";
}

/**
 * Get match status from numeric status code
 */
function getMatchStatus(status: number): "scheduled" | "live" | "finished" {
  // Status codes based on FIFA API:
  // 0 = scheduled/preview
  // 3 = live/in progress
  // 4 = live/in progress (second half)
  // 10+ = finished
  if (status === 0) return "scheduled";
  if (status === 3 || status === 4) return "live";
  if (status >= 10) return "finished";
  return "scheduled"; // Default to scheduled for unknown statuses
}

/**
 * Format match time for display
 */
function formatMatchTime(dateString: string, status: number, matchTime?: string): string {
  if (status === 3 || status === 4) {
    // If matchTime is provided (e.g., "45'", "90+3'"), use it
    return matchTime || "LIVE";
  }
  if (status >= 10) return "FT"; // Finished
  
  // For scheduled matches, show the time
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Fetch matches for a date range
 */
export async function fetchMatches(
  fromDate: string,
  toDate: string,
  language: string = "en",
  count: number = 500
): Promise<MatchesAPIResponse | null> {
  try {
    const from = encodeURIComponent(fromDate);
    const to = encodeURIComponent(toDate);
    
    const response = await fetch(
      `${FIFA_CALENDAR_API}/matches?from=${from}&to=${to}&language=${language}&count=${count}`,
      {
        cache: 'no-store', // Disable caching to always get fresh data
        headers: FIFA_API_HEADERS,
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch matches: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching matches:", error);
    return null;
  }
}

/**
 * Extract date string in YYYY-MM-DD format from ISO date string
 */
function extractDateString(dateString: string): string {
  if (!dateString) return "";
  // Extract YYYY-MM-DD from ISO string (e.g., "2026-01-19T00:00:00Z" -> "2026-01-19")
  const match = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
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
  
  // Get competition name from CompetitionName array
  let competitionName = "Competition";
  if (match.CompetitionName && match.CompetitionName.length > 0) {
    competitionName = getTeamName(match.CompetitionName);
  } else if (match.StageName && match.StageName.length > 0) {
    competitionName = getTeamName(match.StageName);
  }

  // Get season name for match day display
  const seasonName = match.SeasonName && match.SeasonName.length > 0
    ? getTeamName(match.SeasonName)
    : undefined;

  // Format team logo URL - use the FIFA picture API with teams-sq-1 format and size 1
  const formatTeamLogo = (teamId?: string): string | undefined => {
    if (!teamId) return undefined;
    // Use the FIFA picture API pattern: https://api.fifa.com/api/v3/picture/teams-sq-1/{teamId}
    return `https://api.fifa.com/api/v3/picture/teams-sq-1/${teamId}`;
  };

  // Format competition logo URL
  const competitionLogo = match.IdCompetition
    ? `https://api.fifa.com/api/v3/picture/competitions-sq-4/${match.IdCompetition}`
    : undefined;

  return {
    id: match.IdMatch,
    idMatch: match.IdMatch,
    idCompetition: match.IdCompetition,
    idSeason: match.IdSeason,
    idStage: match.IdStage,
    homeTeam: homeTeamName,
    homeTeamAbbr: match.Home?.Abbreviation || homeTeamName.substring(0, 3).toUpperCase(),
    homeTeamLogo: formatTeamLogo(match.Home?.IdTeam),
    homeScore: match.HomeTeamScore ?? match.Home?.Score,
    awayTeam: awayTeamName,
    awayTeamAbbr: match.Away?.Abbreviation || awayTeamName.substring(0, 3).toUpperCase(),
    awayTeamLogo: formatTeamLogo(match.Away?.IdTeam),
    time: formatMatchTime(match.Date, match.MatchStatus, match.MatchTime),
    // Always use the UTC Date field for proper timezone conversion on the client
    // The client will convert this to local timezone for display
    date: match.Date,
    status: getMatchStatus(match.MatchStatus),
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
 * Group matches by competition ID and date
 * Returns matches grouped by competition and date
 */
export function groupMatchesByCompetition(matches: Match[]): MatchesByCompetition[] {
  // Group by competitionId + date combination
  const grouped = new Map<string, Match[]>();
  
  matches.forEach((match) => {
    // Extract date string (YYYY-MM-DD format)
    const dateStr = extractDateString(match.date);
    
    // Create composite key: competitionId + date
    // Use competitionId if available, otherwise fall back to competition name
    const competitionKey = match.competitionId || match.competition;
    const groupKey = `${competitionKey}|${dateStr}`;
    
    const existing = grouped.get(groupKey) || [];
    existing.push(match);
    grouped.set(groupKey, existing);
  });

  return Array.from(grouped.entries()).map(([key, groupMatches]) => {
    const firstMatch = groupMatches[0];
    const dateStr = extractDateString(firstMatch.date);
    
    // Sort matches by time within each group
    const sortedMatches = [...groupMatches].sort((a, b) => {
      const timeA = a.time === "LIVE" ? "00:00" : a.time;
      const timeB = b.time === "LIVE" ? "00:00" : b.time;
      return timeA.localeCompare(timeB);
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

/**
 * Extract competition metadata with IDs from raw API matches
 * This is used to get seasonId and stageId which aren't in the transformed Match type
 */
export function extractCompetitionMetadata(matches: MatchAPIItem[]): Map<string, { competitionId: string; seasonId: string; stageId: string; competitionName: string }> {
  const metadata = new Map<string, { competitionId: string; seasonId: string; stageId: string; competitionName: string }>();
  
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
 * Fetch and transform matches for a date range
 */
export async function fetchMatchesData(
  fromDate: string,
  toDate: string,
  language: string = "en",
  count: number = 500
): Promise<MatchesByCompetition[]> {
  const data = await fetchMatches(fromDate, toDate, language, count);
  
  if (!data?.Results) {
    return [];
  }

  const matches = data.Results.map(transformMatch);
  return groupMatchesByCompetition(matches);
}

/**
 * Get date range for a specific day
 * Format: 2026-01-24T00:00:00Z and 2026-01-26T23:59:59Z
 */
export function getDateRange(date: Date): { from: string; to: string } {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return {
    from: `${year}-${month}-${day}T00:00:00Z`,
    to: `${year}-${month}-${day}T23:59:59Z`,
  };
}

/**
 * Generate array of dates for the date selector
 */
export function generateDateRange(centerDate: Date, daysAround: number = 5): Date[] {
  const dates: Date[] = [];
  
  for (let i = -daysAround; i <= daysAround; i++) {
    const date = new Date(centerDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

/**
 * Format date for display in date selector
 */
export function formatDateForSelector(date: Date, today: Date): { day: string; date: string; isToday: boolean } {
  const isToday = date.toDateString() === today.toDateString();
  
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  return {
    day: isToday ? "TODAY" : dayNames[date.getDay()],
    date: `${date.getDate()} ${months[date.getMonth()]}`,
    isToday,
  };
}

/**
 * Fetch standings for a competition
 */
export async function fetchStandings(
  competitionId: string,
  seasonId: string,
  stageId: string,
  language: string = "en",
  count: number = 200
): Promise<StandingsAPIResponse | null> {
  try {
    const response = await fetch(
      `${FIFA_CALENDAR_API}/${competitionId}/${seasonId}/${stageId}/standing?language=${language}&count=${count}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: FIFA_API_HEADERS,
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch standings: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching standings:", error);
    return null;
  }
}

/**
 * Extract last 5 match results (form) from MatchResults array
 * Returns form with newest match first (will be reversed by component for display)
 */
function extractForm(matchResults: import("./types").StandingMatchResult[] | undefined, teamId: string): ("W" | "D" | "L" | "-")[] {
  if (!matchResults || matchResults.length === 0) {
    return ["-", "-", "-", "-", "-"];
  }

  // Filter only played matches (Result !== 3) and sort by date descending (newest first)
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
export function transformStandings(data: StandingsAPIResponse | null): Standing[] {
  if (!data) return [];

  // Handle both grouped and flat standings
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
 * Fetch and transform standings data
 */
export async function fetchStandingsData(
  competitionId: string,
  seasonId: string,
  stageId: string,
  language: string = "en"
): Promise<Standing[]> {
  const data = await fetchStandings(competitionId, seasonId, stageId, language);
  return transformStandings(data);
}

/**
 * Fetch match details by ID
 * Uses calendar API: /api/v3/calendar/{IdCompetition}/{IdSeason}/{IdMatch}
 */
export async function fetchMatchDetails(
  idCompetition: string,
  idSeason: string,
  idStage: string,
  idMatch: string,
  language: string = "en"
): Promise<MatchAPIItem | null> {
  try {
    // Prioritize live API for complete data including lineup
    const FIFA_LIVE_API = "https://api.fifa.com/api/v3/live/football";
    const liveUrl = `${FIFA_LIVE_API}/${idCompetition}/${idSeason}/${idStage}/${idMatch}?language=${language}`;
    
    let response = await fetch(liveUrl, {
      cache: 'no-store',
      headers: {
        ...FIFA_API_HEADERS,
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
      },
    });

    // If live API fails, try calendar API (without idStage)
    if (!response.ok) {
      const calendarUrl = `${FIFA_CALENDAR_API}/${idCompetition}/${idSeason}/${idMatch}?language=${language}`;
      response = await fetch(calendarUrl, {
        cache: 'no-store',
        headers: FIFA_API_HEADERS,
      });
    }

    if (!response.ok) {
      console.error(`Failed to fetch match details: ${response.status}`);
      return null;
    }

    const data = await response.json();
    console.log('Match details API response:', {
      hasLineup: !!(data.HomeTeam?.Players || data.Home?.Players),
      homeTeamPlayers: data.HomeTeam?.Players?.length || data.Home?.Players?.length || 0,
      awayTeamPlayers: data.AwayTeam?.Players?.length || data.Away?.Players?.length || 0,
    });
    
    // The API might return the match directly or wrapped in Results array
    return data.Results?.[0] || data || null;
  } catch (error) {
    console.error("Error fetching match details:", error);
    return null;
  }
}

/**
 * Fetch head-to-head statistics and historical matches between two teams
 * API: /api/v3/statistics/headtohead/{teamId1}/{teamId2}
 */
export async function fetchHeadToHead(
  teamId1: string,
  teamId2: string,
  language: string = "en",
  count: number = 10,
  toDate?: string
): Promise<import("./types").HeadToHeadAPIResponse | null> {
  try {
    const FIFA_STATISTICS_API = "https://api.fifa.com/api/v3/statistics";
    let url = `${FIFA_STATISTICS_API}/headtohead/${teamId1}/${teamId2}?language=${language}&count=${count}`;
    // Add 'to' parameter if provided (used to limit matches up to a specific date)
    if (toDate) {
      url += `&to=${encodeURIComponent(toDate)}`;
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers: FIFA_API_HEADERS,
    });

    if (!response.ok) {
      console.error(`Failed to fetch head-to-head: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching head-to-head:", error);
    return null;
  }
}

/**
 * Fetch World Cup 2026 matches
 */
export async function fetchWorldCupMatches(
  language: string = "en",
  count: number = 500
): Promise<MatchesAPIResponse | null> {
  try {
    const response = await fetch(
      `${FIFA_CALENDAR_API}/matches?language=${language}&count=${count}&idSeason=285023`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: FIFA_API_HEADERS,
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch World Cup matches: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching World Cup matches:", error);
    return null;
  }
}

export async function fetchWorldCupHostCountries(
  language: string = "en"
): Promise<any> {
  console.log('Fetching host countries...');
  try {
    console.log('Fetching host countries...');
    const response = await fetch(
      `https://cxm-api.fifa.com/fifaplusweb/api/sections/teamsModule/5XwqLVjelDeqteyJh06Hrm?locale=en&limit=200`
    );
    
    console.log('Host countries API status:', response.status);
    
    if (!response.ok) {
      console.error(`Failed to fetch host countries: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log('Host countries API data:', data);
    return data;
  } catch (error) {
    console.error("Error fetching host countries:", error);
    return null;
  }
}

export async function fetchWorldCupStandings(locale: string = "en") {
  const url = `https://api.fifa.com/api/v3/calendar/17/285023/289273/standing?language=${locale}&count=200`;
  
  try {
    const response = await fetch(url, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch standings: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching World Cup standings:', error);
    return null;
  }
}


// ============================================
// News Page API Functions
// ============================================

/**
 * Fetch news page data for a specific locale
 */
export async function fetchNewsPage(locale: string): Promise<FIFAPageResponse | null> {
  try {
    const response = await fetch(`${FIFA_API_BASE}/${locale}/news`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: FIFA_API_HEADERS,
    });

    if (!response.ok) {
      console.error(`Failed to fetch news page: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching news page:", error);
    return null;
  }
}

/**
 * Fetch a news section by entry ID
 */
export async function fetchNewsSectionByEntryId(
  entryId: string,
  locale: string,
  limit: number = 20
): Promise<NewsResponse | null> {
  try {
    const response = await fetch(
      `${FIFA_SECTIONS_API}/news/${entryId}?locale=${locale}&limit=${limit}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: FIFA_API_HEADERS,
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch news section: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching news section:", error);
    return null;
  }
}

/**
 * Fetch a promo carousel section by entry ID
 */
export async function fetchPromoCarouselSection(
  entryId: string,
  locale: string
): Promise<PromoCarouselResponse | null> {
  try {
    const response = await fetch(
      `${FIFA_SECTIONS_API}/promoCarousel/${entryId}?locale=${locale}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: FIFA_API_HEADERS,
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch promo carousel: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching promo carousel:", error);
    return null;
  }
}

/**
 * Fetch a hero banner section by entry ID
 */
export async function fetchHeroBannerSection(
  entryId: string,
  locale: string
): Promise<any | null> {
  try {
    const response = await fetch(
      `${FIFA_SECTIONS_API}/heroBanner/${entryId}?locale=${locale}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: FIFA_API_HEADERS,
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch hero banner: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching hero banner:", error);
    return null;
  }
}

/**
 * Fetch World Cup 2026 teams data
 */
export async function fetchWorldCupTeams(
  language: string = "en"
): Promise<any> {
  try {
    const response = await fetch(
      `https://cxm-api.fifa.com/fifaplusweb/api/sections/teamsModule/4v5Yng3VdGD9c1cpnOIff1?locale=${language}&limit=200`,
      {
        next: { revalidate: 300 },
        headers: FIFA_API_HEADERS,
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch teams: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching teams:", error);
    return null;
  }
}

export async function fetchPromoCarousel(locale: string = "en"): Promise<any> {
  try {
    const response = await fetch(
      `https://cxm-api.fifa.com/fifaplusweb/api/sections/promoCarousel/4I2aLjy34r0KI0s4PYpCWk?locale=${locale}`,
      {
        next: { revalidate: 300 },
        headers: FIFA_API_HEADERS,
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch promo carousel: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching promo carousel:", error);
    return null;
  }
}