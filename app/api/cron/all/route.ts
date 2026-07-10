import { NextResponse } from "next/server";
import { SettlementWorker } from "@/features/jobs/workers/SettlementWorker";
import { ReconciliationWorker } from "@/features/jobs/workers/ReconciliationWorker";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.NODE_ENV !== "development" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const settlementResult = await SettlementWorker.run({});
    const reconciliationResult = await ReconciliationWorker.run({});
    
    return NextResponse.json({ 
      success: true, 
      results: {
        settlement: settlementResult,
        reconciliation: reconciliationResult
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
