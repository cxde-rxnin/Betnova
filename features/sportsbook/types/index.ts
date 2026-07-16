export interface Sport {
  id: string;
  name: string;
  icon?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName?: string;
  logo: string;
}

export interface Competition {
  id: string;
  sportId: string;
  name: string;
  country: string;
  logo: string;
  season?: string;
}

export interface MatchScore {
  home: number | null;
  away: number | null;
}

export interface Match {
  id: string;
  sportId: string;
  competitionId: string;
  competitionName: string;
  homeTeam: Team;
  awayTeam: Team;
  venue?: string;
  status: "PRE_MATCH" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED";
  startTime: string; // ISO format
  liveStatus?: {
    minute?: number;
    period?: string;
  };
  score: MatchScore;
  oddsIncreasePercent?: number;
  markets?: Market[];
}

export interface MarketSelection {
  id: string;
  label: string;
  odds: number;
}

export interface Market {
  id: string;
  name: string;
  selections: MarketSelection[];
}

export interface GoalEvent {
  id: string;
  minute: number;
  scorer: string;
  assist?: string;
  isHome: boolean;
  type: string;
}

export interface MatchDetails extends Match {
  referee?: string;
  statistics?: {
    type: string;
    homeValue: number | string;
    awayValue: number | string;
  }[];
  penaltyScore?: {
    home: number;
    away: number;
  };
  goals?: GoalEvent[];
  markets?: Market[];
  prediction?: MatchPrediction;
}

export interface MatchPrediction {
  winner: {
    id: string | null;
    name: string | null;
    comment: string | null;
  };
  winOrDraw: boolean;
  underOver: string | null;
  goals: {
    home: string | null;
    away: string | null;
  };
  advice: string;
  percent: {
    home: string;
    draw: string;
    away: string;
  };
}

export interface StandingEntry {
  rank: number;
  team: Team;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  form: string;
}
