import { getQueueProvider } from "@/lib/providers/queue";
import { EnqueueOptions } from "./providers/QueueProvider";

export class QueueService {
  /**
   * Dispatch a new job to the queue
   */
  static async dispatch(name: string, data: Record<string, any>, options?: EnqueueOptions): Promise<string> {
    const provider = getQueueProvider();
    return await provider.enqueue(name, data, options);
  }

  /**
   * Process a single job off the queue
   * Typically called by a Cron or daemon
   */
  static async processNext(workerName: string, handler: (job: any) => Promise<any>): Promise<boolean> {
    const provider = getQueueProvider();
    
    const job = await provider.lockNext(workerName);
    if (!job) return false; // Queue is empty

    try {
      const result = await handler(job);
      await provider.complete(job._id.toString(), result);
      return true;
    } catch (error: any) {
      await provider.fail(job._id.toString(), error.message || String(error));
      return true;
    }
  }

  /**
   * Get operational metrics for the queue
   */
  static async getMetrics() {
    const provider = getQueueProvider();
    return await provider.getMetrics();
  }
}
