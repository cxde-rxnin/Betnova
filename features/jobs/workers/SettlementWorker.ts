import { SettlementService } from "@/features/betting/services/SettlementService";
import { Bet } from "@/models/Bet";
import connectToDatabase from "@/lib/db/connect";

export class SettlementWorker {
  /**
   * Scan for pending bets and attempt automatic settlement.
   * Processes in batches to avoid overwhelming the sports provider API.
   */
  static async run(job: any): Promise<{ processed: number, settled: number, errors: number }> {
    await connectToDatabase();
    
    // Find all pending bets (no limit for thoroughness)
    const pendingBets = await Bet.find({ status: "PENDING" }).sort({ createdAt: 1 });
    if (pendingBets.length === 0) {
      console.log("[SettlementWorker] No pending bets found");
      return { processed: 0, settled: 0, errors: 0 };
    }

    console.log(`[SettlementWorker] Processing ${pendingBets.length} pending bets`);

    let settledCount = 0;
    let errorCount = 0;

    for (const bet of pendingBets) {
      try {
        const result = await SettlementService.checkAutoSettlement(bet._id.toString());
        if (result && result.status !== "PENDING") {
          settledCount++;
          console.log(`[SettlementWorker] Settled bet ${bet._id.toString()}: ${result.status}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`[SettlementWorker] Failed to process bet ${bet._id.toString()}:`, error);
      }
    }

    console.log(`[SettlementWorker] Summary: Processed=${pendingBets.length}, Settled=${settledCount}, Errors=${errorCount}`);
    return { processed: pendingBets.length, settled: settledCount, errors: errorCount };
  }
}
