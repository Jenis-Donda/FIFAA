import Image from "next/image";

type TeamStanding = {
  position: number;
  teamName: string;
  teamAbbr: string;
  teamFlag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

type Props = {
  groupName: string;
  teams: TeamStanding[];
};

export default function GroupTable({ groupName, teams }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-[#326295] text-white px-4 py-2 font-bold text-sm">
        {groupName}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-2 py-2 font-semibold text-gray-600 w-8"></th>
              <th className="text-left px-2 py-2 font-semibold text-gray-600"></th>
              <th className="text-center px-1 py-2 font-semibold text-gray-600 w-8">P</th>
              <th className="text-center px-1 py-2 font-semibold text-gray-600 w-8">W</th>
              <th className="text-center px-1 py-2 font-semibold text-gray-600 w-8">D</th>
              <th className="text-center px-1 py-2 font-semibold text-gray-600 w-8">L</th>
              <th className="text-center px-1 py-2 font-semibold text-gray-600 w-10">GD</th>
              <th className="text-center px-1 py-2 font-semibold text-gray-600 w-10">Pts</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, idx) => (
              <tr 
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-2 py-2 text-gray-600 font-semibold">{team.position}</td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-4 flex-shrink-0">
                      <Image
                        src={team.teamFlag}
                        alt={team.teamName}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-medium text-gray-800">{team.teamAbbr}</span>
                  </div>
                </td>
                <td className="text-center px-1 py-2 text-gray-700">{team.played}</td>
                <td className="text-center px-1 py-2 text-gray-700">{team.won}</td>
                <td className="text-center px-1 py-2 text-gray-700">{team.drawn}</td>
                <td className="text-center px-1 py-2 text-gray-700">{team.lost}</td>
                <td className="text-center px-1 py-2 text-gray-700">{team.goalDifference}</td>
                <td className="text-center px-1 py-2 font-bold text-gray-900">{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}