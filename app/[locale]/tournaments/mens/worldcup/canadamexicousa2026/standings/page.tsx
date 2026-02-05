import { Metadata } from "next";
import { fetchWorldCupStandings } from "@/lib/api";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import WorldCupHeader from "@/components/worldcup/WorldCupHeader";
import Standings from "@/components/worldcup/Standings";

type PageProps = {
    params: { locale: string };
};

export default async function StandingsPage({ params }: PageProps) {
    const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
    const dict = getDictionary(locale);

    const standingsData = await fetchWorldCupStandings(locale);

    return (
        <>
            <WorldCupHeader locale={locale} dict={dict} />
            <Standings standingsData={standingsData} dict={dict} />
        </>
    );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";

    return {
        title: "Standings | FIFA World Cup 2026™",
        description: "View group standings for the FIFA World Cup 2026™",
    };
}