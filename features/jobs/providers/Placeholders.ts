import { QueueProvider, EnqueueOptions, JobMetrics } from "./QueueProvider";

export class BullMQProvider implements QueueProvider {
  async enqueue(name: string, data: Record<string, any>, options?: EnqueueOptions): Promise<string> {
    throw new Error("BullMQProvider not implemented. Install bullmq and configure Redis.");
  }
  async lockNext(workerName: string): Promise<any | null> {
    throw new Error("BullMQProvider not implemented.");
  }
  async complete(jobId: string, result?: any): Promise<void> {
    throw new Error("BullMQProvider not implemented.");
  }
  async fail(jobId: string, error: string): Promise<void> {
    throw new Error("BullMQProvider not implemented.");
  }
  async getMetrics(): Promise<JobMetrics> {
    throw new Error("BullMQProvider not implemented.");
  }
}

export class InngestProvider implements QueueProvider {
  // Placeholder for Inngest Serverless queues
  async enqueue(name: string, data: Record<string, any>, options?: EnqueueOptions): Promise<string> {
    throw new Error("InngestProvider not implemented.");
  }
  async lockNext(workerName: string): Promise<any | null> { throw new Error("Not implemented."); }
  async complete(jobId: string, result?: any): Promise<void> { throw new Error("Not implemented."); }
  async fail(jobId: string, error: string): Promise<void> { throw new Error("Not implemented."); }
  async getMetrics(): Promise<JobMetrics> { throw new Error("Not implemented."); }
}
