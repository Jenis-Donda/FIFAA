import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import { locales, isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import NavigationLoader from "@/components/NavigationLoader";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = isValidLocale(params.locale) ? params.locale : "en";
  const dict = getDictionary(locale);

  const url = `https://example.com/${locale}`;

  return {
    metadataBase: new URL("https://example.com"),
    title: {
      default: "FIFAA | The Home of Football",
      template: "%s | FIFAA",
    },
    description:
      "FIFAA - Your football hub with tournaments, news, rankings, tickets, and featured stories. Stay updated with the latest football news, match scores, and world rankings.",
    keywords: ["FIFAA", "football", "soccer", "world cup", "tournaments", "rankings", "news", "matches"],
    authors: [{ name: "FIFAA" }],
    creator: "FIFAA",
    publisher: "FIFAA",
    icons: {
      icon: "/images/loader.jpg",
      shortcut: "/images/loader.jpg",
      apple: "/images/loader.jpg",
    },
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 5,
    },
    openGraph: {
      title: "FIFAA | The Home of Football",
      description:
        "Explore tournaments, highlights, rankings, and stories from the world of football.",
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
      description:
        "Explore tournaments, highlights, rankings, and stories from the world of football.",
      images: ["https://example.com/og.jpg"],
      creator: "@FIFAA",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((l) => [l, `https://example.com/${l}`])
      ),
    },
    verification: {
      google: "your-google-verification-code",
    },
  };
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = isValidLocale(params.locale) ? params.locale : "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${oswald.variable}`}>
      <body>
        <NavigationLoader />
        {children}
      </body>
    </html>
  );
}


