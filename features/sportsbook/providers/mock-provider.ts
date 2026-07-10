import { ISportsProvider } from "./types";
import { Match, MatchDetails, Sport, Competition, StandingEntry } from "../types";

// Seed some static data to simulate an API
const MOCK_SPORTS: Sport[] = [
  { id: "football", name: "Football", icon: "⚽" },
  { id: "basketball", name: "Basketball", icon: "🏀" },
  { id: "tennis", name: "Tennis", icon: "🎾" },
];

const MOCK_COMPETITIONS: Competition[] = [
  { id: "pl", sportId: "football", name: "Premier League", country: "England", logo: "https://media.api-sports.io/football/leagues/39.png", season: "2026" },
  { id: "nba", sportId: "basketball", name: "NBA", country: "USA", logo: "https://media.api-sports.io/basketball/leagues/12.png", season: "2026" },
];

let mockMatches: Match[] = [
  {
    id: "m1",
    sportId: "football",
    competitionId: "pl",
    competitionName: "Premier League",
    homeTeam: { id: "t1", name: "Arsenal", shortName: "ARS", logo: "https://media.api-sports.io/football/teams/42.png" },
    awayTeam: { id: "t2", name: "Chelsea", shortName: "CHE", logo: "https://media.api-sports.io/football/teams/49.png" },
    venue: "Emirates Stadium",
    status: "LIVE",
    startTime: new Date(Date.now() - 45 * 60000).toISOString(),
    liveStatus: { minute: 45, period: "1H" },
    score: { home: 1, away: 0 }
  },
  {
    id: "m2",
    sportId: "football",
    competitionId: "pl",
    competitionName: "Premier League",
    homeTeam: { id: "t3", name: "Man City", shortName: "MCI", logo: "https://media.api-sports.io/football/teams/50.png" },
    awayTeam: { id: "t4", name: "Liverpool", shortName: "LIV", logo: "https://media.api-sports.io/football/teams/40.png" },
    venue: "Etihad Stadium",
    status: "PRE_MATCH",
    startTime: new Date(Date.now() + 120 * 60000).toISOString(),
    score: { home: null, away: null }
  },
  {
    id: "m3",
    sportId: "basketball",
    competitionId: "nba",
    competitionName: "NBA",
    homeTeam: { id: "b1", name: "Lakers", shortName: "LAL", logo: "https://media.api-sports.io/basketball/teams/145.png" },
    awayTeam: { id: "b2", name: "Warriors", shortName: "GSW", logo: "https://media.api-sports.io/basketball/teams/140.png" },
    venue: "Crypto.com Arena",
    status: "LIVE",
    startTime: new Date(Date.now() - 60 * 60000).toISOString(),
    liveStatus: { minute: 24, period: "Q2" },
    score: { home: 54, away: 50 }
  }
];

// Simulate dynamic live match updates
function simulateLiveUpdates() {
  mockMatches = mockMatches.map(match => {
    if (match.status === "LIVE" && match.liveStatus) {
      const isBasketball = match.sportId === "basketball";
      
      // Increment score randomly
      const homeScoreInc = Math.random() > (isBasketball ? 0.3 : 0.95) ? (isBasketball ? Math.floor(Math.random() * 3) + 1 : 1) : 0;
      const awayScoreInc = Math.random() > (isBasketball ? 0.3 : 0.95) ? (isBasketball ? Math.floor(Math.random() * 3) + 1 : 1) : 0;
      
      const newHomeScore = (match.score.home ?? 0) + homeScoreInc;
      const newAwayScore = (match.score.away ?? 0) + awayScoreInc;
      
      // Increment minute
      const newMinute = (match.liveStatus.minute || 0) + (isBasketball ? 0.2 : 1);

      return {
        ...match,
        liveStatus: {
          ...match.liveStatus,
          minute: Math.floor(newMinute)
        },
        score: {
          home: newHomeScore,
          away: newAwayScore
        }
      };
    }
    return match;
  });
}

