import { ISportsProvider } from "./types";
import { Match, MatchDetails, Sport, Competition, StandingEntry, Market } from "../types";
import { LogoService } from "../services/LogoService";

const API_KEY = process.env.THE_ODDS_API_KEY || process.env.SPORTS_API_KEY;
const API_URL = "https://api.the-odds-api.com/v4";

export class TheOddsApiProvider implements ISportsProvider {
  private async fetchApi(endpoint: string, params: Record<string, string> = {}) {
    if (!API_KEY) {
      throw new Error("THE_ODDS_API_KEY is not defined in environment variables. Please get one from the-odds-api.com");
    }

    const url = new URL(`${API_URL}${endpoint}`);
    url.searchParams.append("apiKey", API_KEY);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url.toString(), {
      method: "GET",
      next: { revalidate: 300 } // Cache for 5 minutes by default to heavily save API quota
    });

    if (!response.ok) {
      console.error(`The Odds API error: ${response.status} ${response.statusText}`);
      throw new Error(`The Odds API error: ${response.status}`);
    }

    return await response.json();
  }

  async getSports(): Promise<Sport[]> {
    const data = await this.fetchApi("/sports", { all: "false" });
    
    // Group sports into a unique list of main categories to avoid clutter
    const uniqueGroups = new Set<string>();
    const sports: Sport[] = [];
    
    for (const item of data) {
      if (!uniqueGroups.has(item.group)) {
        uniqueGroups.add(item.group);
        sports.push({
          id: item.group.toLowerCase().replace(/\s+/g, ""),
          name: item.group,
          icon: this.getIconForGroup(item.group)
        });
      }
    }
    
    return sports.length > 0 ? sports : [{ id: "football", name: "Football", icon: "⚽" }];
  }

  private getIconForGroup(group: string): string {
    const g = group.toLowerCase();
    if (g.includes("soccer") || g.includes("football")) return "⚽";
    if (g.includes("basketball")) return "🏀";
    if (g.includes("tennis")) return "🎾";
    if (g.includes("baseball")) return "⚾";
    if (g.includes("hockey")) return "🏒";
    if (g.includes("golf")) return "⛳";
    if (g.includes("mma") || g.includes("boxing")) return "🥊";
    if (g.includes("cricket")) return "🏏";
    if (g.includes("rugby")) return "🏉";
    return "🏆";
  }

  async getCompetitions(sportId: string): Promise<Competition[]> {
    // The Odds API treats specific leagues as 'sports' (e.g. soccer_epl).
    // We map our 'sportId' (group) back to their keys.
    const data = await this.fetchApi("/sports", { all: "false" });
    const comps = data.filter((item: any) => item.group.toLowerCase().replace(/\s+/g, "") === sportId);
    
    return comps.map((item: any) => ({
      id: item.key,
      sportId: sportId,
      name: item.title,
      country: "International", // The Odds API doesn't provide explicit country fields reliably
      logo: "", // The Odds API doesn't provide logos
      season: new Date().getFullYear().toString()
    }));
  }

  private mapEventToMatch(event: any, sportGroup: string, scoreData?: any): Match {
    // The Odds API does not provide live minute/period on the /odds endpoint.
    // It provides them on the /scores endpoint. For a basic integration, we infer status from commence_time.
    const commenceTime = new Date(event.commence_time);
    const now = new Date();
    
    let status: Match["status"] = "PRE_MATCH";
    
    // Use explicit score data to determine status if available
    if (scoreData) {
      if (scoreData.completed) {
        status = "FINISHED";
      } else if (now >= commenceTime) {
        status = "LIVE";
      }
    } else {
      // Fallback inference if score data is omitted (e.g. for upcoming matches to save quota)
      if (now >= commenceTime && now.getTime() < commenceTime.getTime() + (2 * 60 * 60 * 1000)) {
        status = "LIVE"; 
      } else if (now.getTime() >= commenceTime.getTime() + (2 * 60 * 60 * 1000)) {
        status = "FINISHED";
      }
    }

    const markets: Market[] = [];
    const bestBookmaker = event.bookmakers?.[0];
    if (bestBookmaker && bestBookmaker.markets) {
      for (const mkt of bestBookmaker.markets) {
        markets.push({
          id: mkt.key,
          name: mkt.key === 'h2h' ? 'Match Result' : mkt.key.toUpperCase(),
          selections: mkt.outcomes.map((o: any) => ({
            id: `${mkt.key}_${o.name}`,
            label: o.name,
            odds: o.price
          }))
        });
      }
    }

    let score = { home: null, away: null };
    if (scoreData && scoreData.scores) {
      const homeScore = scoreData.scores.find((s: any) => s.name === event.home_team)?.score;
      const awayScore = scoreData.scores.find((s: any) => s.name === event.away_team)?.score;
      if (homeScore !== undefined && awayScore !== undefined) {
        score = { home: homeScore, away: awayScore };
      }
    }

    return {
      id: event.id,
      sportId: sportGroup !== "upcoming" ? sportGroup : event.sport_key,
      competitionId: event.sport_key,
      competitionName: event.sport_title,
      homeTeam: { id: event.home_team, name: event.home_team, logo: "" }, // Will be injected later
      awayTeam: { id: event.away_team, name: event.away_team, logo: "" }, // Will be injected later
      status,
      startTime: event.commence_time,
      score
    };
  }

  async getLiveMatches(sportId?: string): Promise<Match[]> {
    const targetSport = sportId && sportId !== "upcoming" ? sportId : "upcoming";
    
    try {
      const [oddsData, scoresData] = await Promise.all([
        this.fetchApi(`/sports/${targetSport}/odds`, { regions: "us,uk,eu", markets: "h2h" }).catch(() => []),
        targetSport === "upcoming" ? Promise.resolve([]) : this.fetchApi(`/sports/${targetSport}/scores`, { daysFrom: "1" }).catch(() => [])
      ]);

      const scoresMap = new Map(scoresData.map((s: any) => [s.id, s]));

      const rawMatches = oddsData.map((item: any) => this.mapEventToMatch(item, sportId || "upcoming", scoresMap.get(item.id)));
      const matches = rawMatches.filter((m: Match) => m.status === "LIVE");

      return await this.injectLogos(matches);
    } catch (e) {
      console.warn("Failed to fetch live matches:", e);
      return [];
    }
  }

  async getUpcomingMatches(sportId?: string, date?: string): Promise<Match[]> {
    const targetSport = sportId && sportId !== "upcoming" ? sportId : "upcoming";
    
    try {
      const data = await this.fetchApi(`/sports/${targetSport}/odds`, { regions: "us,uk,eu", markets: "h2h" });
      const rawMatches = data.map((item: any) => this.mapEventToMatch(item, sportId || "upcoming"));
      const matches = rawMatches.filter((m: Match) => m.status === "PRE_MATCH");

      return await this.injectLogos(matches);
    } catch (e) {
      console.warn("Failed to fetch upcoming matches:", e);
      return [];
    }
  }

  private async injectLogos(matches: Match[]): Promise<Match[]> {
    if (matches.length === 0) return matches;

    const teamNames = new Set<string>();
    matches.forEach((m) => {
      teamNames.add(m.homeTeam.name);
      teamNames.add(m.awayTeam.name);
    });

    const logosMap = await LogoService.getLogosForTeams(Array.from(teamNames));

    return matches.map((m, index) => {
      m.homeTeam.logo = logosMap[m.homeTeam.name] || LogoService.getFallbackLogo(m.homeTeam.name, true);
      m.awayTeam.logo = logosMap[m.awayTeam.name] || LogoService.getFallbackLogo(m.awayTeam.name, false);
      return m;
    });
  }

  async getMatchDetails(matchId: string): Promise<MatchDetails | null> {
    try {
      // Fetch odds and scores concurrently
      const [oddsData, scoresData] = await Promise.all([
        this.fetchApi(`/sports/upcoming/odds`, { regions: "us,uk,eu", markets: "h2h", eventIds: matchId }).catch(() => null),
        Promise.resolve(null) // /sports/upcoming/scores endpoint does not exist
      ]);
      
      if (!oddsData || oddsData.length === 0) return null;
      
      const event = oddsData[0];
      const scoreEvent = scoresData ? (scoresData as any[]).find((s: any) => s.id === matchId) : null;

      const match = this.mapEventToMatch(event, "upcoming", scoreEvent);
      const matchWithLogos = (await this.injectLogos([match]))[0];

      return {
        ...matchWithLogos,
        statistics: []
      };
    } catch (e) {
      console.warn("Failed to fetch match details:", e);
      return null;
    }
  }

  async getStandings(competitionId: string, season?: string): Promise<StandingEntry[]> {
    // The Odds API DOES NOT provide standings or league tables.
    return [];
  }
}
