import { Metadata } from "next";
import { fetchWorldCupMatches, fetchWorldCupStandings } from "@/lib/api";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import ScoresFixtures from "@/components/worldcup/ScoresFixtures";
import WorldCupHeader from "@/components/worldcup/WorldCupHeader";
import type { MatchAPIItem, Match } from "@/lib/types";
import Footer from "@/components/Footer";

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

    const stageName = getTeamName(match.StageName);
    const groupName = match.GroupName ? getTeamName(match.GroupName) : null;

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
        stageName: stageName,
        groupName: groupName,
    };
}

export default async function ScoresFixturesPage({ params }: PageProps) {
    const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
    const dict = getDictionary(locale);

    const [worldCupMatchesData, standingsData] = await Promise.all([
        fetchWorldCupMatches(locale),
        fetchWorldCupStandings(locale),
    ]);

    const matches = worldCupMatchesData?.Results?.map(transformMatch) || [];
    const standings = standingsData?.Results || [];

    return (
        <>
            <WorldCupHeader locale={locale} dict={dict} />
            <ScoresFixtures matches={matches} standings={standings} dict={dict} />
            <Footer locale={locale} dict={dict} />
        </>
    );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";

    return {
        title: "Scores & Fixtures | FIFA World Cup 2026™",
        description: "View all matches, scores and fixtures for the FIFA World Cup 2026™",
    };
}