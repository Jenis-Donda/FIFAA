import Script from "next/script";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import Rankings from "@/components/Rankings";
import StoryGrid from "@/components/StoryGrid";
import InsideFIFA from "@/components/InsideFIFA";
import UpcomingTournaments from "@/components/UpcomingTournaments";
import Footer from "@/components/Footer";
import { fetchHeroSlides, fetchTopStories, fetchAllRankings, fetchInsideFIFAData, fetchUpcomingTournamentsData } from "@/lib/api";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

type PageProps = {
  params: { locale: string };
};

export default async function HomePage({ params }: PageProps) {
  const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
  const dict = getDictionary(locale);

  // Fetch data from FIFA API
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
        id="home-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "FIFA | The Home of Football",
            description:
              "FIFA-inspired football hub with tournaments, news, rankings, tickets, and featured stories.",
            primaryImageOfPage: "https://example.com/og.jpg",
            inLanguage: locale,
          }),
        }}
      />
      <div className="min-h-screen bg-surface-100">
        <Header locale={locale} dict={dict} />
        <main>
          <HeroCarousel slides={heroSlides} />
          <StoryGrid stories={topStories} dict={dict} />
          <Rankings
            men={rankings.men}
            women={rankings.women}
            mensLastUpdate={rankings.mensLastUpdate}
            womensLastUpdate={rankings.womensLastUpdate}
            dict={dict}
          />
          <InsideFIFA data={insideFIFA} />
          <UpcomingTournaments data={upcomingTournaments} />
        </main>
        <Footer dict={dict} />
      </div>
    </>
  );
}
