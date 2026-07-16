import connectToDatabase from "@/lib/db/connect";
import { Bet, BetStatus } from "@/models/Bet";
import { LedgerService } from "@/features/wallet/services/LedgerService";
import mongoose from "mongoose";
import { TheSportsDBProvider } from "@/features/sportsbook/providers/thesportsdb";
import { NotificationService } from "@/features/notifications/NotificationService";

export class SettlementService {
  /**
   * Manually settles a bet (Admin Override)
   */
  static async manualSettle(betId: string, result: "WON" | "LOST" | "VOID") {
    await connectToDatabase();
    
    const bet = await Bet.findById(betId);
    if (!bet || bet.status !== "PENDING") throw new Error("Invalid bet or already settled");

    const userAccount = await LedgerService.getUserAccount(bet.userId.toString(), bet.currency);
    const treasuryAccount = await LedgerService.getSystemAccount("TREASURY", bet.currency);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (result === "WON") {
        // Return stake + payout from treasury to user
        const ledgerId = await LedgerService.executeTransfer({
          debitAccountId: treasuryAccount._id.toString(),
          creditAccountId: userAccount._id.toString(),
          amount: bet.potentialPayout,
          currency: bet.currency,
          transactionType: "BET_WIN",
          referenceId: bet._id.toString(),
          userIdToUpdate: bet.userId.toString(),
        });
        bet.ledgerEntryIds.push(ledgerId);
      } else if (result === "VOID") {
        // Return original stake
        const ledgerId = await LedgerService.executeTransfer({
          debitAccountId: treasuryAccount._id.toString(),
          creditAccountId: userAccount._id.toString(),
          amount: bet.stake,
          currency: bet.currency,
          transactionType: "REFUND",
          referenceId: bet._id.toString(),
          userIdToUpdate: bet.userId.toString(),
        });
        bet.ledgerEntryIds.push(ledgerId);
      }
      // If LOST, the house already holds the stake in TREASURY from placement, so no ledger transfer is needed for the money.

      // Decrement the locked balance
      await mongoose.models.Wallet.findOneAndUpdate(
        { userId: bet.userId, currency: bet.currency },
        { $inc: { lockedBalance: -bet.stake } },
        { session }
      );

      bet.status = result;
      // We no longer force PENDING selections to match the result. 
      // If a single selection in an accumulator is LOST, the overall bet is LOST, 
      // but the other selections remain in their true state (e.g., PENDING).
      await bet.save({ session });

      await session.commitTransaction();

      // Send notification
      const amount = result === "WON" ? bet.potentialPayout : (result === "VOID" ? bet.stake : 0);
      const title = `Bet ${result}`;
      const message = result === "WON" 
        ? `Congratulations! Your bet has won. ${amount.toFixed(2)} ${bet.currency} has been added to your account.`
        : (result === "LOST" ? `Your bet has settled as a loss.` : `Your bet was voided. ${amount.toFixed(2)} ${bet.currency} has been refunded.`);
      
      await NotificationService.notifyUser({
        userId: bet.userId.toString(),
        category: "BETTING",
        title,
        message
      });

      return bet;
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }

  /**
   * Lazy Evaluation check when user opens bet history or during cron settlement.
   * Connects to Sports Provider to see if match has a final score.
   */
  static async checkAutoSettlement(betId: string) {
    await connectToDatabase();
    const bet = await Bet.findById(betId);
    if (!bet || bet.status !== "PENDING") return bet;

    // Auto-settlement logic using TheSportsDBProvider
    let allSettled = true;
    let anyLost = false;
    let anyVoid = false;

    const provider = new TheSportsDBProvider();

    for (const selection of bet.selections) {
      if (selection.status !== "PENDING") {
        if (selection.status === "LOST") anyLost = true;
        if (selection.status === "VOID") anyVoid = true;
        continue;
      }

      try {
        const match = await provider.getMatchDetails(selection.fixtureId);
        if (!match || match.status !== "FINISHED") {
          allSettled = false;
          continue;
        }

        let selectionResult: "WON" | "LOST" | "VOID" = "LOST";
        
        // For Match Result markets, compare against actual match outcome
        if (selection.marketName === "Match Result" || selection.marketName === "h2h") {
          const homeScore = match.score.home ?? 0;
          const awayScore = match.score.away ?? 0;
          
          // Determine actual match outcome
          let actualOutcome: string;
          if (homeScore > awayScore) {
            actualOutcome = match.homeTeam.name;
          } else if (awayScore > homeScore) {
            actualOutcome = match.awayTeam.name;
          } else {
            actualOutcome = "Draw";
          }

          // Check if user's selection matches the actual outcome
          if (selection.outcomeName === actualOutcome) {
            selectionResult = "WON";
          } else {
            selectionResult = "LOST";
          }
        } else {
          // Unsupported market for auto-settlement, wait for manual admin intervention
          allSettled = false;
          continue;
        }

        selection.status = selectionResult;
        if (selectionResult === "LOST") anyLost = true;

      } catch (e) {
        console.error(`[SettlementService] Failed to fetch match details for auto-settlement: ${selection.fixtureId}`, e);
        allSettled = false;
      }
    }

    if (allSettled || anyLost) {
      const finalResult = anyLost ? "LOST" : (anyVoid ? "VOID" : "WON");
      // Save the updated selection statuses
      await bet.save();
      // Use manualSettle to handle ledger transfers and notifications
      return await this.manualSettle(betId, finalResult);
    }
    
    // Save any partial selection status updates
    await bet.save();
    return bet;
  }
}
