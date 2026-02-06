"use client";

import Image from "next/image";
import Link from "next/link";
import type { MatchesByCompetition, Match } from "@/lib/types";

type MatchListProps = {
  matchGroups: MatchesByCompetition[];
  isLoading: boolean;
  locale?: string;
};

function MatchRow({ match, locale = "en" }: { match: Match; locale?: string }) {
  const isLive = match.status === "live";
  const isFinished = match.statusCode === 0;
  const matchUrl = `/${locale}/match-score/match/${match.idCompetition}/${match.idSeason}/${match.idStage}/${match.idMatch}`;

  return (
    <Link
      href={matchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="py-4 px-6 transition-colors border-t border-gray-100 cursor-pointer block"
    >
      <div className="flex items-center gap-4">
        {/* Home Team */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <span className="text-sm font-medium text-navy-950 text-right">{match.homeTeam}</span>
          {match.homeTeamLogo ? (
            <Image
              src={match.homeTeamLogo}
              alt={match.homeTeam}
              width={40}
              height={40}
              className="w-9 h-9 object-contain rounded-full"
              unoptimized
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement | null;
                if (target) target.src = "/images/fallback.png";
              }}
            />
          ) : (
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">{match.homeTeamAbbr?.substring(0, 2) || "??"}</div>
          )}
        </div>

        {/* Score / Time */}
        <div className="w-36 text-center px-4">
          {isFinished ? (
            <div className="flex items-center justify-center gap-3">
              <div className="px-3 py-1 rounded text-lg font-bold text-navy-950">{match.homeScore ?? 0}</div>
              <div className="text-gray-400 text-lg">-</div>
              <div className="px-3 py-1 rounded text-lg font-bold text-navy-950">{match.awayScore ?? 0}</div>
            </div>
          ) : isLive ? (
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-white bg-red-600 px-2 py-0.5 rounded mb-1 animate-pulse">LIVE</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-base font-bold text-red-600">{match.homeScore ?? 0}</span>
                <span className="text-gray-400">-</span>
                <span className="text-base font-bold text-red-600">{match.awayScore ?? 0}</span>
              </div>
            </div>
          ) : (
            <span className="text-sm font-medium text-gray-700">{match.time}</span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex items-center gap-3">
          {match.awayTeamLogo ? (
            <Image src={match.awayTeamLogo} alt={match.awayTeam} width={40} height={40} className="w-9 h-9 object-contain rounded-full" unoptimized onError={(e) => { const target = e.currentTarget as HTMLImageElement | null; if (target) target.src = "/images/fallback.png"; }} />
          ) : (
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">{match.awayTeamAbbr?.substring(0, 2) || "??"}</div>
          )}
          <span className="text-sm font-medium text-navy-950">{match.awayTeam}</span>
        </div>
      </div>

      {/* FT Badge */}
      {isFinished && (
        <div className="flex justify-center mt-3">
          <span className="inline-block text-[11px] font-semibold text-white bg-navy-950 px-3 py-1 rounded">FT</span>
        </div>
      )}
    </Link>
  );
}

function CompetitionGroup({
  group,
  locale = "en",
}: {
  group: MatchesByCompetition;
  locale?: string;
}) {
  return (
    <div className="bg-white rounded-lg overflow-hidden mb-6 shadow-sm border border-gray-200">
      {/* Match Day Header - Dark blue background */}
      {group.matchDay && (
        <div className="bg-[#326295] text-white text-center py-2.5 px-4">
          <p className="text-sm font-semibold">Match Day {group.matchDay}</p>
        </div>
      )}

      {/* Match Rows */}
      <div className="bg-white">
        {group.matches.map((match, index) => (
          <div key={match.id}>
            {index > 0 && <div className="border-t border-gray-200/60" />}
            <MatchRow match={match} locale={locale} />
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="bg-[#e8f4fc] rounded-lg overflow-hidden animate-pulse">
          {/* Header */}
          <div className="flex items-start px-6 py-5">
            <div className="w-12 h-12 bg-white/50 rounded-lg" />
            <div className="flex-1 text-center">
              <div className="h-5 bg-white/50 rounded w-32 mx-auto mb-2" />
              <div className="h-4 bg-white/50 rounded w-24 mx-auto" />
            </div>
          </div>

          {/* Matches */}
          <div className="bg-white">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center py-4 px-6 border-t border-gray-200/60">
                <div className="flex-1 flex items-center justify-end gap-3">
                  <div className="h-4 bg-gray-200 rounded w-28" />
                  <div className="w-7 h-7 bg-gray-200 rounded-full" />
                </div>
                <div className="w-28 text-center">
                  <div className="h-5 bg-gray-200 rounded w-14 mx-auto" />
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-7 h-7 bg-gray-200 rounded-full" />
                  <div className="h-4 bg-gray-200 rounded w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
      <svg
        className="w-16 h-16 text-gray-300 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="text-lg font-medium text-navy-950 mb-2">No matches scheduled</h3>
      <p className="text-gray-500">There are no matches scheduled for this date.</p>
    </div>
  );
}

export default function MatchList({
  matchGroups,
  isLoading,
  locale = "en",
}: MatchListProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (matchGroups.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {matchGroups.map((group) => (
        <CompetitionGroup
          key={group.competitionId || group.competition}
          group={group}
          locale={locale}
        />
      ))}
    </div>
  );
}
