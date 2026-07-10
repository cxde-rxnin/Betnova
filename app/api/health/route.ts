import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getQueueProvider } from "@/lib/providers/queue";

export async function GET() {
  const health: any = {
    status: "UP",
    timestamp: new Date().toISOString(),
    services: {
      database: "UNKNOWN",
      queue: "UNKNOWN"
    }
  };

  try {
    // 1. Check Database
    if (mongoose.connection.readyState === 1) {
      health.services.database = "UP";
    } else {
      health.services.database = "DOWN";
      health.status = "DEGRADED";
    }

    // 2. Check Queue
    try {
      const provider = getQueueProvider();
      await provider.getMetrics();
      health.services.queue = "UP";
    } catch (e) {
      health.services.queue = "DOWN";
      health.status = "DEGRADED";
    }

  } catch (error) {
    health.status = "DOWN";
  }

  return NextResponse.json(health, { status: health.status === "UP" ? 200 : 503 });
}
