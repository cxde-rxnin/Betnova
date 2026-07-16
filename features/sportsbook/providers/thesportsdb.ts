import { ISportsProvider } from "./types";
import { Match, MatchDetails, Sport, Competition, StandingEntry, Market } from "../types";

const API_KEY = process.env.THESPORTSDB_API_KEY;
const API_URL = "https://www.thesportsdb.com/api/v1/json";

export class TheSportsDBProvider implements ISportsProvider {
  // Map internal Betnova sport IDs to TheSportsDB strSport strings
  private categoryMap: Record<string, string> = {
    "football": "Soccer",
    "basketball": "Basketball",
    "tennis": "Tennis",
    "ice-hockey": "Ice Hockey",
    "volleyball": "Volleyball",
    "baseball": "Baseball",
    "mma": "Fighting",
    "esports": "ESports",
    "cricket": "Cricket",
    "american-football": "American Football",
    "rugby": "Rugby",
    "boxing": "Fighting",
    "golf": "Golf",
    "motorsport": "Motorsport"
  };

  private reverseCategoryMap: Record<string, string> = {};

  constructor() {
    Object.keys(this.categoryMap).forEach(key => {
      this.reverseCategoryMap[this.categoryMap[key]] = key;
    });
  }

  private async fetchApi(endpoint: string, revalidate: number = 60) {
    if (!API_KEY) {
      throw new Error("THESPORTSDB_API_KEY is not defined in environment variables.");
    }

    const url = `${API_URL}/${API_KEY}${endpoint}`;
    
    const response = await fetch(url, {
      method: "GET",
      next: { revalidate }
    });

    if (!response.ok) {
      console.error(`TheSportsDB error: ${response.status} on ${endpoint}`);
      throw new Error(`TheSportsDB error: ${response.status}`);
    }

    return response.json();
  }

  private mapEventToMatch(event: any): Match {
    const isLive = event.strStatus !== "Not Started" && event.strStatus !== "NS" && event.strStatus !== "Match Finished" && event.strStatus !== "FT" && event.strStatus !== "AOT" && event.strStatus !== "Postponed" && event.strStatus !== "Cancelled";
    const isFinished = event.strStatus === "Match Finished" || event.strStatus === "FT" || event.strStatus === "AOT";

    return {
      id: event.idEvent,
      sportId: this.reverseCategoryMap[event.strSport] || event.strSport.toLowerCase().replace(/ /g, '-'),
      competitionId: event.idLeague,
      competitionName: event.strLeague,
      homeTeam: {
        id: event.idHomeTeam,
        name: event.strHomeTeam,
        logo: event.strHomeTeamBadge || null
      },
      awayTeam: {
        id: event.idAwayTeam,
        name: event.strAwayTeam,
        logo: event.strAwayTeamBadge || null
      },
      startTime: event.strTimestamp || `${event.dateEvent}T${event.strTime}`,
      status: isLive ? "LIVE" : isFinished ? "FINISHED" : "PRE_MATCH",
      score: (event.intHomeScore !== null && event.intAwayScore !== null) ? {
        home: parseInt(event.intHomeScore),
        away: parseInt(event.intAwayScore)
      } : {
        home: null,
        away: null,
      },
      liveStatus: isLive ? {
        period: event.strStatus,
        minute: event.strProgress || undefined
      } : undefined
    };
  }

  async getSports(): Promise<Sport[]> {
    return [
      { id: "football", name: "Football", icon: "⚽" },
      { id: "basketball", name: "Basketball", icon: "🏀" },
      { id: "tennis", name: "Tennis", icon: "🎾" },
      { id: "ice-hockey", name: "Ice Hockey", icon: "🏒" },
      { id: "volleyball", name: "Volleyball", icon: "🏐" },
      { id: "baseball", name: "Baseball", icon: "⚾" },
      { id: "mma", name: "MMA", icon: "🥊" },
      { id: "esports", name: "Esports", icon: "🎮" },
      { id: "cricket", name: "Cricket", icon: "🏏" }
    ];
  }

