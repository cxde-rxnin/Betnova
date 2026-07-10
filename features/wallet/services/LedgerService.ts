import mongoose from "mongoose";
import connectToDatabase from "@/lib/db/connect";
import { LedgerAccount, LedgerAccountType } from "@/models/LedgerAccount";
import { LedgerEntry, TransactionType } from "@/models/LedgerEntry";
import { Wallet } from "@/models/Wallet";

export class LedgerService {
  /**
   * Gets or creates a system-level ledger account.
   */
  static async getSystemAccount(type: LedgerAccountType, currency: string) {
    await connectToDatabase();
    
    let account = await LedgerAccount.findOne({ type, currency, referenceId: { $exists: false } });
    if (!account) {
      account = await LedgerAccount.create({
        name: `System ${type} (${currency})`,
        type,
        currency,
      });
    }
    return account;
  }

  /**
   * Gets or creates a user's specific ledger account.
   */
  static async getUserAccount(userId: string, currency: string) {
    await connectToDatabase();
    
    let account = await LedgerAccount.findOne({ type: "USER_WALLET", referenceId: userId, currency });
    if (!account) {
      account = await LedgerAccount.create({
        name: `User Wallet ${userId} (${currency})`,
        type: "USER_WALLET",
        currency,
        referenceId: userId,
      });
    }
    return account;
  }

  /**
   * Executes a double-entry transaction atomically.
   */
  static async executeTransfer({
    debitAccountId,
    creditAccountId,
    amount,
    currency,
    transactionType,
    referenceId,
    metadata,
    userIdToUpdate // If provided, updates the materialized Wallet balance
  }: {
    debitAccountId: string;
    creditAccountId: string;
    amount: number;
    currency: string;
    transactionType: TransactionType;
    referenceId: string;
    metadata?: any;
    userIdToUpdate?: string;
  }): Promise<string> {
    await connectToDatabase();
    
    if (amount <= 0) throw new Error("Transfer amount must be strictly positive");

    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();

      // Create the immutable ledger entry
      const entry = await LedgerEntry.create([{
        debitAccountId,
        creditAccountId,
        amount,
        currency,
        transactionType,
        referenceId,
        metadata
      }], { session });

      // If a user wallet needs to be updated (materialized view)
      if (userIdToUpdate) {
        // Determine if the user is being credited or debited
        const userAcc = await LedgerAccount.findOne({ type: "USER_WALLET", referenceId: userIdToUpdate, currency }).session(session);
        
        if (!userAcc) throw new Error("User ledger account not found");

        const isCredit = userAcc._id.toString() === creditAccountId.toString();
        const isDebit = userAcc._id.toString() === debitAccountId.toString();

        if (isCredit) {
          await Wallet.findOneAndUpdate(
            { userId: userIdToUpdate, currency },
            { $inc: { availableBalance: amount } },
            { session, new: true, upsert: true }
          );
        } else if (isDebit) {
          const wallet = await Wallet.findOne({ userId: userIdToUpdate, currency }).session(session);
          if (!wallet || wallet.availableBalance < amount) {
            throw new Error("Insufficient funds for debit");
          }
          await Wallet.findOneAndUpdate(
            { userId: userIdToUpdate, currency },
            { $inc: { availableBalance: -amount } },
            { session }
          );
        }
      }

      await session.commitTransaction();
      return entry[0]._id.toString();
    } catch (error) {
      await session.abortTransaction();
      // Simple fallback if replica set is not configured (for local dev)
      if (error instanceof Error && error.message.includes("Transaction numbers are only allowed on a replica set")) {
        console.warn("MongoDB replica set not detected. Executing ledger operation WITHOUT atomicity. DO NOT USE IN PRODUCTION.");
        return await this.executeTransferNonAtomic({ debitAccountId, creditAccountId, amount, currency, transactionType, referenceId, metadata, userIdToUpdate });
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Fallback for local development without Replica Sets.
   */
  private static async executeTransferNonAtomic(params: any): Promise<string> {
    const entry = await LedgerEntry.create({
      debitAccountId: params.debitAccountId,
      creditAccountId: params.creditAccountId,
      amount: params.amount,
      currency: params.currency,
      transactionType: params.transactionType,
      referenceId: params.referenceId,
      metadata: params.metadata
    });

    if (params.userIdToUpdate) {
      const userAcc = await LedgerAccount.findOne({ type: "USER_WALLET", referenceId: params.userIdToUpdate, currency: params.currency });
      if (userAcc) {
        const isCredit = userAcc._id.toString() === params.creditAccountId.toString();
        const isDebit = userAcc._id.toString() === params.debitAccountId.toString();

        if (isCredit) {
          await Wallet.findOneAndUpdate(
            { userId: params.userIdToUpdate, currency: params.currency },
            { $inc: { availableBalance: params.amount } },
            { upsert: true }
          );
        } else if (isDebit) {
          await Wallet.findOneAndUpdate(
            { userId: params.userIdToUpdate, currency: params.currency },
            { $inc: { availableBalance: -params.amount } }
          );
        }
      }
    }

    return entry._id.toString();
  }
}
