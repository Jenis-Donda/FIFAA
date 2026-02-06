import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RankingTable from "@/components/RankingTable";
import { fetchRankings, transformRankings } from "@/lib/api";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

type PageProps = {
    params: { locale: string };
};

export default async function WorldRankingsPage({ params }: PageProps) {
    const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
    const dict = getDictionary(locale);

    // Fetch top 50 rankings for both men and women
    const [mensData, womensData] = await Promise.all([
        fetchRankings(1, 50, locale),
        fetchRankings(2, 50, locale),
    ]);

    const men = transformRankings(mensData);
    const women = transformRankings(womensData);

    // Get last update dates from first result
    const formatRankingsDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const mensLastUpdate = mensData?.Results?.[0]?.PubDate
        ? formatRankingsDate(mensData.Results[0].PubDate)
        : "N/A";
    const womensLastUpdate = womensData?.Results?.[0]?.PubDate
        ? formatRankingsDate(womensData.Results[0].PubDate)
        : "N/A";

    return (
        <>
            <Script
                id="rankings-schema"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        name: "FIFA World Rankings",
                        description:
                            "Official FIFA World Rankings for men's and women's national football teams.",
                        primaryImageOfPage: "https://example.com/og.jpg",
                        inLanguage: locale,
                    }),
                }}
            />
            <div className="min-h-screen bg-surface-100">
                <Header locale={locale} dict={dict} />
                <main>
                    {/* Hero Section */}
                    <section className=" text-black py-16">
                        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                                {dict.sections.rankings}
                            </h1>
                            <p className="text-lg text-black/90 max-w-3xl">
                                The FIFA World Ranking is a ranking system for men's and women's national teams in association football.
                                The teams of the men's member nations of FIFA are ranked based on their game results.
                            </p>
                        </div>
                    </section>

                    {/* Rankings Content */}
                    <section className="py-14">
                        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                            {/* Two column layout for larger screens, stacked on mobile */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 lg:gap-16">
                                {/* Men's Ranking */}
                                <div>
                                    <div className="mb-6">
                                        <h2 className="text-2xl lg:text-3xl font-bold text-navy-950 mb-2">
                                            {dict.sections.mensRanking}
                                        </h2>
                                        <p className="text-sm text-content-muted">
                                            {dict.sections.lastUpdate}: {mensLastUpdate}
                                        </p>
                                    </div>

                                    <RankingTable
                                        rows={men}
                                        labels={{
                                            ranking: "Ranking",
                                            team: "Team",
                                            totalPoints: "Total Points",
                                            pointsChange: "+/- points",
                                        }}
                                    />
                                </div>

                                {/* Women's Ranking */}
                                <div>
                                    <div className="mb-6">
                                        <h2 className="text-2xl lg:text-3xl font-bold text-navy-950 mb-2">
                                            {dict.sections.womensRanking}
                                        </h2>
                                        <p className="text-sm text-content-muted">
                                            {dict.sections.lastUpdate}: {womensLastUpdate}
                                        </p>
                                    </div>

                                    <RankingTable
                                        rows={women}
                                        labels={{
                                            ranking: "Ranking",
                                            team: "Team",
                                            totalPoints: "Total Points",
                                            pointsChange: "+/- points",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
                <Footer dict={dict} locale={locale} />
            </div>
        </>
    );
}
