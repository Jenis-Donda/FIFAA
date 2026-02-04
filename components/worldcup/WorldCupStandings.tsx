import GroupTable from "./GroupTable";

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

type GroupStanding = {
  groupName: string;
  teams: TeamStanding[];
};

type Props = {
  standings: GroupStanding[];
};

export default function WorldCupStandings({ standings }: Props) {
  if (!standings || standings.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          Standings
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {standings.map((group, idx) => (
            <GroupTable 
              key={idx}
              groupName={group.groupName}
              teams={group.teams}
            />
          ))}
        </div>
      </div>
    </section>
  );
}