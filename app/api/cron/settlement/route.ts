import { NextResponse } from "next/server";
import { QueueService } from "@/features/jobs/QueueService";
import { SettlementWorker } from "@/features/jobs/workers/SettlementWorker";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // If we wanted to run strictly via Queue:
    // await QueueService.dispatch("SETTLEMENT", {}, { priority: "HIGH" });
    // await QueueService.processNext("SettlementWorker", SettlementWorker.run);
    
    // Or run the worker directly since this is the dedicated cron endpoint
    const result = await SettlementWorker.run({});
    
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
