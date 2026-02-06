import { NextRequest, NextResponse } from "next/server";
import { fetchMatchesData, fetchMatches, extractCompetitionMetadata } from "@/lib/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const language = searchParams.get("language") || "en";
  const count = parseInt(searchParams.get("count") || "500", 10);

  if (!from || !to) {
    return NextResponse.json(
      { error: "Missing required parameters: from and to" },
      { status: 400 }
    );
  }

  try {
    const matches = await fetchMatchesData(from, to, language, count);
    
    // Also fetch raw matches to extract competition metadata (seasonId, stageId)
    const rawMatchesData = await fetchMatches(from, to, language, count);
    const competitionMetadata = rawMatchesData?.Results 
      ? extractCompetitionMetadata(rawMatchesData.Results)
      : new Map();
    
    // Convert metadata map to object for easier access
    const metadataObj: Record<string, { competitionId: string; seasonId: string; stageId: string; competitionName: string }> = {};
    competitionMetadata.forEach((value, key) => {
      metadataObj[key] = value;
    });
    
    return NextResponse.json({ matches, competitionMetadata: metadataObj });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

