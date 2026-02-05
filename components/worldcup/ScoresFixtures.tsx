"use client";

import { useState, useMemo } from "react";
import { Match } from "@/lib/types";
import MatchCard from "./MatchCard";
import Image from "next/image";

interface ScoresFixturesProps {
    matches: Match[];
    standings: any[];
    dict: any;
}

export default function ScoresFixtures({ matches, standings, dict }: ScoresFixturesProps) {
    const [sortBy, setSortBy] = useState<"date" | "stage">("date");
    const [filterStage, setFilterStage] = useState<string>("all");
    const [filterGroup, setFilterGroup] = useState<string>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const stages = useMemo(() => {
        const stageSet = new Set(matches.map(m => m.stageName).filter(Boolean));
        return Array.from(stageSet);
    }, [matches]);

    const groups = useMemo(() => {
        const groupSet = new Set(matches.map(m => m.groupName).filter((g): g is string => g != null));
        return Array.from(groupSet).sort();
    }, [matches]);

    const filteredMatches = useMemo(() => {
        return matches.filter(match => {
            if (filterStage !== "all" && match.stageName !== filterStage) return false;
            if (filterGroup !== "all" && match.groupName !== filterGroup) return false;
            return true;
        });
    }, [matches, filterStage, filterGroup]);

    const groupedMatches = useMemo(() => {
        const grouped: { [key: string]: Match[] } = {};

        if (sortBy === "stage") {
            filteredMatches.forEach(match => {
                const groupKey = match.groupName || "Other";
                if (!grouped[groupKey]) {
                    grouped[groupKey] = [];
                }
                grouped[groupKey].push(match);
            });

            Object.keys(grouped).forEach(key => {
                grouped[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            });
        } else {
            filteredMatches.forEach(match => {
                const date = new Date(match.date);
                const dateKey = date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

                if (!grouped[dateKey]) {
                    grouped[dateKey] = [];
                }
                grouped[dateKey].push(match);
            });

            Object.keys(grouped).forEach(key => {
                grouped[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            });
        }

        return grouped;
    }, [filteredMatches, sortBy]);

    const sortedKeys = useMemo(() => {
        if (sortBy === "stage") {
            return Object.keys(groupedMatches).sort();
        } else {
            return Object.keys(groupedMatches).sort((a, b) => {
                const dateA = new Date(groupedMatches[a][0].date);
                const dateB = new Date(groupedMatches[b][0].date);
                return dateA.getTime() - dateB.getTime();
            });
        }
    }, [groupedMatches, sortBy]);

    const groupStandings = useMemo(() => {
        const standingsMap: { [key: string]: any[] } = {};

        if (!standings || standings.length === 0) return standingsMap;

        standings.forEach((standing: any) => {
            const groupName = standing.Group?.[0]?.Description || 'Unknown';

            if (!standingsMap[groupName]) {
                standingsMap[groupName] = [];
            }

            const teamName = standing.Team?.Name?.[0]?.Description || 'TBD';
            const teamFlag = standing.Team?.PictureUrl?.replace('{format}', 'sq').replace('{size}', '1');

            standingsMap[groupName].push({
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

        Object.keys(standingsMap).forEach(group => {
            standingsMap[group].sort((a, b) => a.position - b.position);
        });

        return standingsMap;
    }, [standings]);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Scores & Fixtures</h1>
                    <p className="text-sm text-gray-500">Match times shown in your local time</p>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as "date" | "stage")}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="date">Date</option>
                            <option value="stage">Stage</option>
                        </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Filter:</span>

                        {stages.length > 0 && (
                            <select
                                value={filterStage}
                                onChange={(e) => setFilterStage(e.target.value)}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Stages</option>
                                {stages.map(stage => (
                                    <option key={stage} value={stage}>{stage}</option>
                                ))}
                            </select>
                        )}

                        {groups.length > 0 && (
                            <select
                                value={filterGroup}
                                onChange={(e) => setFilterGroup(e.target.value)}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Groups</option>
                                {groups.map(group => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Matches */}
                <div className="space-y-8">
                    {sortedKeys.map(key => (
                        <div key={key}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">{key}</h2>
                                {sortBy === "date" && (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        View groups →
                                    </button>
                                )}
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                                {groupedMatches[key].map(match => (
                                    <MatchCard key={match.id} match={match} />
                                ))}
                            </div>
                        </div>
                    ))}

                    {sortedKeys.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No matches found for the selected filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Groups Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div
                            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                            onClick={() => setIsModalOpen(false)}
                        ></div>

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full relative z-10">
                            {/* Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                    </svg>
                                    <h3 className="text-lg font-bold text-gray-900">FIFA World Cup 2026™</h3>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Content */}
                            {/* Content */}
                            <div className="bg-white px-6 py-6 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-8">
                                    {Object.keys(groupStandings).sort().map(group => (
                                        <div key={group}>
                                            <h4 className="text-lg font-bold text-gray-900 mb-3">{group}</h4>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">D</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GF</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GA</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GD</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pts</th>
                                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Form</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {groupStandings[group]?.map((team) => (
                                                            <tr key={team.position} className="hover:bg-gray-50">
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{team.position}</td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                                                    {team.flag ? (
                                                                        <Image
                                                                            src={team.flag}
                                                                            alt={team.team}
                                                                            width={24}
                                                                            height={16}
                                                                            className="inline-block mr-2 object-cover"
                                                                        />
                                                                    ) : (
                                                                        <span className="mr-2">🏴</span>
                                                                    )}
                                                                    {team.team}
                                                                </td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500">{team.p}</td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500">{team.w}</td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500">{team.d}</td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500">{team.l}</td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500">{team.gf}</td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500">{team.ga}</td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500">{team.gd}</td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-center font-semibold text-gray-900">{team.pts}</td>
                                                                <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-gray-500">- - - - -</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Legend */}
                                    <div className="border-t border-gray-200 pt-6 mt-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
                                            <div className="space-y-1">
                                                <p className="flex items-center gap-2">
                                                    <span className="inline-block w-1 h-4 bg-green-500"></span>
                                                    <span className="font-semibold">= Qualified next round</span>
                                                </p>
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
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <p className="text-xs font-semibold text-gray-700 mb-2">Form:</p>
                                            <div className="flex flex-wrap gap-3 text-xs text-gray-600">
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}