import { Metadata } from "next";
import { fetchWorldCupTeams } from "@/lib/api";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import WorldCupHeader from "@/components/worldcup/WorldCupHeader";
import Teams from "@/components/worldcup/Teams"
import Footer from "@/components/Footer";

type PageProps = {
    params: { locale: string };
};

export default async function TeamsPage({ params }: PageProps) {
    const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
    const dict = getDictionary(locale);

    const teamsData = await fetchWorldCupTeams(locale);

    return (
        <>
            <WorldCupHeader locale={locale} dict={dict} />
            <Teams teamsData={teamsData} dict={dict} />
            <Footer locale={locale} dict={dict} />
        </>
    );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";

    return {
        title: "Teams | FIFA World Cup 2026™",
        description: "View all participating teams for the FIFA World Cup 2026™",
    };
}