// Global interval to simulate a real-time data feed independently of requests
if (typeof global !== 'undefined') {
  if (!(global as any)._mockSimInterval) {
    (global as any)._mockSimInterval = setInterval(simulateLiveUpdates, 15000); // 15 seconds
  }
}

export class MockSportsProvider implements ISportsProvider {
  private simulateDelay<T>(data: T, delay = 300): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
  }

  async getSports(): Promise<Sport[]> {
    return this.simulateDelay(MOCK_SPORTS);
  }

  async getCompetitions(sportId: string): Promise<Competition[]> {
    return this.simulateDelay(MOCK_COMPETITIONS.filter(c => c.sportId === sportId));
  }

  async getLiveMatches(sportId?: string): Promise<Match[]> {
    let matches = mockMatches.filter(m => m.status === "LIVE");
    if (sportId) matches = matches.filter(m => m.sportId === sportId);
    return this.simulateDelay(matches, 150); // Faster delay for live polling
  }

  async getUpcomingMatches(sportId?: string, date?: string): Promise<Match[]> {
    let matches = mockMatches.filter(m => m.status === "PRE_MATCH" || m.status === "POSTPONED");
    if (sportId) matches = matches.filter(m => m.sportId === sportId);
    return this.simulateDelay(matches, 300);
  }

  async getMatchDetails(matchId: string): Promise<MatchDetails | null> {
    const match = mockMatches.find(m => m.id === matchId);
    if (!match) return null;

    // Simulate odds generation
    const baseHomeOdds = 2.10;
    const baseAwayOdds = 3.50;
    const homeAdvantage = (match.score.home ?? 0) - (match.score.away ?? 0);
    
    // Dynamically adjust odds based on simulated score to show real-time changes
    const currentHomeOdds = Math.max(1.01, baseHomeOdds - (homeAdvantage * 0.3));
    const currentAwayOdds = Math.max(1.01, baseAwayOdds + (homeAdvantage * 0.3));
    const drawOdds = Math.max(1.01, 3.10 + Math.abs(homeAdvantage) * 0.5);

    const matchDetails: MatchDetails = {
      ...match,
      referee: "Michael Oliver",
      statistics: [
        { type: "Possession", homeValue: "55%", awayValue: "45%" },
        { type: "Shots on Target", homeValue: (match.score.home ?? 0) * 2 + 1, awayValue: (match.score.away ?? 0) * 2 }
      ],
      markets: [
        {
          id: "mkt_1",
          name: "Match Result",
          selections: [
            { id: "sel_1", label: match.homeTeam.name, odds: parseFloat(currentHomeOdds.toFixed(2)) },
            { id: "sel_2", label: "Draw", odds: parseFloat(drawOdds.toFixed(2)) },
            { id: "sel_3", label: match.awayTeam.name, odds: parseFloat(currentAwayOdds.toFixed(2)) }
          ]
        }
      ]
    };
    return this.simulateDelay(matchDetails, 200);
  }

  async getStandings(competitionId: string, season?: string): Promise<StandingEntry[]> {
    const standings: StandingEntry[] = [
      { rank: 1, team: mockMatches[0].homeTeam, points: 65, played: 28, won: 20, drawn: 5, lost: 3, goalsFor: 60, goalsAgainst: 20, form: "WWWDW" },
      { rank: 2, team: mockMatches[1].homeTeam, points: 63, played: 28, won: 19, drawn: 6, lost: 3, goalsFor: 62, goalsAgainst: 22, form: "WWWWD" },
      { rank: 3, team: mockMatches[1].awayTeam, points: 60, played: 28, won: 18, drawn: 6, lost: 4, goalsFor: 58, goalsAgainst: 25, form: "LWWWW" },
      { rank: 4, team: mockMatches[0].awayTeam, points: 55, played: 28, won: 16, drawn: 7, lost: 5, goalsFor: 50, goalsAgainst: 30, form: "DWWDL" }
    ];
    return this.simulateDelay(standings, 400);
  }
}
