import HeroCarousel from "./HeroCarousel";
import StoryGrid from "@/components/StoryGrid";
import Rankings from "@/components/Rankings";
import InsideFIFA from "@/components/InsideFIFA";
import UpcomingTournaments from "@/components/UpcomingTournaments";
import type { InsideFIFAData, RankingData } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries";

type Props = {
    slides: any[];
    stories: any[];
    rankings: RankingData;
    insideFIFA: InsideFIFAData;
    upcomingTournaments: any;
    dict: Dictionary;
};

export default function WorldCupHome({ slides, stories, rankings, insideFIFA, upcomingTournaments, dict }: Props) {
    return (
        <>
            <HeroCarousel slides={slides} />
            <StoryGrid stories={stories} dict={dict} />
            <Rankings
                men={rankings.men}
                women={rankings.women}
                mensLastUpdate={rankings.mensLastUpdate}
                womensLastUpdate={rankings.womensLastUpdate}
                dict={dict}
            />
            <InsideFIFA data={insideFIFA} />
            <UpcomingTournaments data={upcomingTournaments} />
        </>
    );
}
