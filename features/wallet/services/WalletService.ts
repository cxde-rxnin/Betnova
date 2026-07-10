import connectToDatabase from "@/lib/db/connect";
import { Wallet } from "@/models/Wallet";
import { FinancialTransaction, FinancialTransactionStatus } from "@/models/FinancialTransaction";
import { LedgerService } from "./LedgerService";
import { NotificationService } from "@/features/notifications/NotificationService";

export class WalletService {
  /**
   * Ensures a user has a wallet for the specified currency.
   */
  static async getOrCreateWallet(userId: string, currency: string = "USDT") {
    await connectToDatabase();
    
    let wallet = await Wallet.findOne({ userId, currency });
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        currency,
        availableBalance: 0,
        lockedBalance: 0,
        status: "ACTIVE",
      });
      // Ensure the corresponding ledger account exists
      await LedgerService.getUserAccount(userId, currency);
    }
    
    return wallet;
  }

  static async getBalances(userId: string) {
    await connectToDatabase();
    const wallets = await Wallet.find({ userId });
    
    // Auto-provision USDT if empty
    if (wallets.length === 0) {
      const defaultWallet = await this.getOrCreateWallet(userId, "USDT");
      return [defaultWallet];
    }
    
    return wallets;
  }

  static async getTransactions(userId: string) {
    await connectToDatabase();
    return await FinancialTransaction.find({ userId }).sort({ createdAt: -1 }).limit(50);
  }

  static async createDepositRequest(userId: string, amount: number, currency: string, txHash: string, evidenceUrl: string) {
    await connectToDatabase();
    
    // Admin checks the deposit address, we just log the TX Hash provided by the user
    const tx = await FinancialTransaction.create({
      userId,
      type: "DEPOSIT",
      amount,
      currency,
      status: "PENDING",
      providerReference: txHash,
      evidenceUrl,
      destinationAddress: "ADMIN_GLOBAL_WALLET_USDT" // In reality, fetch from settings
    });

    // In a real app, an admin or cron job would verify this TX hash on the blockchain.
    // For MVP flow, we could auto-complete it or leave it pending for admin approval.
    
    await NotificationService.notifyUser({
      userId,
      category: "FINANCIAL",
      title: "Deposit Initiated",
      message: `Your deposit request for ${amount.toFixed(2)} ${currency} is being processed. It will be credited to your account once confirmed on the blockchain.`
    });

    return tx;
  }

  static async processDeposit(transactionId: string) {
    await connectToDatabase();
    
    const tx = await FinancialTransaction.findById(transactionId);
    if (!tx || tx.type !== "DEPOSIT" || tx.status !== "PENDING") {
      throw new Error("Invalid deposit transaction");
    }

    const depositClearing = await LedgerService.getSystemAccount("DEPOSIT_CLEARING", tx.currency);
    const userAccount = await LedgerService.getUserAccount(tx.userId.toString(), tx.currency);

    // Credit user, debit clearing (where funds landed)
    const ledgerEntryId = await LedgerService.executeTransfer({
      debitAccountId: depositClearing._id.toString(),
      creditAccountId: userAccount._id.toString(),
      amount: tx.amount,
      currency: tx.currency,
      transactionType: "DEPOSIT",
      referenceId: tx._id.toString(),
      userIdToUpdate: tx.userId.toString(),
    });

    tx.status = "COMPLETED";
    tx.ledgerEntryIds.push(ledgerEntryId);
    await tx.save();

    await NotificationService.notifyUser({
      userId: tx.userId.toString(),
      category: "FINANCIAL",
      title: "Deposit Confirmed",
      message: `Your deposit of ${tx.amount.toFixed(2)} ${tx.currency} has been successfully credited to your account.`
    });

    return tx;
  }

  static async createWithdrawalRequest(userId: string, amount: number, currency: string, destinationAddress: string) {
    await connectToDatabase();
    
    const wallet = await this.getOrCreateWallet(userId, currency);
    if (wallet.availableBalance < amount) {
      throw new Error("Insufficient funds");
    }

    // Move funds from Available to Locked immediately (requires Ledger transfer)
    const userAccount = await LedgerService.getUserAccount(userId, currency);
    const withdrawalClearing = await LedgerService.getSystemAccount("WITHDRAWAL_CLEARING", currency);

    // Actually, locking funds means we debit the user and credit the clearing account, 
    // so the money is reserved.
    const ledgerEntryId = await LedgerService.executeTransfer({
      debitAccountId: userAccount._id.toString(),
      creditAccountId: withdrawalClearing._id.toString(),
      amount,
      currency,
      transactionType: "WITHDRAWAL",
      referenceId: `REQ_${Date.now()}`, // Temporary reference until TX is created
      userIdToUpdate: userId,
    });

    const tx = await FinancialTransaction.create({
      userId,
      type: "WITHDRAWAL",
      amount,
      currency,
      status: "PENDING",
      destinationAddress,
      ledgerEntryIds: [ledgerEntryId]
    });

    // Update the ledger entry reference to the real TX id
    await connectToDatabase().then(async (mongoose) => {
       await mongoose.models.LedgerEntry.findByIdAndUpdate(ledgerEntryId, { referenceId: tx._id.toString() });
    });

    await NotificationService.notifyUser({
      userId,
      category: "FINANCIAL",
      title: "Withdrawal Requested",
      message: `Your withdrawal request for ${amount.toFixed(2)} ${currency} has been received and is pending admin approval.`
    });

    return tx;
  }
}
