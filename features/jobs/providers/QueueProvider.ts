export interface EnqueueOptions {
  priority?: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  delayMs?: number;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export interface JobMetrics {
  pendingCount: number;
  processingCount: number;
  failedCount: number;
  completedCount: number;
  deadLetterCount: number;
  avgDurationMs?: number;
}

export interface QueueProvider {
  /**
   * Add a new job to the queue
   */
  enqueue(name: string, data: Record<string, any>, options?: EnqueueOptions): Promise<string>;
  
  /**
   * Acquire a lock on the next available job
   */
  lockNext(workerName: string): Promise<any | null>;
  
  /**
   * Mark a job as completed successfully
   */
  complete(jobId: string, result?: any): Promise<void>;
  
  /**
   * Mark a job as failed, triggering retries or dead-lettering
   */
  fail(jobId: string, error: string): Promise<void>;
  
  /**
   * Retrieve operational metrics
   */
  getMetrics(): Promise<JobMetrics>;
}
