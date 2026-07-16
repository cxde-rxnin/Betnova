import { NextResponse } from "next/server";
import { SettlementWorker } from "@/features/jobs/workers/SettlementWorker";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const result = await SettlementWorker.run({});
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("[Settlement Cron] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
