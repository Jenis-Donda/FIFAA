import CountdownTimer from "@/components/CountdownTimer";
import HeroCarousel from "./HeroCarousel";
import WorldCupMatches from "./WorldCupMatches";
import StoryGrid from "@/components/StoryGrid";
import Rankings from "@/components/Rankings";
import InsideFIFA from "@/components/InsideFIFA";
import UpcomingTournaments from "@/components/UpcomingTournaments";
import type { InsideFIFAData, RankingsData, Match } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import HostCountriesCarousel from "./HostCountriesCarousel";
import WorldCupStandings from "./WorldCupStandings";

type Props = {
    slides: any[];
    stories: any[];
    rankings: RankingsData;
    insideFIFA: InsideFIFAData;
    upcomingTournaments: any;
    matches: Match[];
    dict: Dictionary;
    hostCountries: any[];
    standings: any[];
    locale: Locale;
};

export default function WorldCupHome({ slides, stories, rankings, insideFIFA, upcomingTournaments, matches, dict, hostCountries, standings, locale }: Props) {
    const worldCupStartDate = new Date("2026-06-11T20:00:00Z");

    return (
        <>
            <CountdownTimer
                targetDate={worldCupStartDate}
                title="FIFA World Cup 2026™"
                subtitle="11 June - 19 July 2026"
                logo="https://digitalhub.fifa.com/transform/157d23bf-7e13-4d7b-949e-5d27d340987e/WC26_Logo?&io=transform:fill,height:210&quality=75"
                ctaText="View matches"
                ctaLink="/en/tournaments/mens/football/worldcup2026/scores-fixtures"
            />
            <HeroCarousel slides={slides} />
            <WorldCupMatches matches={matches} />
            <HostCountriesCarousel countries={hostCountries} />
            <WorldCupStandings standings={standings} />
            <StoryGrid stories={stories} dict={dict} />
            <Rankings
                men={rankings.men}
                women={rankings.women}
                mensLastUpdate={rankings.mensLastUpdate}
                womensLastUpdate={rankings.womensLastUpdate}
                dict={dict}
                locale={locale}
            />
            <InsideFIFA data={insideFIFA} />
            <UpcomingTournaments data={upcomingTournaments} />
        </>
    );
}