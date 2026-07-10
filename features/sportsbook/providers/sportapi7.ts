import { ISportsProvider } from "./types";
import { Match, MatchDetails, Sport, Competition, StandingEntry, Market } from "../types";
import { LogoService } from "../services/LogoService";

const API_KEY = process.env.SPORTAPI7_KEY;
const API_URL = "https://sportapi7.p.rapidapi.com/api/v1";

export class SportApi7Provider implements ISportsProvider {
  private async fetchApi(endpoint: string, params: Record<string, string> = {}) {
    if (!API_KEY) {
      throw new Error("SPORTAPI7_KEY is not defined in environment variables.");
    }

    const url = new URL(`${API_URL}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "sportapi7.p.rapidapi.com"
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
      console.error(`SportApi7 error: ${response.status} ${response.statusText}`);
      throw new Error(`SportApi7 error: ${response.status}`);
    }

    return await response.json();
  }

  private categoryMap: Record<string, number> = {
    football: 1,
    basketball: 2,
    tennis: 3,
    "ice-hockey": 4,
    volleyball: 5,
    handball: 6,
    esports: 7,
    baseball: 8,
    "american-football": 9,
    rugby: 12,
    darts: 13,
    snooker: 14,
    cricket: 19
  };

  async getSports(): Promise<Sport[]> {
    return [
      { id: "football", name: "Football", icon: "⚽" },
      { id: "basketball", name: "Basketball", icon: "🏀" },
      { id: "tennis", name: "Tennis", icon: "🎾" },
      { id: "baseball", name: "Baseball", icon: "⚾" },
      { id: "american-football", name: "American Football", icon: "🏈" },
      { id: "ice-hockey", name: "Ice Hockey", icon: "🏒" },
      { id: "volleyball", name: "Volleyball", icon: "🏐" },
      { id: "esports", name: "Esports", icon: "🎮" },
      { id: "cricket", name: "Cricket", icon: "🏏" },
      { id: "rugby", name: "Rugby", icon: "🏉" },
      { id: "darts", name: "Darts", icon: "🎯" },
      { id: "snooker", name: "Snooker", icon: "🎱" }
    ];
  }

  async getCompetitions(sportId: string): Promise<Competition[]> {
    return []; // For brevity, we are not loading competitions dynamically right now.
  }

  private mapEventToMatch(event: any, sportGroup: string = "football"): Match {
    let status: Match["status"] = "PRE_MATCH";
    
    // SportApi7 status codes mapping
    // code 0 = Not started
    // code 6, 7 = Live (1st half, 2nd half)
    // code 31 = Halftime
    // code 100 = Ended
    if (event.status?.type === "inprogress") status = "LIVE";
    else if (event.status?.type === "finished") status = "FINISHED";
    else if (event.status?.type === "canceled" || event.status?.type === "postponed") status = "POSTPONED";

    return {
      id: event.id.toString(),
      sportId: sportGroup,
      competitionId: event.tournament?.uniqueTournament?.id?.toString() || "0",
      competitionName: event.tournament?.name || "Unknown Tournament",
      homeTeam: { 
        id: event.homeTeam?.id?.toString() || "0", 
        name: event.homeTeam?.name || "Home", 
        logo: "" 
      },
      awayTeam: { 
        id: event.awayTeam?.id?.toString() || "0", 
        name: event.awayTeam?.name || "Away", 
        logo: "" 
      },
      status,
      startTime: new Date(event.startTimestamp * 1000).toISOString(),
      score: {
        home: event.homeScore?.current !== undefined ? event.homeScore.current : null,
        away: event.awayScore?.current !== undefined ? event.awayScore.current : null
      },
      liveStatus: status === "LIVE" ? {
        minute: event.time?.currentPeriodStartTimestamp 
            ? Math.floor((Date.now() / 1000 - event.time.currentPeriodStartTimestamp) / 60)
            : undefined,
        period: event.status?.description || "Live"
      } : undefined
    };
  }

  private async injectLogos(matches: Match[]): Promise<Match[]> {
    if (matches.length === 0) return matches;

    const teamNames = new Set<string>();
    matches.forEach((m) => {
      teamNames.add(m.homeTeam.name);
      teamNames.add(m.awayTeam.name);
    });

    const logosMap = await LogoService.getLogosForTeams(Array.from(teamNames));

    return matches.map((m) => {
      m.homeTeam.logo = logosMap[m.homeTeam.name] || LogoService.getFallbackLogo(m.homeTeam.name, true);
      m.awayTeam.logo = logosMap[m.awayTeam.name] || LogoService.getFallbackLogo(m.awayTeam.name, false);
      return m;
    });
  }

  async getLiveMatches(sportId?: string): Promise<Match[]> {
    try {
      const activeSport = sportId || "football";
      const data = await this.fetchApi(`/sport/${activeSport}/events/live`);
      
      if (!data.events) return [];

      const rawMatches = data.events.map((item: any) => this.mapEventToMatch(item, sportId || "football"));
      
      return await this.injectLogos(rawMatches);
    } catch (e) {
      console.warn("Failed to fetch live matches:", e);
      return [];
    }
  }

  async getUpcomingMatches(sportId?: string, date?: string): Promise<Match[]> {
    try {
      const activeSport = sportId || "football";
      const categoryId = this.categoryMap[activeSport] || 1;
      const targetDate = date || new Date().toISOString().split('T')[0];
      const data = await this.fetchApi(`/category/${categoryId}/scheduled-events/${targetDate}`);
      
      if (!data.events) return [];

      const rawMatches = data.events.map((item: any) => this.mapEventToMatch(item, sportId || "football"));
      const matches = rawMatches.filter((m: Match) => m.status === "PRE_MATCH");

      return await this.injectLogos(matches);
    } catch (e) {
      console.warn("Failed to fetch upcoming matches:", e);
      return [];
    }
  }

  async getMatchDetails(matchId: string): Promise<MatchDetails | null> {
    try {
      const data = await this.fetchApi(`/event/${matchId}`);
      if (!data.event) return null;

      const match = this.mapEventToMatch(data.event, "football");
      const matchWithLogos = (await this.injectLogos([match]))[0];

      return {
        ...matchWithLogos,
        statistics: []
      };
    } catch (e: any) {
      console.warn("Failed to fetch match details:", e);
      if (e.message?.includes("429")) {
        throw new Error("Rate limit exceeded");
      }
      return null;
    }
  }

  async getStandings(competitionId: string, season?: string): Promise<StandingEntry[]> {
    return [];
  }
}
