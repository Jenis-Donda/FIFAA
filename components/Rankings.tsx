import Link from "next/link";
import RankingTable from "./RankingTable";
import type { Dictionary } from "@/i18n/dictionaries";
import type { RankingRow } from "@/lib/types";
import type { Locale } from "@/i18n/config";

type RankingsProps = {
  men: RankingRow[];
  women: RankingRow[];
  mensLastUpdate: string;
  womensLastUpdate: string;
  dict: Dictionary;
  locale: Locale;
};

export default function Rankings({ 
  men, 
  women, 
  mensLastUpdate, 
  womensLastUpdate, 
  dict,
  locale
}: RankingsProps) {
  return (
    <section className="py-14 bg-surface-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <h2 className="text-xl lg:text-2xl font-bold text-navy-950 mb-8">
          {dict.sections.rankings}
        </h2>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Men's Ranking */}
          <div>
            <h3 className="text-lg font-bold text-navy-950 mb-1">
              {dict.sections.mensRanking}
            </h3>
            <p className="text-sm text-content-muted mb-4">
              {dict.sections.lastUpdate}: {mensLastUpdate}
            </p>
            
            <RankingTable 
              rows={men}
              labels={{
                ranking: "Ranking",
                team: "Team",
                totalPoints: "Total Points",
                pointsChange: "+/- points",
              }}
            />

            <Link
              href={`/${locale}/world-rankings`}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 border-2 border-brand-blue text-brand-blue font-semibold text-sm uppercase tracking-wide rounded-full hover:bg-brand-blue hover:text-white transition-all duration-200"
            >
              {dict.sections.exploreFullRanking.replace("ranking", "Men's Ranking")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          {/* Women's Ranking */}
          <div>
            <h3 className="text-lg font-bold text-navy-950 mb-1">
              {dict.sections.womensRanking}
            </h3>
            <p className="text-sm text-content-muted mb-4">
              {dict.sections.lastUpdate}: {womensLastUpdate}
            </p>
            
            <RankingTable 
              rows={women}
              labels={{
                ranking: "Ranking",
                team: "Team",
                totalPoints: "Total Points",
                pointsChange: "+/- points",
              }}
            />

            <Link
              href={`/${locale}/world-rankings`}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 border-2 border-brand-blue text-brand-blue font-semibold text-sm uppercase tracking-wide rounded-full hover:bg-brand-blue hover:text-white transition-all duration-200"
            >
              {dict.sections.exploreFullRanking.replace("ranking", "Women's Ranking")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
