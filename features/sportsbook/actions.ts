"use server";

import { TheSportsDBProvider } from "./providers/thesportsdb";
import connectToDatabase from "@/lib/db/connect";
import { MatchOddsAdjustment } from "@/models/MatchOddsAdjustment";
import { requirePermission } from "@/lib/rbac";
import { auth } from "@/lib/auth";
import { AuditLog } from "@/models/AuditLog";
import { revalidatePath } from "next/cache";
import type { Match, MatchDetails } from "./types";

// We use the singleton pattern to initialize our provider
const sportsProvider = new TheSportsDBProvider();

async function getCurrentAdminId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

async function getOddsIncreaseMap(matchIds: string[]) {
  if (matchIds.length === 0) return new Map<string, number>();
  await connectToDatabase();
  const adjustments = await MatchOddsAdjustment.find({ matchId: { $in: matchIds } }).select("matchId increasePercent").lean();
  return new Map<string, number>(adjustments.map((a: any) => [a.matchId, a.increasePercent]));
}

async function withOddsIncrease(matches: Match[]): Promise<Match[]> {
  const matchIds = Array.from(new Set(matches.map((m) => m.id)));
  const increaseMap = await getOddsIncreaseMap(matchIds);
  return matches.map((match) => ({
    ...match,
    oddsIncreasePercent: increaseMap.get(match.id) || 0,
  }));
}

function applyIncreaseToOdds(odds: number, increasePercent: number) {
  const multiplier = 1 + increasePercent / 100;
  return parseFloat((odds * multiplier).toFixed(2));
}

export async function getSports() {
  return await sportsProvider.getSports();
}

export async function getCompetitions(sportId: string) {
  return await sportsProvider.getCompetitions(sportId);
}

export async function getLiveMatches(sportId?: string) {
  const matches = await sportsProvider.getLiveMatches(sportId);
  const withIncrease = await withOddsIncrease(matches);
  
  return withIncrease.map(match => {
    const increasePercent = match.oddsIncreasePercent || 0;
    if (increasePercent <= 0 || !match.markets?.length) {
      return match;
    }
    return {
      ...match,
      markets: match.markets.map((market) => ({
        ...market,
        selections: market.selections.map((selection) => ({
          ...selection,
          odds: applyIncreaseToOdds(selection.odds, increasePercent),
        })),
      })),
    };
  });
}

export async function getUpcomingMatches(sportId?: string, date?: string) {
  const matches = await sportsProvider.getUpcomingMatches(sportId, date);
  const withIncrease = await withOddsIncrease(matches);
  
  return withIncrease.map(match => {
    const increasePercent = match.oddsIncreasePercent || 0;
    if (increasePercent <= 0 || !match.markets?.length) {
      return match;
    }
    return {
      ...match,
      markets: match.markets.map((market) => ({
        ...market,
        selections: market.selections.map((selection) => ({
          ...selection,
          odds: applyIncreaseToOdds(selection.odds, increasePercent),
        })),
      })),
    };
  });
}

export async function getMatchDetails(matchId: string) {
  const details = await sportsProvider.getMatchDetails(matchId);
  if (!details) return details;

  const [matchWithIncrease] = await withOddsIncrease([details as MatchDetails]);
  const increasePercent = matchWithIncrease?.oddsIncreasePercent || 0;

  if (increasePercent <= 0 || !details.markets?.length) {
    return {
      ...details,
      oddsIncreasePercent: increasePercent,
    };
  }

  return {
    ...details,
    oddsIncreasePercent: increasePercent,
    markets: details.markets.map((market) => ({
      ...market,
      selections: market.selections.map((selection) => ({
        ...selection,
        odds: applyIncreaseToOdds(selection.odds, increasePercent),
      })),
    })),
  };
}

export async function getStandings(competitionId: string, season?: string) {
  return await sportsProvider.getStandings(competitionId, season);
}

export async function getWorldCupLive() {
  const matches = await sportsProvider.getWorldCupLive();
  return await withOddsIncrease(matches);
}

export async function getWorldCupUpcoming() {
  const matches = await sportsProvider.getWorldCupUpcoming();
  return await withOddsIncrease(matches);
}

export async function getWorldCupPast() {
  const matches = await sportsProvider.getWorldCupPast();
  return await withOddsIncrease(matches);
}

export async function setMatchOddsIncrease(matchId: string, increasePercent: number) {
  await requirePermission("MANAGE_BETS");
  const adminId = await getCurrentAdminId();

  if (!matchId.trim()) {
    throw new Error("Match ID is required.");
  }
  if (Number.isNaN(increasePercent) || increasePercent < 0) {
    throw new Error("Odds increase percent must be a number greater than or equal to 0.");
  }

  const sanitizedIncrease = Math.min(increasePercent, 500);

  await connectToDatabase();
  await MatchOddsAdjustment.findOneAndUpdate(
    { matchId: matchId.trim() },
    {
      $set: {
        increasePercent: sanitizedIncrease,
        updatedBy: adminId,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await AuditLog.create({
    adminId,
    action: "UPDATE_MATCH_ODDS_INCREASE",
    resource: "MatchOddsAdjustment",
    resourceId: matchId.trim(),
    details: {
      matchId: matchId.trim(),
      increasePercent: sanitizedIncrease,
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/sports");
  revalidatePath("/sports/live");
  revalidatePath("/sports/upcoming");
  revalidatePath(`/sports/match/${matchId.trim()}`);

  return { success: true };
}
