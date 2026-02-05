"use client";

import { useState, useMemo } from "react";
import TeamCard from "./TeamCard";

interface TeamsProps {
    teamsData: any;
    dict: any;
}

type Confederation = "All" | "AFC" | "CAF" | "CONCACAF" | "CONMEBOL" | "OFC" | "UEFA";

export default function Teams({ teamsData, dict }: TeamsProps) {
    const [selectedConfederation, setSelectedConfederation] = useState<Confederation>("All");

    const confederations: Confederation[] = ["All", "AFC", "CAF", "CONCACAF", "CONMEBOL", "OFC", "UEFA"];

    const { hostCountries, qualifiedTeams } = useMemo(() => {
        if (!teamsData?.teams) return { hostCountries: [], qualifiedTeams: [] };

        const hosts: any[] = [];
        const qualified: any[] = [];

        teamsData.teams.forEach((team: any) => {
            if (team.hostTeam) {
                hosts.push(team);
            } else {
                qualified.push(team);
            }
        });

        return { hostCountries: hosts, qualifiedTeams: qualified };
    }, [teamsData]);

    const filteredHostCountries = useMemo(() => {
        if (selectedConfederation === "All") return hostCountries;
        return hostCountries.filter((team: any) =>
            team.confederationId === selectedConfederation
        );
    }, [hostCountries, selectedConfederation]);

    const filteredQualifiedTeams = useMemo(() => {
        if (selectedConfederation === "All") return qualifiedTeams;
        return qualifiedTeams.filter((team: any) =>
            team.confederationId === selectedConfederation
        );
    }, [qualifiedTeams, selectedConfederation]);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Confederation Tabs */}
                <div className="mb-8 border-b border-gray-200">
                    <div className="flex gap-6 overflow-x-auto">
                        {confederations.map((conf) => (
                            <button
                                key={conf}
                                onClick={() => setSelectedConfederation(conf)}
                                className={`pb-4 px-2 text-sm font-medium whitespace-nowrap transition-colors ${selectedConfederation === conf
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {conf}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Host Countries Section - Only show if there are filtered host countries */}
                {filteredHostCountries.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Host country</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredHostCountries.map((team: any) => (
                                <TeamCard key={team.teamId} team={team} isHost={true} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Qualified Teams Section */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Qualified teams</h2>
                    {filteredQualifiedTeams.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredQualifiedTeams.map((team: any) => (
                                <TeamCard key={team.teamId} team={team} isHost={false} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No teams found for this confederation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}