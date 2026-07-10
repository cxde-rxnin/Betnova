import connectToDatabase from "@/lib/db/connect";
import { Wallet } from "@/models/Wallet";
import { LedgerEntry } from "@/models/LedgerEntry";
import { PlatformAlert } from "@/models/PlatformAlert";

export class ReconciliationWorker {
  /**
   * Verify consistency between Wallet balances and the Ledger
   */
  static async run(job: any): Promise<{ scanned: number, discrepancies: number }> {
    await connectToDatabase();
    
    // In a real system, you'd process in batches or use the cursor.
    // For MVP, we'll scan all user wallets
    const wallets = await Wallet.find().limit(100);
    let discrepancies = 0;

    for (const wallet of wallets) {
      // Calculate true balance from immutable ledger
      const credits = await LedgerEntry.aggregate([
        { $match: { creditAccountId: wallet._id, status: "COMMITTED" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      const debits = await LedgerEntry.aggregate([
        { $match: { debitAccountId: wallet._id, status: "COMMITTED" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);

      const totalCredits = credits[0]?.total || 0;
      const totalDebits = debits[0]?.total || 0;
      
      const expectedTotalBalance = totalCredits - totalDebits;
      const actualTotalBalance = wallet.availableBalance + wallet.lockedBalance;

      // Ignore tiny floating point differences
      if (Math.abs(expectedTotalBalance - actualTotalBalance) > 0.001) {
        discrepancies++;
        
        await PlatformAlert.create({
          type: "RECONCILIATION_ERROR",
          severity: "CRITICAL",
          category: "FINANCIAL",
          source: "ReconciliationWorker",
          relatedEntity: wallet._id.toString(),
          message: `Wallet ${wallet._id} mismatch! Expected: ${expectedTotalBalance}, Actual: ${actualTotalBalance}`,
          metadata: { expectedTotalBalance, actualTotalBalance, difference: Math.abs(expectedTotalBalance - actualTotalBalance) }
        });
      }
    }

    return { scanned: wallets.length, discrepancies };
  }
}
