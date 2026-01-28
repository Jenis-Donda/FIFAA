// FIFA API Types

export interface HeroImage {
  entryId: string;
  title: string;
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

export interface HeroItem {
  entryId: string;
  title: string;
  heroImage: HeroImage;
  heroImageMobile: HeroImage;
  roofline: string;
  rooflineSecondary: string;
  readMorePageUrl: string;
  description: string;
  ctaButtonText: string;
  cardCategory?: number;
  programmeType?: number;
}

export interface HeroSection {
  entryId: string;
  rooflineType: string;
  heroItems: HeroItem[];
  automatedSection: boolean;
}

export interface PageMeta {
  title: string;
  description: string;
  image: string;
}

export interface FIFAPageSection {
  entryId: string;
  entryType: string;
  properties: Record<string, unknown>;
  entryEndpoint: string;
  heroSection?: HeroSection;
  news?: { layout: number };
}

export interface FIFAPageResponse {
  pageId: string;
  internalTitle: string;
  template: string;
  layout: number;
  createdDate: string;
  updatedDate: string;
  relativeUrl: string;
  relativeUrlsSEO: Record<string, string>;
  language: string;
  meta: PageMeta;
  sections: FIFAPageSection[];
  backgroundCSS: string;
  headerBehavior: string;
  tournamentState: string;
}

// News API Types
export interface NewsImage {
  entryId: string;
  title: string;
  src: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
}

export interface NewsItem {
  entryId: string;
  title: string;
  internalTitle: string;
  slug: string;
  previewText: string;
  publishedDate: string;
  tags: string[];
  articlePageUrl: string;
  image: NewsImage;
  assetType: number;
  cardCategory: number;
  roofline: string;
  programmeType: number;
}

export interface NewsResponse {
  entryType: string;
  entryId: string;
  title: string;
  internalTitle: string;
  rooflineType: string;
  layout: number;
  items: NewsItem[];
  seeAllLink: string;
}

// Transformed types for components
export interface CarouselSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  imageMobile: string;
  category: string;
  link: string;
}

export interface Story {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  image: string;
  link: string;
}

// Rankings API Types
export interface TeamNameLocale {
  Locale: string;
  Description: string;
}

export interface RankingTeam {
  IdTeam: string;
  TeamName: TeamNameLocale[];
  Gender: number;
  IdConfederation: string;
  RankingMovement: number;
  RankingMovementString: string;
  ConfederationName: string;
  IdCountry: string;
  Rank: number;
  IdSchedule: string;
  PrevRank: number;
  EOYRank: number;
  TotalPoints: number;
  DecimalTotalPoints: number;
  PrevPoints: number;
  StatusRanked: number;
  DecimalPrevPoints: number;
  EOYPoints: number;
  DecimalEOYPoints: number;
  Matches: number;
  PubDate: string;
  PrePubDate: string;
  EOYPubDate: string;
  NextPubDate: string | null;
  Properties: Record<string, unknown>;
  IsUpdateable: boolean | null;
}

export interface RankingsResponse {
  ContinuationToken: string | null;
  ContinuationHash: string | null;
  Results: RankingTeam[];
}

// Transformed ranking row for component
export interface RankingRow {
  rank: number;
  team: string;
  code: string;
  points: string;
  pointsChange: string;
  movement: number; // positive = up, negative = down, 0 = no change
  prevRank: number;
}

export interface RankingsData {
  men: RankingRow[];
  women: RankingRow[];
  mensLastUpdate: string;
  womensLastUpdate: string;
}

