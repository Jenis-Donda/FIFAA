import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MatchDetailsClient from "@/components/match-score/MatchDetailsClient";
import { isValidLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Match Details | FIFA",
  description: "View detailed match information, scores, and statistics.",
};

type PageProps = {
  params: { 
    locale: string;
    idCompetition: string;
    idSeason: string;
    idStage: string;
    idMatch: string;
  };
};

export default function MatchDetailsPage({ params }: PageProps) {
  const locale: Locale = isValidLocale(params.locale) ? params.locale : "en";
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-surface-100">
      <Header locale={locale} dict={dict} />
      <main>
        <MatchDetailsClient 
          locale={locale} 
          dict={dict}
          idCompetition={params.idCompetition}
          idSeason={params.idSeason}
          idStage={params.idStage}
          idMatch={params.idMatch}
        />
      </main>
      <Footer dict={dict} locale={locale} />
    </div>
  );
}

