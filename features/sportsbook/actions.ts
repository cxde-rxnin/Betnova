"use server";

import { SportApi7Provider } from "./providers/sportapi7";

// We use the singleton pattern to initialize our provider
const sportsProvider = new SportApi7Provider();

export async function getSports() {
  return await sportsProvider.getSports();
}

export async function getCompetitions(sportId: string) {
  return await sportsProvider.getCompetitions(sportId);
}

export async function getLiveMatches(sportId?: string) {
  return await sportsProvider.getLiveMatches(sportId);
}

export async function getUpcomingMatches(sportId?: string, date?: string) {
  return await sportsProvider.getUpcomingMatches(sportId, date);
}

export async function getMatchDetails(matchId: string) {
  return await sportsProvider.getMatchDetails(matchId);
}

export async function getStandings(competitionId: string, season?: string) {
  return await sportsProvider.getStandings(competitionId, season);
}
