import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchArticlePage, fetchArticleSection, fetchPromoCarouselSection } from "@/lib/api";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { FIFAPageResponse } from "@/lib/types";
import { parseRichText } from "@/lib/richtextParser";

type PageProps = {
  params: { locale: string; path: string[] };
};

export default async function ArticlePage({ params }: PageProps) {
  const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
  const dict = getDictionary(locale);
  
  // Reconstruct the full article path
  const pathString = params.path.join('/');
  const articlePath = `/${params.locale}/${pathString}`;
  
  // Check if this is likely an article path (contains /articles/)
  // Next.js will match more specific routes first, so this catch-all only handles article paths
  const isArticlePath = pathString.includes('/articles/');
  
  // Skip if it's a known non-article route (these should be handled by specific routes)
  const nonArticleRoutes = ['news', 'match-score', 'world-rankings', 'cat'];
  const isNonArticleRoute = nonArticleRoutes.some(route => pathString === route || pathString.startsWith(`${route}/`));
  
  // Also check for specific tournament routes that aren't articles
  const specificTournamentRoutes = ['host-cities', 'scores-fixtures', 'standings', 'teams'];
  const isSpecificTournamentRoute = specificTournamentRoutes.some(route => pathString.includes(`/${route}`) && !pathString.includes('/articles/'));
  
  if (!isArticlePath && (isNonArticleRoute || isSpecificTournamentRoute)) {
    // This is likely handled by a more specific route, return 404
    return (
      <div className="min-h-screen bg-surface-100">
        <Header locale={locale} dict={dict} />
        <main className="py-10">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <p className="text-center text-content-secondary">Page not found.</p>
          </div>
        </main>
        <Footer dict={dict} locale={locale} />
      </div>
    );
  }
  
  // Fetch the article page
  const articlePageData = await fetchArticlePage(articlePath);

  if (!articlePageData) {
    return (
      <div className="min-h-screen bg-surface-100">
        <Header locale={locale} dict={dict} />
        <main className="py-10">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <Link
              href={`/${locale}`}
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
              Back to Home
            </Link>
            <p className="text-center text-content-secondary">Article not found.</p>
          </div>
        </main>
        <Footer dict={dict} locale={locale} />
      </div>
    );
  }

  // Find article and promoCarousel sections
  const articleSection = articlePageData.sections?.find(s => s.entryType === "article");
  const promoCarouselSection = articlePageData.sections?.find(s => s.entryType === "sectionPromoCarousel");

  // Fetch section contents
  const [articleContent, promoCarouselData] = await Promise.all([
    articleSection ? fetchArticleSection(articleSection.entryId, locale) : null,
    promoCarouselSection ? fetchPromoCarouselSection(promoCarouselSection.entryId, locale) : null,
  ]);

  return (
    <div className="min-h-screen bg-surface-100">
      <Header locale={locale} dict={dict} />
      <main className="py-10 lg:py-14">
        <ArticleContent 
          articlePageData={articlePageData}
          articleContent={articleContent}
          promoCarouselData={promoCarouselData}
          locale={locale}
        />
      </main>
      <Footer dict={dict} locale={locale} />
    </div>
  );
}

type ArticleContentProps = {
  articlePageData: FIFAPageResponse;
  articleContent: any | null;
  promoCarouselData: any | null;
  locale: string;
};

function ArticleContent({ articlePageData, articleContent, promoCarouselData, locale }: ArticleContentProps) {
  // Format published date from createdDate
  const publishedDate = new Date(articlePageData.createdDate);
  const formattedDate = publishedDate.toLocaleDateString(locale === "en" ? "en-GB" : locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Extract tags for display
  type Tag = {
    sourceCategory?: string;
    title: string;
  };
  
  const tags = (articlePageData as any).tags as Tag[] | undefined;
  const displayTags = tags
    ?.filter((tag: Tag) => 
      tag.sourceCategory !== "Competition" && 
      tag.sourceCategory !== "Season" && 
      tag.sourceCategory !== "Association" && 
      tag.sourceCategory !== "Confederation" && 
      tag.sourceCategory !== "Team" && 
      tag.sourceCategory !== "Player"
    )
    .map((tag: Tag) => tag.title) || [];

  return (
    <article className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
      {/* Back Button */}
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-2 text-brand-blue font-medium mb-8 hover:underline group"
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
          className="transition-transform duration-200 group-hover:-translate-x-1"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Article Header */}
      <header className="mb-8">
        {/* Title - Use articleTitle from articleContent if available, otherwise use meta.title */}
        <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-navy-950 leading-tight mb-6">
          {articleContent?.articleTitle || articlePageData.meta.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-content-secondary mb-6">
          <time dateTime={articleContent?.articlePublishedDate || articlePageData.createdDate}>
            {articleContent?.articlePublishedDate
              ? new Date(articleContent.articlePublishedDate).toLocaleDateString(
                  locale === "en" ? "en-GB" : locale,
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )
              : formattedDate}
          </time>
          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {displayTags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-surface-200 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description - Use articlePreviewText from articleContent if available */}
        {(articleContent?.articlePreviewText || articlePageData.meta.description) && (
          <p className="text-lg lg:text-xl text-content-secondary leading-relaxed mb-8 font-medium">
            {articleContent?.articlePreviewText || articlePageData.meta.description}
          </p>
        )}
      </header>

      {/* Featured Image - Use heroImage from articleContent if available, otherwise use meta.image */}
      {(articleContent?.heroImage?.src || articlePageData.meta.image) && (
        <div className="relative w-full aspect-[16/9] mb-10 rounded-xl overflow-hidden">
          <Image
            src={articleContent?.heroImage?.src || articlePageData.meta.image}
            alt={articleContent?.heroImage?.alt || articlePageData.meta.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            unoptimized
          />
          {articleContent?.heroImage?.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-4">
              {articleContent.heroImage.caption}
            </div>
          )}
        </div>
      )}

      {/* Article Content */}
      {articleContent && (
        <div className="prose prose-lg max-w-none mb-12">
          <ArticleBody content={articleContent} />
        </div>
      )}

      {/* Promo Carousel Section */}
      {promoCarouselData && promoCarouselData.items && promoCarouselData.items.length > 0 && (
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-2xl lg:text-3xl font-bold text-navy-950 mb-8">
            {promoCarouselData.title || "Related Articles"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {promoCarouselData.items.slice(0, 3).map((item: any) => (
              <div
                key={item.entryId}
                className="block"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4">
                  <Image
                    src={item.image?.src || "/images/fallback.png"}
                    alt={item.image?.alt || item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                </div>
                <h3 className="text-base lg:text-lg font-medium text-navy-950 line-clamp-2">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function ArticleBody({ content }: { content: any }) {
  // Parse and render rich text content
  if (content.richtext) {
    return <>{parseRichText(content.richtext)}</>;
  }

  // Fallback: render as JSON for debugging (remove in production if not needed)
  return (
    <div className="text-content-secondary">
      <p className="mb-4">Article content is not available in the expected format.</p>
      <details className="text-sm">
        <summary className="cursor-pointer text-brand-blue">Debug: View raw content</summary>
        <pre className="whitespace-pre-wrap text-xs mt-2 p-4 bg-surface-200 rounded overflow-auto">
          {JSON.stringify(content, null, 2)}
        </pre>
      </details>
    </div>
  );
}

