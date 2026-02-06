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
import { Metadata } from "next/types";

type PageProps = {
  params: { locale: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
  const url = `https://example.com/${locale}`;


  return {
    title: "FIFAA | The Home of Football",
    description: "FIFAA - Your football hub with tournaments, news, rankings, tickets, and featured stories. Stay updated with the latest football news, match scores, and world rankings.",
    keywords: ["FIFAA", "football", "soccer", "world cup", "tournaments", "rankings", "news", "matches"],
    openGraph: {
      title: "FIFAA | The Home of Football",
      description: "Explore tournaments, highlights, rankings, and stories from the world of football.",
      url,
      type: "website",
      locale: locale,
      siteName: "FIFAA",
      images: [{
        url: "https://example.com/og.jpg",
        width: 1200,
        height: 630,
        alt: "FIFAA - The Home of Football",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: "FIFAA | The Home of Football",
      description: "Explore tournaments, highlights, rankings, and stories from the world of football.",
      images: ["https://example.com/og.jpg"],
    },
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        ["en", "es", "fr", "ar"].map((l) => [l, `https://example.com/${l}`])
      ),
    },
  };
}

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

  const url = `https://example.com/${locale}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FIFAA | The Home of Football",
    description: "FIFAA - Your football hub with tournaments, news, rankings, tickets, and featured stories.",
    url,
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <Script
        id="home-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
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
            locale={locale}
          />
          <InsideFIFA data={insideFIFA} />
          <UpcomingTournaments data={upcomingTournaments} />
        </main>
        <Footer dict={dict} locale={locale} />
      </div>
    </>
  );
}
