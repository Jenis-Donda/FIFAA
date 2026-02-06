import Link from "next/link";
import Image from "next/image";
import { Match } from "@/lib/types";

interface MatchCardProps {
    match: Match;
}

function TeamLogoPlaceholder({ abbr }: { abbr: string }) {
    return (
        <Image
            src="/images/fallback.png"
            alt={abbr || "Team"}
            fill
            className="object-contain"
        />
    );
}

export default function MatchCard({ match }: MatchCardProps) {
    const isFinished = match.status === "finished";
    const isLive = match.status === "live";

    return (
        <Link
            href={`/en/match-score/match/${match.idCompetition}/${match.idSeason}/${match.idStage}/${match.idMatch}`}
            className="block hover:bg-gray-50 transition-colors"
        >
            {/* Desktop Layout */}
            <div className="hidden lg:block px-6 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1 flex items-center gap-4">
                        <div className="flex items-center gap-3 min-w-[200px]">
                            {match.homeTeamLogo ? (
                                <div className="relative w-8 h-8 flex-shrink-0">
                                    <Image
                                        src={match.homeTeamLogo}
                                        alt={match.homeTeam}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="relative w-8 h-8 flex-shrink-0">
                                    <TeamLogoPlaceholder abbr={match.homeTeamAbbr} />
                                </div>
                            )}
                            <span className="font-medium text-gray-900">{match.homeTeam}</span>
                        </div>

                        <div className="flex items-center justify-center min-w-[80px]">
                            {isFinished || isLive ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-gray-900">{match.homeScore ?? 0}</span>
                                    <span className="text-gray-400">-</span>
                                    <span className="text-2xl font-bold text-gray-900">{match.awayScore ?? 0}</span>
                                </div>
                            ) : (
                                <span className="text-lg font-semibold text-gray-900">{match.time}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 min-w-[200px]">
                            <span className="font-medium text-gray-900">{match.awayTeam}</span>
                            {match.awayTeamLogo ? (
                                <div className="relative w-8 h-8 flex-shrink-0 ml-auto">
                                    <Image
                                        src={match.awayTeamLogo}
                                        alt={match.awayTeam}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="relative w-8 h-8 flex-shrink-0 ml-auto">
                                    <TeamLogoPlaceholder abbr={match.awayTeamAbbr} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-6 ml-8">
                        <div className="text-right">
                            <div className="text-xs text-gray-500 space-x-2">
                                <span>{match.stageName}</span>
                                {match.groupName && (
                                    <>
                                        <span>·</span>
                                        <span>{match.groupName}</span>
                                    </>
                                )}
                            </div>
                            {match.venue && (
                                <div className="text-xs text-gray-500 mt-1">{match.venue}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile & Tablet Layout */}
            <div className="lg:hidden px-4 py-4">
                <div className="flex flex-col gap-3">
                    {/* Match Info */}
                    <div className="flex items-center justify-between">
                        {/* Home Team */}
                        <div className="flex items-center gap-2 flex-1">
                            {match.homeTeamLogo ? (
                                <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                                    <Image
                                        src={match.homeTeamLogo}
                                        alt={match.homeTeam}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                                    <TeamLogoPlaceholder abbr={match.homeTeamAbbr} />
                                </div>
                            )}
                            <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{match.homeTeam}</span>
                        </div>

                        {/* Score/Time */}
                        <div className="flex items-center justify-center min-w-[60px] sm:min-w-[80px] mx-3">
                            {isFinished || isLive ? (
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <span className="text-lg sm:text-xl font-bold text-gray-900">{match.homeScore ?? 0}</span>
                                    <span className="text-gray-400 text-sm">-</span>
                                    <span className="text-lg sm:text-xl font-bold text-gray-900">{match.awayScore ?? 0}</span>
                                </div>
                            ) : (
                                <span className="text-sm sm:text-base font-semibold text-gray-900">{match.time}</span>
                            )}
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center gap-2 flex-1 justify-end">
                            <span className="font-medium text-gray-900 text-sm sm:text-base truncate text-right">{match.awayTeam}</span>
                            {match.awayTeamLogo ? (
                                <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                                    <Image
                                        src={match.awayTeamLogo}
                                        alt={match.awayTeam}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                                    <TeamLogoPlaceholder abbr={match.awayTeamAbbr} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Match Details */}
                    <div className="flex flex-wrap items-center justify-center gap-1 text-xs text-gray-500">
                        <span>{match.stageName}</span>
                        {match.groupName && (
                            <>
                                <span>·</span>
                                <span>{match.groupName}</span>
                            </>
                        )}
                        {match.venue && (
                            <>
                                <span>·</span>
                                <span className="truncate max-w-[200px]">{match.venue}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}