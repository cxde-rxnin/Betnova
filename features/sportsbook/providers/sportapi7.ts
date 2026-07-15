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
      if (response.status !== 404 && response.status !== 429) {
        console.error(`SportApi7 error: ${response.status} ${response.statusText}`);
      }
      throw new Error(`${response.status}`);
    }

    return await response.json();
  }

  private categoryMap: Record<string, number> = {
    football: 1468, // World
    basketball: 103, // International
    tennis: 2377, // International
    "ice-hockey": 4,
    volleyball: 5,
    handball: 6,
    esports: 7,
    baseball: 8,
    "american-football": 9,
    bandy: 10,
    motorsport: 11,
    rugby: 12,
    darts: 13,
    snooker: 14,
    futsal: 15,
    "table-tennis": 16,
    badminton: 18,
    cricket: 19,
    waterpolo: 21,
    floorball: 22,
    "aussie-rules": 23,
    squash: 24,
    "beach-volleyball": 34,
    mma: 110,
    cycling: 115,
    golf: 116
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
      { id: "snooker", name: "Snooker", icon: "🎱" },
      { id: "table-tennis", name: "Table Tennis", icon: "🏓" },
      { id: "motorsport", name: "Motorsport", icon: "🏎️" },
      { id: "futsal", name: "Futsal", icon: "⚽" },
      { id: "badminton", name: "Badminton", icon: "🏸" },
      { id: "waterpolo", name: "Waterpolo", icon: "🤽" },
      { id: "aussie-rules", name: "Aussie Rules", icon: "🏉" },
      { id: "squash", name: "Squash", icon: "🎾" },
      { id: "beach-volleyball", name: "Beach Volleyball", icon: "🏐" },
      { id: "mma", name: "MMA", icon: "🥊" },
      { id: "cycling", name: "Cycling", icon: "🚴" },
      { id: "golf", name: "Golf", icon: "⛳" },
      { id: "bandy", name: "Bandy", icon: "🏒" },
      { id: "floorball", name: "Floorball", icon: "🏒" }
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
    else if (event.status?.type === "finished" || event.status?.type === "ended") status = "FINISHED";
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
            ? Math.floor((Date.now() / 1000 - event.time.currentPeriodStartTimestamp) / 60) + (event.status?.code === 7 && sportGroup === "football" ? 45 : 0)
            : undefined,
        period: event.status?.description || "Live"
      } : undefined
    };
  }

  private async injectLogos(matches: Match[]): Promise<Match[]> {
    return matches.map((m) => {
      // Use internal Next.js proxy for team logos to safely hit RapidAPI without 403s
      m.homeTeam.logo = `/api/sports/logo?teamId=${m.homeTeam.id}&name=${encodeURIComponent(m.homeTeam.name)}&isHome=true`;
      m.awayTeam.logo = `/api/sports/logo?teamId=${m.awayTeam.id}&name=${encodeURIComponent(m.awayTeam.name)}&isHome=false`;
      return m;
    });
  }

  async getLiveMatches(sportId?: string): Promise<Match[]> {
    try {
      if (sportId) {
        const data = await this.fetchApi(`/sport/${sportId}/events/live`);
        if (!data.events) return [];
        const rawMatches = data.events.map((item: any) => this.mapEventToMatch(item, sportId));
        return await this.injectLogos(rawMatches);
      } else {
        const allSports = Object.keys(this.categoryMap);
        let allMatches: Match[] = [];
        
        // Use chunk of 4 to avoid exceeding 20req/s when multiple calls are made concurrently
        for (let i = 0; i < allSports.length; i += 4) {
          const chunk = allSports.slice(i, i + 4);
          const chunkPromises = chunk.map(async (sport) => {
             try {
               const data = await this.fetchApi(`/sport/${sport}/events/live`);
               if (data.events) {
                 return data.events.map((item: any) => this.mapEventToMatch(item, sport));
               }
             } catch (e: any) {
               if (e.message !== "404" && e.message !== "429") {
                 console.warn(`Failed live matches for ${sport}:`, e.message);
               }
             }
             return [];
          });
          const chunkResults = await Promise.all(chunkPromises);
          allMatches = allMatches.concat(...chunkResults);
          if (i + 4 < allSports.length) {
            await new Promise(r => setTimeout(r, 1000)); // 1 second delay
          }
        }
        return await this.injectLogos(allMatches);
      }
    } catch (e: any) {
      if (e.message !== "404" && e.message !== "429") {
        console.warn("Failed to fetch live matches:", e.message);
      }
      return [];
    }
  }

  async getUpcomingMatches(sportId?: string, date?: string): Promise<Match[]> {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const targetDate1 = date || today.toISOString().split('T')[0];
      const targetDate2 = date ? null : tomorrow.toISOString().split('T')[0];
      
      if (sportId) {
        const categoryId = this.categoryMap[sportId] || 1;
        
        let allEvents: any[] = [];
        try {
          const data1 = await this.fetchApi(`/category/${categoryId}/scheduled-events/${targetDate1}`);
          if (data1.events) allEvents = allEvents.concat(data1.events);
        } catch (e) { /* ignore */ }
        
        if (targetDate2) {
          try {
            const data2 = await this.fetchApi(`/category/${categoryId}/scheduled-events/${targetDate2}`);
            if (data2.events) allEvents = allEvents.concat(data2.events);
          } catch (e) { /* ignore */ }
        }

        if (allEvents.length === 0) return [];
        const rawMatches = allEvents.map((item: any) => this.mapEventToMatch(item, sportId));
        const matches = rawMatches.filter((m: Match) => m.status === "PRE_MATCH");
        return await this.injectLogos(matches);
      } else {
        const allSports = Object.keys(this.categoryMap);
        let allMatches: Match[] = [];
        
        // Use chunk of 4 to avoid exceeding 20req/s
        for (let i = 0; i < allSports.length; i += 4) {
          const chunk = allSports.slice(i, i + 4);
          const chunkPromises = chunk.map(async (sport) => {
             let allEvents: any[] = [];
             try {
               const categoryId = this.categoryMap[sport];
               try {
                 const data1 = await this.fetchApi(`/category/${categoryId}/scheduled-events/${targetDate1}`);
                 if (data1.events) allEvents = allEvents.concat(data1.events);
               } catch (e) { /* ignore */ }
               
               if (targetDate2) {
                 try {
                   const data2 = await this.fetchApi(`/category/${categoryId}/scheduled-events/${targetDate2}`);
                   if (data2.events) allEvents = allEvents.concat(data2.events);
                 } catch (e) { /* ignore */ }
               }

               if (allEvents.length > 0) {
                 return allEvents.map((item: any) => this.mapEventToMatch(item, sport))
                                   .filter((m: Match) => m.status === "PRE_MATCH");
               }
             } catch (e: any) {
               if (e.message !== "404" && e.message !== "429") {
                 console.warn(`Failed upcoming matches for ${sport}:`, e.message);
               }
             }
             return [];
          });
          const chunkResults = await Promise.all(chunkPromises);
          allMatches = allMatches.concat(...chunkResults);
          if (i + 4 < allSports.length) {
            await new Promise(r => setTimeout(r, 1000));
          }
        }
        return await this.injectLogos(allMatches);
      }
    } catch (e: any) {
      if (e.message !== "404" && e.message !== "429") {
        console.warn("Failed to fetch upcoming matches:", e.message);
      }
      return [];
    }
  }

  async getMatchDetails(matchId: string): Promise<MatchDetails | null> {
    try {
      const data = await this.fetchApi(`/event/${matchId}`);
      require('fs').writeFileSync('scratch/last_match_id.txt', matchId + '\n' + JSON.stringify(data.event));
      if (!data.event) return null;

      const match = this.mapEventToMatch(data.event, "football");
      const matchWithLogos = (await this.injectLogos([match]))[0];

      let statistics: { type: string; homeValue: string | number; awayValue: string | number }[] = [];
      try {
        const statsData = await this.fetchApi(`/event/${matchId}/statistics`);
        if (statsData && statsData.statistics && statsData.statistics.length > 0) {
          const allPeriod = statsData.statistics.find((s: any) => s.period === "ALL") || statsData.statistics[0];
          if (allPeriod && allPeriod.groups) {
            allPeriod.groups.forEach((group: any) => {
              if (group.statisticsItems) {
                group.statisticsItems.forEach((item: any) => {
                  statistics.push({
                    type: item.name,
                    homeValue: item.home,
                    awayValue: item.away
                  });
                });
              }
            });
          }
        }
      } catch (e: any) {
        if (e.message !== "404") {
          console.warn(`Could not fetch statistics for match ${matchId}:`, e.message);
        }
      }

      const matchDetails: MatchDetails = {
        ...matchWithLogos,
        statistics
      };

      return matchDetails;
    } catch (e: any) {
      console.warn("Failed to fetch match details:", e);
      if (e.message?.includes("429")) {
        throw new Error("Rate limit exceeded");
      }
      return null;
    }
  }

  async getStandings(competitionId: string, season?: string): Promise<StandingEntry[]> {
    // SportApi7 standings integration not yet implemented
    return [];
  }
}
