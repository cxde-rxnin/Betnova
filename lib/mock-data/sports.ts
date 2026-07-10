export const SPORTS = [
  { id: "football", name: "Football", icon: "⚽", eventCount: 124 },
  { id: "basketball", name: "Basketball", icon: "🏀", eventCount: 89 },
  { id: "tennis", name: "Tennis", icon: "🎾", eventCount: 56 },
  { id: "cricket", name: "Cricket", icon: "🏏", eventCount: 34 },
  { id: "baseball", name: "Baseball", icon: "⚾", eventCount: 42 },
  { id: "hockey", name: "Ice Hockey", icon: "🏒", eventCount: 28 },
  { id: "mma", name: "MMA", icon: "🥊", eventCount: 15 },
  { id: "esports", name: "Esports", icon: "🎮", eventCount: 67 },
];

export const COMPETITIONS = [
  { id: "c1", sportId: "football", name: "Premier League", country: "England", eventCount: 20 },
  { id: "c2", sportId: "football", name: "La Liga", country: "Spain", eventCount: 18 },
  { id: "c3", sportId: "football", name: "Champions League", country: "Europe", eventCount: 16 },
  { id: "c4", sportId: "basketball", name: "NBA", country: "USA", eventCount: 30 },
  { id: "c5", sportId: "basketball", name: "EuroLeague", country: "Europe", eventCount: 14 },
  { id: "c6", sportId: "tennis", name: "Wimbledon", country: "England", eventCount: 12 },
  { id: "c7", sportId: "tennis", name: "US Open", country: "USA", eventCount: 10 },
  { id: "c8", sportId: "cricket", name: "IPL", country: "India", eventCount: 14 },
];

export type EventStatus = "live" | "upcoming" | "finished";

export interface SportEvent {
  id: string;
  sportId: string;
  competitionId: string;
  competitionName: string;
  homeTeam: string;
  homeTeamLogo?: string;
  awayTeam: string;
  awayTeamLogo?: string;
  homeScore?: number;
  awayScore?: number;
  status: EventStatus;
  startTime: string;
  minute?: number;
  odds: { home: number; draw: number; away: number };
  isFavorite: boolean;
}

export const EVENTS: SportEvent[] = [
  { id: "e1", sportId: "football", competitionId: "c1", competitionName: "Premier League", homeTeam: "Arsenal", awayTeam: "Chelsea", homeScore: 2, awayScore: 1, status: "live", startTime: "2026-07-07T15:00:00Z", minute: 67, odds: { home: 1.45, draw: 4.20, away: 6.50 }, isFavorite: true },
  { id: "e2", sportId: "football", competitionId: "c1", competitionName: "Premier League", homeTeam: "Manchester Utd", awayTeam: "Liverpool", homeScore: 0, awayScore: 0, status: "live", startTime: "2026-07-07T15:00:00Z", minute: 34, odds: { home: 2.80, draw: 3.30, away: 2.50 }, isFavorite: false },
  { id: "e3", sportId: "football", competitionId: "c2", competitionName: "La Liga", homeTeam: "Barcelona", awayTeam: "Real Madrid", status: "upcoming", startTime: "2026-07-08T20:00:00Z", odds: { home: 2.10, draw: 3.40, away: 3.20 }, isFavorite: true },
  { id: "e4", sportId: "basketball", competitionId: "c4", competitionName: "NBA", homeTeam: "LA Lakers", awayTeam: "Golden State", homeScore: 98, awayScore: 102, status: "live", startTime: "2026-07-07T02:00:00Z", minute: 42, odds: { home: 1.90, draw: 0, away: 1.95 }, isFavorite: false },
  { id: "e5", sportId: "basketball", competitionId: "c4", competitionName: "NBA", homeTeam: "Boston Celtics", awayTeam: "Miami Heat", status: "upcoming", startTime: "2026-07-09T01:00:00Z", odds: { home: 1.65, draw: 0, away: 2.30 }, isFavorite: false },
  { id: "e6", sportId: "tennis", competitionId: "c6", competitionName: "Wimbledon", homeTeam: "C. Alcaraz", awayTeam: "N. Djokovic", status: "upcoming", startTime: "2026-07-10T14:00:00Z", odds: { home: 1.80, draw: 0, away: 2.05 }, isFavorite: true },
  { id: "e7", sportId: "football", competitionId: "c3", competitionName: "Champions League", homeTeam: "Bayern Munich", awayTeam: "PSG", status: "upcoming", startTime: "2026-07-11T19:00:00Z", odds: { home: 1.75, draw: 3.80, away: 4.50 }, isFavorite: false },
  { id: "e8", sportId: "cricket", competitionId: "c8", competitionName: "IPL", homeTeam: "Mumbai Indians", awayTeam: "Chennai Super Kings", homeScore: 186, awayScore: 142, status: "finished", startTime: "2026-07-06T14:00:00Z", odds: { home: 1.60, draw: 0, away: 2.40 }, isFavorite: false },
  { id: "e9", sportId: "football", competitionId: "c1", competitionName: "Premier League", homeTeam: "Tottenham", awayTeam: "Newcastle", status: "upcoming", startTime: "2026-07-08T15:00:00Z", odds: { home: 2.20, draw: 3.50, away: 3.10 }, isFavorite: false },
  { id: "e10", sportId: "football", competitionId: "c1", competitionName: "Premier League", homeTeam: "Man City", awayTeam: "Aston Villa", homeScore: 3, awayScore: 0, status: "finished", startTime: "2026-07-06T15:00:00Z", odds: { home: 1.30, draw: 5.50, away: 9.00 }, isFavorite: false },
];
