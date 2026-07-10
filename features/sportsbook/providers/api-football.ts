import { ISportsProvider } from "./types";
import { Match, MatchDetails, Sport, Competition, StandingEntry } from "../types";
import { LogoService } from "../services/LogoService";

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_URL = "https://v3.football.api-sports.io";

export class ApiFootballProvider implements ISportsProvider {
  private async fetchApi(endpoint: string, params: Record<string, string> = {}) {
    if (!API_KEY) {
      throw new Error("API_FOOTBALL_KEY is not defined in environment variables");
    }

    const url = new URL(`${API_URL}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-apisports-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io"
      },
      // Cache settings will be managed by next/cache or react-query depending on caller
      next: { revalidate: 60 } 
    });

    if (!response.ok) {
      throw new Error(`API Football error: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.warn("API Football validation errors:", data.errors);
      
      // If we hit the rate limit, fail gracefully instead of crashing the app
      if (data.errors.requests?.includes("request limit")) {
        return [];
      }
      
      throw new Error("API Football returned an error");
    }

    return data.response;
  }

  async getSports(): Promise<Sport[]> {
    // API-Football is football only, but API-Sports supports others. 
    // For now we map football as the primary sport.
    return [
      { id: "football", name: "Football", icon: "⚽" }
    ];
  }

  async getCompetitions(sportId: string): Promise<Competition[]> {
    if (sportId !== "football") return [];
    
    // We fetch top leagues for brevity, usually you'd paginate or cache
    const data = await this.fetchApi("/leagues", { current: "true" });
    
    return data.map((item: any) => ({
      id: item.league.id.toString(),
      sportId: "football",
      name: item.league.name,
      country: item.country.name,
      logo: item.league.logo,
      season: item.seasons[0]?.year.toString()
    }));
  }

  private mapFixtureToMatch(item: any): Match {
    let status: Match["status"] = "PRE_MATCH";
    const shortStatus = item.fixture.status.short;
    if (["1H", "2H", "HT", "ET", "P", "LIVE"].includes(shortStatus)) status = "LIVE";
    else if (["FT", "AET", "PEN"].includes(shortStatus)) status = "FINISHED";
    else if (["PST", "CANC", "ABD"].includes(shortStatus)) status = "POSTPONED";

    return {
      id: item.fixture.id.toString(),
      sportId: "football",
      competitionId: item.league.id.toString(),
      competitionName: item.league.name,
      homeTeam: {
        id: item.teams.home.id.toString(),
        name: item.teams.home.name,
        logo: item.teams.home.logo,
      },
      awayTeam: {
        id: item.teams.away.id.toString(),
        name: item.teams.away.name,
        logo: item.teams.away.logo,
      },
      venue: item.fixture.venue.name,
      status,
      startTime: item.fixture.date,
      liveStatus: status === "LIVE" ? {
        minute: item.fixture.status.elapsed,
        period: item.fixture.status.long,
      } : undefined,
      score: {
        home: item.goals.home,
        away: item.goals.away,
      },
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
      // Use LogoService mapped logo, or the one from API-Football, or a fallback
      m.homeTeam.logo = logosMap[m.homeTeam.name] || m.homeTeam.logo || LogoService.getFallbackLogo(m.homeTeam.name, true);
      m.awayTeam.logo = logosMap[m.awayTeam.name] || m.awayTeam.logo || LogoService.getFallbackLogo(m.awayTeam.name, false);
      return m;
    });
  }

  async getLiveMatches(sportId?: string): Promise<Match[]> {
    if (sportId && sportId !== "football") return [];
    const data = await this.fetchApi("/fixtures", { live: "all" });
    const matches = data.map((item: any) => this.mapFixtureToMatch(item));
    return await this.injectLogos(matches);
  }

  async getUpcomingMatches(sportId?: string, date?: string): Promise<Match[]> {
    if (sportId && sportId !== "football") return [];
    const targetDate = date || new Date().toISOString().split('T')[0];
    const data = await this.fetchApi("/fixtures", { date: targetDate });
    const matches = data.map((item: any) => this.mapFixtureToMatch(item)).filter((m: Match) => m.status === "PRE_MATCH");
    return await this.injectLogos(matches);
  }

  async getMatchDetails(matchId: string): Promise<MatchDetails | null> {
    const [fixturesData, predictionsData] = await Promise.all([
      this.fetchApi("/fixtures", { id: matchId }).catch(() => null),
      this.fetchApi("/predictions", { fixture: matchId }).catch(() => null)
    ]);
    
    if (!fixturesData || fixturesData.length === 0) return null;
    
    const item = fixturesData[0];
    const baseMatch = this.mapFixtureToMatch(item);
    
    let prediction;
    if (predictionsData && predictionsData.length > 0) {
      const pred = predictionsData[0];
      prediction = {
        winner: {
          id: pred.predictions.winner.id?.toString() || null,
          name: pred.predictions.winner.name || null,
          comment: pred.predictions.winner.comment || null
        },
        winOrDraw: pred.predictions.win_or_draw,
        underOver: pred.predictions.under_over,
        goals: {
          home: pred.predictions.goals.home,
          away: pred.predictions.goals.away
        },
        advice: pred.predictions.advice,
        percent: {
          home: pred.predictions.percent.home,
          draw: pred.predictions.percent.draw,
          away: pred.predictions.percent.away
        }
      };
    }
    
    const matchWithLogos = (await this.injectLogos([baseMatch]))[0];
    
    // In a real app we'd fetch odds from /odds endpoint as well
    // For now we map available base details
    return {
      ...matchWithLogos,
      referee: item.fixture.referee,
      // Mapping statistics if available
      statistics: item.statistics ? [] : undefined,
      prediction
    };
  }

  async getStandings(competitionId: string, season?: string): Promise<StandingEntry[]> {
    const targetSeason = season || new Date().getFullYear().toString();
    const data = await this.fetchApi("/standings", { league: competitionId, season: targetSeason });
    
    if (!data || data.length === 0) return [];
    
    const standings = data[0].league.standings[0];
    if (!standings) return [];

    return standings.map((item: any) => ({
      rank: item.rank,
      team: {
        id: item.team.id.toString(),
        name: item.team.name,
        logo: item.team.logo,
      },
      points: item.points,
      played: item.all.played,
      won: item.all.win,
      drawn: item.all.draw,
      lost: item.all.lose,
      goalsFor: item.all.goals.for,
      goalsAgainst: item.all.goals.against,
      form: item.form,
    }));
  }
}
