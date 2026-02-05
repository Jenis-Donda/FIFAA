"use client";

import { useMemo } from "react";
import Image from "next/image";

interface StandingsProps {
    standingsData: any;
    dict: any;
}

export default function Standings({ standingsData, dict }: StandingsProps) {
    const groupedStandings = useMemo(() => {
        if (!standingsData?.Results) return {};

        const grouped: { [key: string]: any[] } = {};

        standingsData.Results.forEach((standing: any) => {
            const groupName = standing.Group?.[0]?.Description || "Unknown";

            if (!grouped[groupName]) {
                grouped[groupName] = [];
            }

            const teamName = standing.Team?.Name?.[0]?.Description || "TBD";
            const teamFlag = standing.Team?.PictureUrl?.replace("{format}", "sq").replace("{size}", "1");

            grouped[groupName].push({
                position: standing.Position || 0,
                team: teamName,
                flag: teamFlag,
                p: standing.Played || 0,
                w: standing.Won || 0,
                d: standing.Drawn || 0,
                l: standing.Lost || 0,
                gf: standing.For || 0,
                ga: standing.Against || 0,
                gd: standing.GoalsDiference || 0,
                pts: standing.Points || 0,
            });
        });

        Object.keys(grouped).forEach((group) => {
            grouped[group].sort((a, b) => a.position - b.position);
        });

        return grouped;
    }, [standingsData]);

    const sortedGroups = Object.keys(groupedStandings).sort();

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">
                    Standings
                </h1>

                <div className="space-y-4 sm:space-y-6 md:space-y-8">
                    {sortedGroups.map((groupName) => (
                        <div key={groupName} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="bg-gray-50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">{groupName}</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                #
                                            </th>
                                            <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Team
                                            </th>
                                            <th className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                P
                                            </th>
                                            <th className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                W
                                            </th>
                                            <th className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                D
                                            </th>
                                            <th className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                L
                                            </th>
                                            <th className="hidden sm:table-cell px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                GF
                                            </th>
                                            <th className="hidden sm:table-cell px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                GA
                                            </th>
                                            <th className="hidden md:table-cell px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                GD
                                            </th>
                                            <th className="px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pts
                                            </th>
                                            <th className="hidden lg:table-cell px-1 sm:px-2 md:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Form
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {groupedStandings[groupName]?.map((team) => (
                                            <tr key={team.position} className="hover:bg-gray-50">
                                                <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {team.position}
                                                </td>
                                                <td className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        {team.flag ? (
                                                            <Image
                                                                src={team.flag}
                                                                alt={team.team}
                                                                width={24}
                                                                height={18}
                                                                className="object-cover sm:w-8 sm:h-6"
                                                            />
                                                        ) : (
                                                            <span className="text-lg sm:text-xl">🏴</span>
                                                        )}
                                                        <span className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                                                            {team.team}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500">
                                                    {team.p}
                                                </td>
                                                <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500">
                                                    {team.w}
                                                </td>
                                                <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500">
                                                    {team.d}
                                                </td>
                                                <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500">
                                                    {team.l}
                                                </td>
                                                <td className="hidden sm:table-cell px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500">
                                                    {team.gf}
                                                </td>
                                                <td className="hidden sm:table-cell px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500">
                                                    {team.ga}
                                                </td>
                                                <td className="hidden md:table-cell px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500">
                                                    {team.gd}
                                                </td>
                                                <td className="px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-center font-semibold text-gray-900">
                                                    {team.pts}
                                                </td>
                                                <td className="hidden lg:table-cell px-1 sm:px-2 md:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-center text-gray-500">
                                                    - - - - -
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 sm:mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs text-gray-600">
                        <div className="space-y-1">
                            <p><span className="font-semibold">P</span> = Matches Played</p>
                            <p><span className="font-semibold">W</span> = Wins</p>
                            <p><span className="font-semibold">D</span> = Draws</p>
                            <p><span className="font-semibold">L</span> = Loss</p>
                        </div>
                        <div className="space-y-1">
                            <p><span className="font-semibold">GF</span> = Goals For</p>
                            <p><span className="font-semibold">GA</span> = Goals Against</p>
                            <p><span className="font-semibold">GD</span> = Goal Difference</p>
                            <p><span className="font-semibold">Pts</span> = Points</p>
                        </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Form:</p>
                        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                                <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                                <span>= Wins</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="inline-block w-3 h-3 bg-gray-400 rounded-full"></span>
                                <span>= Draws</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                                <span>= Loss</span>
                            </span>
                            <span>- = Not played</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}