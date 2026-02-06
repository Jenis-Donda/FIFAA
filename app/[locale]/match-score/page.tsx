import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MatchCentreClient from "@/components/match-score/MatchCentreClient";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Match Score | FIFA",
  description: "View live scores, match schedules, and standings from football leagues around the world.",
};

type PageProps = {
  params: { locale: string };
};

export default function MatchCentrePage({ params }: PageProps) {
  const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-surface-100">
      <Header locale={locale} dict={dict} />
      <main>
        <MatchCentreClient locale={locale} dict={dict} />
      </main>
      <Footer dict={dict} locale={locale} />
    </div>
  );
}