// Inside FIFA / Promo Carousel API Types
export interface PromoCarouselImage {
  entryId: string;
  title: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface PromoCarouselItem {
  entryId: string;
  title: string;
  internalTitle: string;
  externalLinkType: string;
  readMorePageUrl: string;
  image: PromoCarouselImage;
  programmeType: number;
  readMoreTarget: string;
  cardCategory: number;
}

export interface PromoCarouselResponse {
  entryId: string;
  entryType: string;
  internalTitle: string;
  rooflineType: string;
  size: number;
  carouselType: number;
  title: string;
  seeAllLabel: string;
  seeAllLink: string;
  items: PromoCarouselItem[];
}

// Transformed type for Inside FIFA component
export interface InsideFIFAItem {
  id: string;
  title: string;
  image: string;
  link: string;
  target: string;
}

export interface InsideFIFAData {
  title: string;
  seeAllLabel: string;
  seeAllLink: string;
  items: InsideFIFAItem[];
}

// Match Centre API Types
export interface MatchTeam {
  IdTeam: string;
  TeamName: TeamNameLocale[];
  ShortClubName?: string;
  Abbreviation?: string;
  PictureUrl?: string;
  Score?: number;
  IdCountry?: string;
}

export interface MatchCompetition {
  IdCompetition: string;
  CompetitionName: TeamNameLocale[];
  IdSeason: string;
  SeasonName?: TeamNameLocale[];
}

export interface MatchStage {
  IdStage: string;
  StageName: TeamNameLocale[];
  StageType?: number;
}

export interface MatchVenue {
  IdVenue: string;
  VenueName: TeamNameLocale[];
  IdCity: string;
  CityName?: TeamNameLocale[];
  IdCountry: string;
}

export interface MatchAPIItem {
  IdMatch: string;
  IdStage: string;
  IdGroup?: string | null;
  IdCompetition: string;
  IdSeason: string;
  MatchDay?: string;
  MatchStatus: number;
  MatchTime?: string;
  Date: string;
  LocalDate: string;
  Home: MatchTeam;
  Away: MatchTeam;
  Stadium?: {
    IdStadium?: string | null;
    Name?: TeamNameLocale[];
    Capacity?: number;
    CityName?: TeamNameLocale[];
    IdCity?: string;
    IdCountry?: string;
    Street?: string;
    Latitude?: number;
    Longitude?: number;
    [key: string]: unknown;
  };
  CompetitionName?: TeamNameLocale[];
  SeasonName?: TeamNameLocale[];
  StageName?: TeamNameLocale[];
  GroupName?: TeamNameLocale[];
  HomeTeamScore?: number;
  AwayTeamScore?: number;
  AggregateHomeTeamScore?: number | null;
  AggregateAwayTeamScore?: number | null;
  Winner?: string;
  MatchNumber?: number | null;
  TimeDefined?: boolean;
  OfficialityStatus?: number;
  Attendance?: string;
  Officials?: Array<{
    IdCountry?: string;
    OfficialId?: string;
    NameShort?: TeamNameLocale[];
    Name?: TeamNameLocale[];
    OfficialType?: number;
    TypeLocalized?: TeamNameLocale[];
  }>;
  Properties?: Record<string, unknown>;
  [key: string]: unknown; // Allow additional properties
}

export interface MatchesAPIResponse {
  ContinuationToken?: string;
  ContinuationHash?: string;
  Results: MatchAPIItem[];
}

// Standings API Types
export interface StandingTeam {
  IdTeam: string;
  Name?: TeamNameLocale[];  // API returns Name for standings
  TeamName?: TeamNameLocale[];  // Fallback field
  Abbreviation?: string;
  ShortClubName?: string;
  PictureUrl?: string;
  IdCountry?: string;
  IdConfederation?: string;
  City?: string;
}

// Match result in standings API
export interface StandingMatchResult {
  IdMatch: string;
  StartTime: string;
  Result: number; // 0 = home win, 1 = away win, 2 = draw, 3 = not played
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  HomeTeamId: string;
  AwayTeamId: string;
}

export interface StandingEntry {
  IdTeam: string;
  Team: StandingTeam;
  Position: number;
  Played: number;
  Won: number;
  Drawn: number;
  Lost: number;
  For: number;
  Against: number;
  GoalsDifference?: number;
  GoalsDiference?: number; // API typo - sometimes returned as this
  Points: number;
  MatchResults?: StandingMatchResult[]; // Last matches for form
  HomeWon?: number;
  HomeDrawn?: number;
  HomeLost?: number;
  HomeFor?: number;
  HomeAgainst?: number;
  AwayWon?: number;
  AwayDrawn?: number;
  AwayLost?: number;
  AwayFor?: number;
  AwayAgainst?: number;
}

export interface StandingsGroup {
  IdGroup?: string;
  GroupName?: TeamNameLocale[];
  Entries: StandingEntry[];
}

export interface StandingsAPIResponse {
  IdCompetition: string;
  IdSeason: string;
  IdStage: string;
  Competition?: MatchCompetition;
  Stage?: MatchStage;
  Groups?: StandingsGroup[];
  Results?: StandingEntry[];
}

// Transformed types for Match Centre components
export interface Match {
  id: string;
  idMatch: string;
  idCompetition: string;
  idSeason: string;
  idStage: string;
  homeTeam: string;
  homeTeamAbbr: string;
  homeTeamLogo?: string;
  homeScore?: number;
  awayTeam: string;
  awayTeamAbbr: string;
  awayTeamLogo?: string;
  awayScore?: number;
  time: string;
  date: string;
  status: "scheduled" | "live" | "finished";
  statusCode?: number;
  competition: string;
  competitionId?: string;
  competitionLogo?: string;
  seasonName?: string;
  matchDay?: number;
  venue?: string;
  winner?: string;
}

export interface MatchesByCompetition {
  competition: string;
  competitionId?: string;
  competitionLogo?: string;
  seasonName?: string;
  matchDay?: number;
  date: string; // Date string for grouping (YYYY-MM-DD format)
  matches: Match[];
}

export interface Standing {
  position: number;
  team: string;
  teamId?: string;
  teamAbbr: string;
  teamLogo?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form?: ("W" | "D" | "L" | "-")[]; // Last 5 match results
}

// Head-to-Head API Types
export interface HeadToHeadTeamStats {
  IdTeam: string;
  TeamName: TeamNameLocale[];
  PictureUrl?: string;
  IdCountry?: string;
  MatchesPlayed: number;
  Wins: number;
  Losses: number;
  Draws: number;
  GoalsScored: number;
  GoalsAgainst: number;
}

export interface HeadToHeadAPIResponse {
  TeamA: HeadToHeadTeamStats;
  TeamB: HeadToHeadTeamStats;
  MatchesList: MatchAPIItem[];
  Properties?: Record<string, unknown> | null;
  IsUpdateable?: boolean | null;
}

