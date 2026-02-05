import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsListingClient from "@/components/news/NewsListingClient";
import { fetchNewsSectionByEntryId } from "@/lib/api";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

type PageProps = {
  params: { locale: string; entryId: string };
};

export default async function NewsListingPage({ params }: PageProps) {
  const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
  const dict = getDictionary(locale);
  
  const newsData = await fetchNewsSectionByEntryId(params.entryId, locale, 100);

  if (!newsData || !newsData.items || newsData.items.length === 0) {
    return (
      <div className="min-h-screen bg-surface-100">
        <Header locale={locale} dict={dict} />
        <main className="py-10">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <Link
              href={`/${locale}/news`}
              className="inline-flex items-center gap-2 text-brand-blue font-medium mb-6 hover:underline"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <p className="text-center text-content-secondary">No news articles found.</p>
          </div>
        </main>
        <Footer dict={dict} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100">
      <Header locale={locale} dict={dict} />
      <main className="py-10 lg:py-14">
        <NewsListingClient newsData={newsData} locale={locale} />
      </main>
      <Footer dict={dict} />
    </div>
  );
}

