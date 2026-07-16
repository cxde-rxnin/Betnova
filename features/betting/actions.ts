"use server";

import { auth } from "@/lib/auth";
import { BettingService } from "./services/BettingService";
import { SettlementService } from "./services/SettlementService";
import { Bet } from "@/models/Bet";
import { User } from "@/models/User";
import connectToDatabase from "@/lib/db/connect";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac";
import { AuditLog } from "@/models/AuditLog";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function submitBet(selections: any[], stake: number, currency: string = "USDT") {
  try {
    const userId = await getUserId();
    
    await connectToDatabase();
    const user = await User.findById(userId).select("kycStatus").lean();
    if (!user || user.kycStatus !== "VERIFIED") {
      throw new Error("KYC Verification required to place bets");
    }
    
    const parsedStake = Number(stake);
    if (isNaN(parsedStake) || parsedStake <= 0) {
      throw new Error("Invalid stake amount");
    }

    // Map frontend store schema to Mongoose IBetSelection schema
    const mappedSelections = selections.map(s => ({
      fixtureId: s.eventId || s.fixtureId,
      sportId: s.sportId || "unknown",
      competitionId: s.competitionId || "unknown",
      matchName: s.eventName || s.matchName,
      marketName: s.market || s.marketName,
      outcomeName: s.label || s.outcomeName,
      homeLogo: s.homeLogo,
      awayLogo: s.awayLogo,
      lockedOdds: Number(s.odds || s.lockedOdds)
    }));

    const bet = await BettingService.placeBet({
      userId,
      selections: mappedSelections,
      stake: parsedStake,
      currency
    });
    
    revalidatePath("/bets");
    revalidatePath("/wallet"); // Balance has changed (moved to reserved)
    
    return { success: true, bet: JSON.parse(JSON.stringify(bet)) };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

export async function getUserBets() {
  const userId = await getUserId();
  await connectToDatabase();
  
  const bets = await Bet.find({ userId }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(bets));
}

export async function triggerAutoSettlement(betId: string) {
  // Can be called by the user viewing their bet to eagerly check for settlement
  const bet = await SettlementService.checkAutoSettlement(betId);
  revalidatePath("/bets");
  revalidatePath("/wallet");
  return JSON.parse(JSON.stringify(bet));
}

// ADMIN ACTIONS
export async function adminManualSettle(betId: string, result: "WON" | "LOST" | "VOID") {
  try {
    await requirePermission("MANAGE_BETS");
    const adminId = await getUserId(); // Admin ID

    const bet = await SettlementService.manualSettle(betId, result);
    
    await AuditLog.create({
      adminId,
      action: "MANUAL_SETTLE_BET",
      resource: "Bet",
      resourceId: betId,
      details: { result }
    });

    revalidatePath("/admin/finances");
    revalidatePath("/bets");
    revalidatePath("/wallet");
    
    return { success: true, bet: JSON.parse(JSON.stringify(bet)) };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

export async function getAdminAllBets() {
  await requirePermission("VIEW_BETS");
  
  await connectToDatabase();
  const bets = await Bet.find().populate("userId", "name email").sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(bets));
}
