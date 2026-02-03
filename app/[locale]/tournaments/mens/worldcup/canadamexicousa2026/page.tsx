import Script from "next/script";
import WorldCupHeader from "@/components/worldcup/WorldCupHeader";
import WorldCupHome from "@/components/worldcup/WorldCupHome";
import Footer from "@/components/Footer";
import { fetchHeroSlides, fetchTopStories, fetchAllRankings, fetchInsideFIFAData, fetchUpcomingTournamentsData } from "@/lib/api";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

type PageProps = {
    params: { locale: string };
};

export default async function WorldCupHostPage({ params }: PageProps) {
    const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
    const dict = getDictionary(locale);

    // Reuse the same data as home so the UI matches
    const [heroSlides, topStories, rankings, insideFIFA, upcomingTournaments] = await Promise.all([
        fetchHeroSlides(locale),
        fetchTopStories(locale, 10),
        fetchAllRankings(locale),
        fetchInsideFIFAData(locale),
        fetchUpcomingTournamentsData(locale),
    ]);

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

            <div className="min-h-screen bg-surface-100">
                <WorldCupHeader locale={locale} dict={dict} />
                <main>
                    <WorldCupHome
                        slides={heroSlides}
                        stories={topStories}
                        rankings={rankings}
                        insideFIFA={insideFIFA}
                        upcomingTournaments={upcomingTournaments}
                        dict={dict}
                    />
                </main>
                <Footer dict={dict} />
            </div>
        </>
    );
}