  async getCompetitions(sportId: string): Promise<Competition[]> {
    return [];
  }

  async getLiveMatches(sportId?: string): Promise<Match[]> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      if (sportId) {
        const sportStr = this.categoryMap[sportId];
        if (!sportStr) return [];
        
        const data = await this.fetchApi(`/eventsday.php?d=${today}&s=${encodeURIComponent(sportStr)}`, 60);
        if (!data.events) return [];
        
        return data.events
          .filter((e: any) => e.strStatus !== "Not Started" && e.strStatus !== "NS" && e.strStatus !== "Match Finished" && e.strStatus !== "FT" && e.strStatus !== "Postponed" && e.strStatus !== "Cancelled")
          .map((e: any) => this.mapEventToMatch(e));
      } else {
        const topSports = ["football", "basketball", "tennis", "ice-hockey", "volleyball"];
        const matches: Match[] = [];
        
        for (const sport of topSports) {
          const sportStr = this.categoryMap[sport];
          if (!sportStr) continue;
          try {
            const data = await this.fetchApi(`/eventsday.php?d=${today}&s=${encodeURIComponent(sportStr)}`, 60);
            if (data.events) {
              const liveEvents = data.events
                .filter((e: any) => e.strStatus !== "Not Started" && e.strStatus !== "NS" && e.strStatus !== "Match Finished" && e.strStatus !== "FT" && e.strStatus !== "Postponed" && e.strStatus !== "Cancelled")
                .map((e: any) => this.mapEventToMatch(e));
              matches.push(...liveEvents);
            }
          } catch(e) { }
        }
        return matches;
      }
    } catch (error) {
      console.error("Error fetching live matches:", error);
      return [];
    }
  }

  async getUpcomingMatches(sportId?: string, date?: string): Promise<Match[]> {
    const targetDate1 = date || new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate2 = !date ? tomorrow.toISOString().split('T')[0] : null;

    try {
      if (sportId) {
        const sportStr = this.categoryMap[sportId];
        if (!sportStr) return [];
        
        let allEvents: any[] = [];
        try {
          const data1 = await this.fetchApi(`/eventsday.php?d=${targetDate1}&s=${encodeURIComponent(sportStr)}`, 3600);
          if (data1.events) allEvents = allEvents.concat(data1.events);
        } catch(e) {}
        
        if (targetDate2) {
          try {
            const data2 = await this.fetchApi(`/eventsday.php?d=${targetDate2}&s=${encodeURIComponent(sportStr)}`, 3600);
            if (data2.events) allEvents = allEvents.concat(data2.events);
          } catch(e) {}
        }
        
        return allEvents
          .filter((e: any) => e.strStatus === "Not Started" || e.strStatus === "NS")
          .map((e: any) => this.mapEventToMatch(e));
      } else {
        const topSports = ["football", "basketball", "tennis", "ice-hockey", "volleyball"];
        const matches: Match[] = [];
        
        for (const sport of topSports) {
          const sportStr = this.categoryMap[sport];
          if (!sportStr) continue;
          
          let allEvents: any[] = [];
          try {
            const data1 = await this.fetchApi(`/eventsday.php?d=${targetDate1}&s=${encodeURIComponent(sportStr)}`, 3600);
            if (data1.events) allEvents = allEvents.concat(data1.events);
          } catch(e) {}
          
          if (targetDate2) {
            try {
              const data2 = await this.fetchApi(`/eventsday.php?d=${targetDate2}&s=${encodeURIComponent(sportStr)}`, 3600);
              if (data2.events) allEvents = allEvents.concat(data2.events);
            } catch(e) {}
          }
          
          const upcomingEvents = allEvents
            .filter((e: any) => e.strStatus === "Not Started" || e.strStatus === "NS")
            .map((e: any) => this.mapEventToMatch(e));
            
          matches.push(...upcomingEvents);
        }
        return matches;
      }
    } catch (error) {
      console.error("Error fetching upcoming matches:", error);
      return [];
    }
  }

  async getMatchDetailsByName(matchName: string): Promise<MatchDetails> {
    const query = encodeURIComponent(matchName.replace(/ /g, '_'));
    const data = await this.fetchApi(`/searchevents.php?e=${query}`);
    if (!data.event || data.event.length === 0) throw new Error("Match not found by name");
    const event = data.event[0];
    const match = this.mapEventToMatch(event);
    
    // Create mock market data with standard odds
    const mockMarkets: Market[] = [
      {
        id: "match_result",
        name: "Match Result",
        selections: [
          { id: "home", label: match.homeTeam.name, odds: 2.10 },
          { id: "draw", label: "Draw", odds: 3.20 },
          { id: "away", label: match.awayTeam.name, odds: 3.50 }
        ]
      },
      {
        id: "over_under_25",
        name: "Over/Under 2.5 Goals",
        selections: [
          { id: "over", label: "Over 2.5", odds: 1.95 },
          { id: "under", label: "Under 2.5", odds: 1.95 }
        ]
      },
      {
        id: "btts",
        name: "Both Teams to Score",
        selections: [
          { id: "yes", label: "Yes", odds: 1.95 },
          { id: "no", label: "No", odds: 1.95 }
        ]
      }
    ];
    
    return {
      ...match,
      markets: mockMarkets
    };
  }

  async getMatchDetails(matchId: string): Promise<MatchDetails> {
    const data = await this.fetchApi(`/lookupevent.php?id=${matchId}`);
    if (!data.events || data.events.length === 0) throw new Error("Match not found");
    const event = data.events[0];
    const match = this.mapEventToMatch(event);
    
    // Create mock market data with standard odds
    const mockMarkets: Market[] = [
      {
        id: "match_result",
        name: "Match Result",
        selections: [
          { id: "home", label: match.homeTeam.name, odds: 2.10 },
          { id: "draw", label: "Draw", odds: 3.20 },
          { id: "away", label: match.awayTeam.name, odds: 3.50 }
        ]
      },
      {
        id: "over_under_25",
        name: "Over/Under 2.5 Goals",
        selections: [
          { id: "over", label: "Over 2.5", odds: 1.95 },
          { id: "under", label: "Under 2.5", odds: 1.95 }
        ]
      },
      {
        id: "btts",
        name: "Both Teams to Score",
        selections: [
          { id: "yes", label: "Yes", odds: 1.95 },
          { id: "no", label: "No", odds: 1.95 }
        ]
      }
    ];
    
    return {
      ...match,
      markets: mockMarkets
    };
  }

  async getStandings(competitionId: string, season?: string): Promise<StandingEntry[]> {
    return [];
  }

  // World Cup 2026 Specific Methods (League ID: 4429)
  async getWorldCupLive(): Promise<Match[]> {
    const today = new Date().toISOString().split('T')[0];
    try {
      const data = await this.fetchApi(`/eventsday.php?d=${today}&l=4429`, 60);
      if (!data.events) return [];
      
      return data.events
        .filter((e: any) => e.strStatus !== "Not Started" && e.strStatus !== "NS" && e.strStatus !== "Match Finished" && e.strStatus !== "FT" && e.strStatus !== "Postponed" && e.strStatus !== "Cancelled")
        .map((e: any) => this.mapEventToMatch(e));
    } catch (error) {
      console.error("Error fetching World Cup live matches:", error);
      return [];
    }
  }

  async getWorldCupUpcoming(): Promise<Match[]> {
    try {
      const data = await this.fetchApi(`/eventsnextleague.php?id=4429`, 3600);
      if (!data.events) return [];
      
      return data.events.map((e: any) => this.mapEventToMatch(e));
    } catch (error) {
      console.error("Error fetching World Cup upcoming matches:", error);
      return [];
    }
  }

  async getWorldCupPast(): Promise<Match[]> {
    try {
      const data = await this.fetchApi(`/eventspastleague.php?id=4429`, 3600);
      if (!data.events) return [];
      
      return data.events.map((e: any) => this.mapEventToMatch(e));
    } catch (error) {
      console.error("Error fetching World Cup past matches:", error);
      return [];
    }
  }
}
