import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsSection from "@/components/news/NewsSection";
import PromoCarouselSection from "@/components/news/PromoCarouselSection";
import HeroBannerSection from "@/components/news/HeroBannerSection";
import {
  fetchNewsPage,
  fetchNewsSectionByEntryId,
  fetchPromoCarouselSection,
  fetchHeroBannerSection,
} from "@/lib/api";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { FIFAPageResponse, NewsResponse, PromoCarouselResponse } from "@/lib/types";

type PageProps = {
  params: { locale: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
  const pageData = await fetchNewsPage(locale);

  if (!pageData) {
    return {
      title: "News | FIFA",
      description: "Discover latest news and exclusive interviews from FIFA, the Home of Football.",
    };
  }

  return {
    title: pageData.meta?.title || "News | FIFA",
    description: pageData.meta?.description || "Discover latest news and exclusive interviews from FIFA, the Home of Football.",
    openGraph: {
      title: pageData.meta?.title || "News | FIFA",
      description: pageData.meta?.description || "Discover latest news and exclusive interviews from FIFA, the Home of Football.",
      images: pageData.meta?.image ? [{ url: pageData.meta.image }] : [],
    },
  };
}

export default async function NewsPage({ params }: PageProps) {
  const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
  const dict = getDictionary(locale);

  // Fetch news page data
  const pageData = await fetchNewsPage(locale);

  if (!pageData) {
    return (
      <div className="min-h-screen bg-surface-100">
        <Header locale={locale} dict={dict} />
        <main className="py-10">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <p className="text-center text-content-secondary">Failed to load news page.</p>
          </div>
        </main>
        <Footer dict={dict} />
      </div>
    );
  }

  // Fetch all section data in parallel
  const sectionPromises = pageData.sections.map(async (section) => {
    const endpoint = section.entryEndpoint;
    
    if (section.entryType === "news") {
      // Extract entryId and limit from endpoint
      // Format: /sections/news/{entryId}?locale=en&limit=20 or sections/news/{entryId}?locale=en&limit=20
      const match = endpoint.match(/\/?sections\/news\/([^?]+)(?:\?.*limit=(\d+))?/);
      if (match) {
        const entryId = match[1];
        const limit = match[2] ? parseInt(match[2], 10) : 20;
        const data = await fetchNewsSectionByEntryId(entryId, locale, limit);
        return { section, data, type: "news" as const };
      }
    } else if (section.entryType === "sectionPromoCarousel") {
      // Format: sections/promoCarousel/{entryId}?locale=en or /sections/promoCarousel/{entryId}?locale=en
      const match = endpoint.match(/\/?sections\/promoCarousel\/([^?]+)/);
      if (match) {
        const entryId = match[1];
        const data = await fetchPromoCarouselSection(entryId, locale);
        return { section, data, type: "promoCarousel" as const };
      }
    } else if (section.entryType === "heroBanner") {
      // Format: /sections/heroBanner/{entryId}?locale=en or sections/heroBanner/{entryId}?locale=en
      const match = endpoint.match(/\/?sections\/heroBanner\/([^?]+)/);
      if (match) {
        const entryId = match[1];
        const data = await fetchHeroBannerSection(entryId, locale);
        return { section, data, type: "heroBanner" as const };
      }
    }
    
    return { section, data: null, type: "unknown" as const };
  });

  const sectionsData = await Promise.all(sectionPromises);

  return (
    <div className="min-h-screen bg-surface-100">
      <Header locale={locale} dict={dict} />
      <main>
        {sectionsData.map(({ section, data, type }, index) => {
          if (!data) return null;

          if (type === "news") {
            return (
              <NewsSection
                key={section.entryId}
                data={data as NewsResponse}
                dict={dict}
                locale={locale}
              />
            );
          } else if (type === "promoCarousel") {
            return (
              <PromoCarouselSection
                key={section.entryId}
                data={data as PromoCarouselResponse}
                dict={dict}
              />
            );
          } else if (type === "heroBanner") {
            return (
              <HeroBannerSection
                key={section.entryId}
                data={data}
                dict={dict}
              />
            );
          }

          return null;
        })}
      </main>
      <Footer dict={dict} />
    </div>
  );
}

