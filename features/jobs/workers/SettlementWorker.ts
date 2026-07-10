import { SettlementService } from "@/features/betting/services/SettlementService";
import { Bet } from "@/models/Bet";
import connectToDatabase from "@/lib/db/connect";

export class SettlementWorker {
  /**
   * Scan for pending bets and attempt automatic settlement
   */
  static async run(job: any): Promise<{ processed: number, settled: number }> {
    await connectToDatabase();
    
    // Find up to 50 pending bets
    const pendingBets = await Bet.find({ status: "PENDING" }).limit(50);
    if (pendingBets.length === 0) return { processed: 0, settled: 0 };

    let settledCount = 0;

    for (const bet of pendingBets) {
      try {
        const result = await SettlementService.checkAutoSettlement(bet._id.toString());
        if (result.status !== "PENDING") {
          settledCount++;
        }
      } catch (error) {
        console.error(`[SettlementWorker] Failed to process bet ${bet._id}:`, error);
      }
    }

    return { processed: pendingBets.length, settled: settledCount };
  }
}
