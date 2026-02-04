import { Metadata } from "next";
import Script from "next/script";
import WorldCupHeader from "@/components/worldcup/WorldCupHeader";
import WorldCupHome from "@/components/worldcup/WorldCupHome";
import { fetchHeroSlides, fetchTopStories, fetchAllRankings, fetchInsideFIFAData, fetchUpcomingTournamentsData, fetchWorldCupMatches, fetchWorldCupHostCountries, fetchWorldCupStandings } from "@/lib/api";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { MatchAPIItem, Match } from "@/lib/types";
import WorldCupStandings from "@/components/worldcup/WorldCupStandings";

type PageProps = {
  params: { locale: string };
};

function transformMatch(match: MatchAPIItem): Match {
  const getTeamName = (names: any[] | undefined) => {
    if (!names || names.length === 0) return "TBD";
    return names.find((n: any) => n.Locale === "en-GB")?.Description || names[0]?.Description || "TBD";
  };

  const formatTeamLogo = (pictureUrl?: string, teamId?: string): string | undefined => {
    if (pictureUrl) {
      return pictureUrl.replace('{format}', 'sq').replace('{size}', '1');
    }
    if (teamId) {
      return `https://api.fifa.com/api/v3/picture/teams-sq-1/${teamId}`;
    }
    return undefined;
  };

  const formatMatchTime = (dateString: string, status: number): string => {
    if (status === 0) return "FT";
    if (status !== 1) return "LIVE";
    
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const homeTeamName = match.Home?.TeamName 
    ? getTeamName(match.Home.TeamName) 
    : match.PlaceHolderA || "TBD";
  const homeTeamAbbr = (match.Home?.Abbreviation || match.PlaceHolderA || "TBD") as string;
  const homeTeamLogo = formatTeamLogo(match.Home?.PictureUrl, match.Home?.IdTeam);

  const awayTeamName = match.Away?.TeamName 
    ? getTeamName(match.Away.TeamName) 
    : match.PlaceHolderB || "TBD";
  const awayTeamAbbr = (match.Away?.Abbreviation || match.PlaceHolderB || "TBD") as string;
  const awayTeamLogo = formatTeamLogo(match.Away?.PictureUrl, match.Away?.IdTeam);

  return {
    id: match.IdMatch,
    idMatch: match.IdMatch,
    idCompetition: match.IdCompetition,
    idSeason: match.IdSeason,
    idStage: match.IdStage,
    homeTeam: homeTeamName,
    homeTeamAbbr: homeTeamAbbr,
    homeTeamLogo: homeTeamLogo,
    homeScore: match.HomeTeamScore ?? match.Home?.Score,
    awayTeam: awayTeamName,
    awayTeamAbbr: awayTeamAbbr,
    awayTeamLogo: awayTeamLogo,
    awayScore: match.AwayTeamScore ?? match.Away?.Score,
    time: formatMatchTime(match.Date, match.MatchStatus),
    date: match.Date,
    status: match.MatchStatus === 1 ? "scheduled" : match.MatchStatus === 0 ? "finished" : "live",
    competition: getTeamName(match.CompetitionName),
    competitionId: match.IdCompetition,
    seasonName: getTeamName(match.SeasonName),
    venue: match.Stadium?.Name ? getTeamName(match.Stadium.Name) : undefined,
    winner: match.Winner,
  };
}

function transformHostCountries(data: any): any[] {
  if (!data?.teams || !Array.isArray(data.teams)) {
    return [];
  }

  const teamsToShow = data.teams;
  
  return teamsToShow.map((team: any) => {
    const flagUrl = team.teamFlag?.replace('{format}', 'sq').replace('{size}', '1');
    
    return {
      name: team.teamName || 'Unknown',
      flag: flagUrl || '/images/fallback.png',
      stage: 'Group Stage',
      group: team.stage || 'N/A',
      worldRanking: team.worldRanking || 0,
      participations: team.appearances || 0,
      color: team.teamEnrichmentData?.primaryColor || '#1E40AF',
      textColor: team.teamEnrichmentData?.primaryTextColor || '#FFFFFF',
      hostTeam: team.hostTeam || false,  // Add this line
    };
  });
}

function transformStandings(data: any): any[] {
  if (!data?.Results || !Array.isArray(data.Results)) {
    return [];
  }

  const groups: { [key: string]: any[] } = {};

  data.Results.forEach((standing: any) => {
    const groupName = standing.Group?.[0]?.Description || 'Unknown';
    
    if (!groups[groupName]) {
      groups[groupName] = [];
    }

    const teamName = standing.Team?.Name?.[0]?.Description || 'TBD';
    const teamAbbr = standing.Team?.Abbreviation || teamName.substring(0, 3).toUpperCase();
    const teamFlag = standing.Team?.PictureUrl?.replace('{format}', 'sq').replace('{size}', '1') || '/images/fallback.png';

    groups[groupName].push({
      position: standing.Position || 0,
      teamName: teamName,
      teamAbbr: teamAbbr,
      teamFlag: teamFlag,
      played: standing.Played || 0,
      won: standing.Won || 0,
      drawn: standing.Drawn || 0,
      lost: standing.Lost || 0,
      goalsFor: standing.For || 0,
      goalsAgainst: standing.Against || 0,
      goalDifference: standing.GoalsDiference || 0,
      points: standing.Points || 0,
    });
  });

  return Object.keys(groups)
    .sort()
    .map(groupName => ({
      groupName,
      teams: groups[groupName].sort((a, b) => a.position - b.position),
    }));
}


export default async function WorldCupHostPage({ params }: PageProps) {
    const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
    const dict = getDictionary(locale);

    const [heroSlides, topStories, rankings, insideFIFA, upcomingTournaments, worldCupMatchesData, hostCountriesData, standingsData] = await Promise.all([
      fetchHeroSlides(locale),
      fetchTopStories(locale, 10),
      fetchAllRankings(locale),
      fetchInsideFIFAData(locale),
      fetchUpcomingTournamentsData(locale),
      fetchWorldCupMatches(locale),
      fetchWorldCupHostCountries(locale),
      fetchWorldCupStandings(locale),
    ]);
    
    const matches = worldCupMatchesData?.Results?.map(transformMatch) || [];
    const hostCountries = transformHostCountries(hostCountriesData);
    const standings = transformStandings(standingsData);
 
    return (
        <>
            <Script
                id="worldcup-schema"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        name: "FIFA World Cup 2026 | FIFA",
                        description: "FIFA World Cup 2026 hosted by Canada, Mexico & USA",
                        inLanguage: locale,
                    }),
                }}
            />
            <WorldCupHeader locale={locale} dict={dict} />
           <WorldCupHome
            slides={heroSlides}
            stories={topStories}
            rankings={rankings}
            insideFIFA={insideFIFA}
            upcomingTournaments={upcomingTournaments}
            matches={matches}
            hostCountries={hostCountries}
            standings={standings}
            dict={dict}
          />
        </>
    );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
    const dict = getDictionary(locale);

    return {
        title: "FIFA World Cup 2026™ | Canada, Mexico & USA",
        description: "The official page for the FIFA World Cup 2026™ hosted by Canada, Mexico and the United States of America",
    };
} 