import { NextRequest, NextResponse } from "next/server";
import { fetchStandingsData } from "@/lib/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const competitionId = searchParams.get("competitionId");
  const seasonId = searchParams.get("seasonId");
  const stageId = searchParams.get("stageId");
  const language = searchParams.get("language") || "en";

  if (!competitionId || !seasonId || !stageId) {
    return NextResponse.json(
      { error: "Missing required parameters: competitionId, seasonId, and stageId are required" },
      { status: 400 }
    );
  }

  try {
    const standings = await fetchStandingsData(
      competitionId,
      seasonId,
      stageId,
      language
    );
    return NextResponse.json({ standings });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch standings" },
      { status: 500 }
    );
  }
}

