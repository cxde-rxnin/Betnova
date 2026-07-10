import { QueueProvider, EnqueueOptions, JobMetrics } from "./QueueProvider";
import { Job, IJob } from "@/models/Job";
import connectToDatabase from "@/lib/db/connect";

export class MongoQueueProvider implements QueueProvider {
  async enqueue(name: string, data: Record<string, any>, options?: EnqueueOptions): Promise<string> {
    await connectToDatabase();
    
    const job = await Job.create({
      name,
      data,
      priority: options?.priority || "NORMAL",
      correlationId: options?.correlationId,
      metadata: options?.metadata,
      retryAfter: options?.delayMs ? new Date(Date.now() + options.delayMs) : undefined,
    });
    
    return job._id.toString();
  }

  async lockNext(workerName: string): Promise<IJob | null> {
    await connectToDatabase();
    
    const now = new Date();
    // Find a pending or retryable job that isn't currently locked, or lock has expired
    const query = {
      $and: [
        { status: { $in: ["PENDING", "RETRYING"] } },
        { $or: [{ retryAfter: { $exists: false } }, { retryAfter: { $lte: now } }] },
        { $or: [{ lockedUntil: { $exists: false } }, { lockedUntil: { $lt: now } }] }
      ]
    };

    const lockDurationMs = 5 * 60 * 1000; // 5 minute lock
    
    const job = await Job.findOneAndUpdate(
      query as any,
      {
        $set: {
          status: "PROCESSING",
          worker: workerName,
          lockedBy: workerName,
          lockedUntil: new Date(Date.now() + lockDurationMs),
          startedAt: now,
          lastHeartbeat: now
        },
        $inc: { attempts: 1 }
      },
      { sort: { priority: -1, createdAt: 1 }, new: true }
    );

    return job;
  }

  async complete(jobId: string, result?: any): Promise<void> {
    await connectToDatabase();
    
    const job = await Job.findById(jobId);
    if (!job) return;

    job.status = "COMPLETED";
    job.completedAt = new Date();
    if (job.startedAt) {
      job.duration = job.completedAt.getTime() - job.startedAt.getTime();
    }
    
    // Clear lock
    job.lockedBy = undefined;
    job.lockedUntil = undefined;
    
    if (result && !job.metadata) job.metadata = {};
    if (result) job.metadata!.result = result;

    await job.save();
  }

  async fail(jobId: string, error: string): Promise<void> {
    await connectToDatabase();
    
    const job = await Job.findById(jobId);
    if (!job) return;

    job.error = error;
    
    if (job.attempts >= job.maxAttempts) {
      job.status = "DEAD_LETTER";
    } else {
      job.status = "RETRYING";
      // Exponential backoff: 1m, 2m, 4m...
      const backoffMs = Math.pow(2, job.attempts) * 60 * 1000; 
      job.retryAfter = new Date(Date.now() + backoffMs);
    }
    
    // Clear lock
    job.lockedBy = undefined;
    job.lockedUntil = undefined;
    
    await job.save();
  }

  async getMetrics(): Promise<JobMetrics> {
    await connectToDatabase();
    
    const metrics = await Job.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const result: JobMetrics = {
      pendingCount: 0,
      processingCount: 0,
      failedCount: 0,
      completedCount: 0,
      deadLetterCount: 0
    };

    metrics.forEach(m => {
      if (m._id === "PENDING" || m._id === "RETRYING") result.pendingCount += m.count;
      else if (m._id === "PROCESSING") result.processingCount += m.count;
      else if (m._id === "FAILED") result.failedCount += m.count;
      else if (m._id === "COMPLETED") result.completedCount += m.count;
      else if (m._id === "DEAD_LETTER") result.deadLetterCount += m.count;
    });

    return result;
  }
}
