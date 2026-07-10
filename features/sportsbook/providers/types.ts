import { Match, MatchDetails, Sport, Competition, StandingEntry } from "../types";

export interface ISportsProvider {
  /** Gets a list of supported sports */
  getSports(): Promise<Sport[]>;
  
  /** Gets competitions for a given sport */
  getCompetitions(sportId: string): Promise<Competition[]>;
  
  /** Gets live matches, optionally filtered by sport */
  getLiveMatches(sportId?: string): Promise<Match[]>;
  
  /** Gets upcoming matches for a given sport and/or date */
  getUpcomingMatches(sportId?: string, date?: string): Promise<Match[]>;
  
  /** Gets detailed information for a specific match */
  getMatchDetails(matchId: string): Promise<MatchDetails | null>;
  
  /** Gets standings for a specific competition and season */
  getStandings(competitionId: string, season?: string): Promise<StandingEntry[]>;
}
