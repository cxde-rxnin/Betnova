export type BetStatus = "pending" | "won" | "lost" | "cashout";

export interface Bet {
  id: string;
  eventId: string;
  eventName: string;
  selection: string;
  odds: number;
  stake: number;
  potentialReturn: number;
  status: BetStatus;
  placedAt: string;
  settledAt?: string;
}

export const MOCK_BETS: Bet[] = [
  { id: "b1", eventId: "e1", eventName: "Arsenal vs Chelsea", selection: "Arsenal Win", odds: 1.45, stake: 50, potentialReturn: 72.50, status: "pending", placedAt: "2026-07-07T14:30:00Z" },
  { id: "b2", eventId: "e3", eventName: "Barcelona vs Real Madrid", selection: "Draw", odds: 3.40, stake: 25, potentialReturn: 85.00, status: "pending", placedAt: "2026-07-07T10:00:00Z" },
  { id: "b3", eventId: "e10", eventName: "Man City vs Aston Villa", selection: "Man City Win", odds: 1.30, stake: 100, potentialReturn: 130.00, status: "won", placedAt: "2026-07-06T14:00:00Z", settledAt: "2026-07-06T17:00:00Z" },
  { id: "b4", eventId: "e8", eventName: "Mumbai Indians vs CSK", selection: "CSK Win", odds: 2.40, stake: 30, potentialReturn: 72.00, status: "lost", placedAt: "2026-07-06T13:30:00Z", settledAt: "2026-07-06T18:00:00Z" },
  { id: "b5", eventId: "e2", eventName: "Man Utd vs Liverpool", selection: "Liverpool Win", odds: 2.50, stake: 40, potentialReturn: 100.00, status: "pending", placedAt: "2026-07-07T14:50:00Z" },
];
