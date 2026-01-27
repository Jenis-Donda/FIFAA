import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import { locales, isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
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
  
  return {
    metadataBase: new URL("https://example.com"),
    title: "FIFA | The Home of Football",
    description:
      "FIFA-inspired football hub with tournaments, news, rankings, tickets, and featured stories.",
    openGraph: {
      title: "FIFA | The Home of Football",
      description:
        "Explore tournaments, highlights, rankings, and stories from the world of football.",
      type: "website",
      locale: locale,
    },
    twitter: {
      card: "summary_large_image",
      title: "FIFA | The Home of Football",
      description:
        "Explore tournaments, highlights, rankings, and stories from the world of football.",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}`])
      ),
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
      <body>{children}</body>
    </html>
  );
}


