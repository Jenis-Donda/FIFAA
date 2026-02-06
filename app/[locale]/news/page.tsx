import Script from "next/script";
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
      title: "News | FIFAA",
      description: "Discover latest news and exclusive interviews from FIFAA, the Home of Football.",
    };
  }

  const url = `https://example.com/${locale}/news`;
  const title = pageData.meta?.title || "News | FIFAA";
  const description = pageData.meta?.description || "Discover latest news and exclusive interviews from FIFAA, the Home of Football.";

  return {
    title,
    description,
    keywords: ["FIFAA news", "football news", "soccer news", "FIFAA updates", "football articles"],
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: locale,
      images: pageData.meta?.image ? [{ 
        url: pageData.meta.image,
        width: 1200,
        height: 630,
        alt: title,
      }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: pageData.meta?.image ? [pageData.meta.image] : [],
    },
    alternates: {
      canonical: url,
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
        <Footer dict={dict} locale={locale} />
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

  // Fetch news articles to get images for hero banner
  // Use the "all news" entryId: 2lsGSGYOtykcJRJQu7bdDg
  const allNewsData = await fetchNewsSectionByEntryId("2lsGSGYOtykcJRJQu7bdDg", locale, 20);
  const newsImages = allNewsData?.items
    ?.filter((item) => item.image?.src)
    .map((item) => ({
      src: item.image.src,
      alt: item.image.alt || item.title,
      title: item.title,
    })) || [];

  const url = `https://example.com/${locale}/news`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageData.meta?.title || "News | FIFAA",
    description: pageData.meta?.description || "Discover latest news and exclusive interviews from FIFAA, the Home of Football.",
    url,
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: "FIFAA",
      logo: {
        "@type": "ImageObject",
        url: "https://example.com/logo.png",
      },
    },
  };

  return (
    <>
      <Script
        id="news-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
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
                locale={locale}
                newsImages={newsImages}
              />
            );
          }

          return null;
        })}
      </main>
      <Footer dict={dict} locale={locale} />
    </div>
    </>
  );
}

