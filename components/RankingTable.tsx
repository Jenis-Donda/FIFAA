type RankingRow = {
  rank: number;
  team: string;
  code: string;
  points: string;
  pointsChange?: string;
  movement?: number;
  prevRank?: number;
};

type RankingTableProps = {
  rows: RankingRow[];
  labels?: {
    ranking: string;
    team: string;
    totalPoints: string;
    pointsChange: string;
  };
};

// Country code to flag emoji mapping
function getCountryFlag(code: string): string {
  const flagMap: Record<string, string> = {
    ESP: "🇪🇸",
    ARG: "🇦🇷",
    FRA: "🇫🇷",
    ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    BRA: "🇧🇷",
    USA: "🇺🇸",
    GER: "🇩🇪",
    SWE: "🇸🇪",
    JPN: "🇯🇵",
    NED: "🇳🇱",
    POR: "🇵🇹",
    ITA: "🇮🇹",
    BEL: "🇧🇪",
    COL: "🇨🇴",
    URU: "🇺🇾",
    MEX: "🇲🇽",
    CRO: "🇭🇷",
    MAR: "🇲🇦",
    SEN: "🇸🇳",
    NGA: "🇳🇬",
    KOR: "🇰🇷",
    AUS: "🇦🇺",
    CAN: "🇨🇦",
    CHN: "🇨🇳",
  };
  return flagMap[code] || "🏳️";
}

function MovementIndicator({ movement }: { movement: number }) {
  if (movement > 0) {
    return (
      <span className="inline-flex items-center text-green-600 text-xs font-semibold ml-2">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="mr-0.5">
          <path d="M12 4L4 12H9V20H15V12H20L12 4Z" fill="currentColor" />
        </svg>
        {movement}
      </span>
    );
  }
  if (movement < 0) {
    return (
      <span className="inline-flex items-center text-red-500 text-xs font-semibold ml-2">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="mr-0.5">
          <path d="M12 20L20 12H15V4H9V12H4L12 20Z" fill="currentColor" />
        </svg>
        {Math.abs(movement)}
      </span>
    );
  }
  return <span className="text-content-muted text-xs ml-2">-</span>;
}

export default function RankingTable({ rows, labels }: RankingTableProps) {
  const defaultLabels = {
    ranking: "Ranking",
    team: "Team",
    totalPoints: "Total Points",
    pointsChange: "+/- points",
  };
  const l = { ...defaultLabels, ...labels };

  return (
    <div className="overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[70px_1fr_130px_100px] gap-2 py-3 text-xs font-semibold text-content-muted uppercase tracking-wider">
        <div>{l.ranking}</div>
        <div>{l.team}</div>
        <div className="text-center">{l.totalPoints}</div>
        <div className="text-center">{l.pointsChange}</div>
      </div>

      {/* Rows */}
      {rows.map((row) => (
        <div
          key={row.code}
          className="grid grid-cols-[70px_1fr_130px_100px] gap-2 py-4 items-center bg-white rounded-xl mb-2 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Rank & Movement */}
          <div className="flex items-center pl-4">
            <span className="font-bold text-navy-950 text-base">{row.rank}</span>
            {row.movement !== undefined && (
              <MovementIndicator movement={row.movement} />
            )}
          </div>

          {/* Team */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getCountryFlag(row.code)}</span>
            <span className="font-semibold text-navy-950">{row.team}</span>
          </div>

          {/* Points */}
          <div className="text-center font-semibold text-brand-blue">
            {row.points}
          </div>

          {/* Points Change */}
          <div className={`text-center font-medium ${
            row.pointsChange?.startsWith("+") 
              ? "text-green-600" 
              : row.pointsChange?.startsWith("-") 
                ? "text-red-500" 
                : "text-content-muted"
          }`}>
            {row.pointsChange || "-"}
          </div>
        </div>
      ))}
    </div>
  );
}
