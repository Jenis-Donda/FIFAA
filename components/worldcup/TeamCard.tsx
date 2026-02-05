import Image from "next/image";
import Link from "next/link";

interface TeamCardProps {
    team: any;
    isHost: boolean;
}

export default function TeamCard({ team, isHost }: TeamCardProps) {
    const teamName = team.teamName || "TBD";
    const primaryColor = team.teamEnrichmentData?.primaryColor || "#666666";
    const textColor = team.teamEnrichmentData?.primaryTextColor || "#FFFFFF";
    const flagUrl = team.teamFlag?.replace("{format}", "sq").replace("{size}", "1");
    const teamId = team.teamId;
    const stage = team.stage || "TBD";
    const ranking = team.worldRanking || "-";
    const appearances = team.appearances || "0";

    return (
        <Link
            href={team.teamPageUrl || `/en/teams/${teamId}`}
            className="block rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
        >
            {/* Header with flag and country name */}
            <div
                className="p-6"
                style={{ backgroundColor: primaryColor, color: textColor }}
            >
                <div className="flex items-center gap-3 mb-4">
                    {flagUrl && (
                        <div className="w-12 h-8 relative flex-shrink-0">
                            <Image
                                src={flagUrl}
                                alt={teamName}
                                fill
                                className="object-cover rounded"
                            />
                        </div>
                    )}
                </div>
                {isHost && (
                    <p className="text-xs font-medium mb-1 opacity-90">Host country</p>
                )}
                <h3 className="text-2xl font-bold">{teamName}</h3>
            </div>

            {/* Stats Section */}
            <div className="bg-white p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500 mb-1">Stage</p>
                        <p className="font-semibold text-gray-900">{stage}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-1">World Ranking</p>
                        <p className="font-semibold text-gray-900">{ranking}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-gray-500 mb-1">Participations</p>
                        <p className="font-semibold text-gray-900">{appearances}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}