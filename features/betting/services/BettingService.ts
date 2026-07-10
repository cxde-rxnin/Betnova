import connectToDatabase from "@/lib/db/connect";
import { Bet, IBetSelection } from "@/models/Bet";
import { LedgerService } from "@/features/wallet/services/LedgerService";
import { NotificationService } from "@/features/notifications/NotificationService";
import { WalletService } from "@/features/wallet/services/WalletService";
import { RiskConfig } from "@/models/RiskConfig";
import { PlatformAlert } from "@/models/PlatformAlert";
import mongoose from "mongoose";

export class BettingService {
  /**
   * Calculates total odds and potential payout
   */
  static calculatePayout(selections: IBetSelection[], stake: number): { totalOdds: number, potentialPayout: number } {
    const totalOdds = selections.reduce((acc, sel) => acc * sel.lockedOdds, 1);
    const potentialPayout = stake * totalOdds;
    return { 
      totalOdds: parseFloat(totalOdds.toFixed(2)), 
      potentialPayout: parseFloat(potentialPayout.toFixed(2)) 
    };
  }

  /**
   * Places a bet, locking the odds and reserving the stake atomically via Ledger.
   */
  static async placeBet({
    userId,
    selections,
    stake,
    currency = "USDT"
  }: {
    userId: string;
    selections: Omit<IBetSelection, "status">[];
    stake: number;
    currency?: string;
  }) {
    await connectToDatabase();

    if (stake <= 0) throw new Error("Stake must be greater than zero");
    if (selections.length === 0) throw new Error("Bet must have at least one selection");

    // Fetch or create Risk Config
    let config = await RiskConfig.findOne();
    if (!config) config = await RiskConfig.create({});

    if (config.globalBettingSuspended) {
      throw new Error("Betting is currently suspended platform-wide.");
    }
    if (stake < config.minStake) {
      throw new Error(`Minimum stake is ${config.minStake} ${currency}`);
    }
    if (stake > config.maxStake) {
      throw new Error(`Maximum stake is ${config.maxStake} ${currency}`);
    }
    if (selections.length > config.maxAccumulatorSelections) {
      throw new Error(`Maximum selections allowed is ${config.maxAccumulatorSelections}`);
    }

    if (stake > config.fraudAlertStakeThreshold) {
      await PlatformAlert.create({
        type: "FRAUD_SIGNAL",
        severity: "CRITICAL",
        message: `Unusually large bet placed: ${stake} ${currency}`,
        metadata: { userId, stake, currency, selectionsCount: selections.length }
      });
    }

    // Check if user has enough balance
    const wallet = await WalletService.getOrCreateWallet(userId, currency);
    if (wallet.availableBalance < stake) {
      throw new Error("Insufficient available balance");
    }

    const { totalOdds, potentialPayout } = this.calculatePayout(selections as IBetSelection[], stake);
    const type = selections.length > 1 ? "ACCUMULATOR" : "SINGLE";

    if (potentialPayout > config.maxPayout) {
      throw new Error(`Potential payout exceeds maximum allowed (${config.maxPayout} ${currency})`);
    }

    // 1. Create the Bet in PENDING state
    const bet = await Bet.create({
      userId,
      type,
      status: "PENDING",
      stake,
      totalOdds,
      potentialPayout,
      currency,
      selections: selections.map(s => ({ ...s, status: "PENDING" })),
    });

    // 2. Atomically reserve the stake
    try {
      const userAccount = await LedgerService.getUserAccount(userId, currency);
      const reservedStakesAccount = await LedgerService.getSystemAccount("TREASURY", currency); 
      
      const ledgerEntryId = await LedgerService.executeTransfer({
        debitAccountId: userAccount._id.toString(),
        creditAccountId: reservedStakesAccount._id.toString(),
        amount: stake,
        currency,
        transactionType: "BET_PLACE",
        referenceId: bet._id.toString(),
        userIdToUpdate: userId,
      });

      // Also lock the balance on the wallet
      // executeTransfer debits availableBalance. We should increment lockedBalance.
      await mongoose.models.Wallet.findOneAndUpdate(
        { userId, currency },
        { $inc: { lockedBalance: stake } }
      );

      bet.ledgerEntryIds.push(ledgerEntryId);
      await bet.save();

      // Notify User
      await NotificationService.notifyUser({
        userId: userId,
        category: "BETTING",
        title: "Bet Placed Successfully",
        message: `Your ${type === "SINGLE" ? "single" : "accumulator"} bet of ${stake.toFixed(2)} ${currency} has been placed. Good luck!`
      });

      return bet;
    } catch (error) {
      // If ledger fails, the bet shouldn't exist
      await Bet.findByIdAndDelete(bet._id);
      throw error;
    }
  }
}
