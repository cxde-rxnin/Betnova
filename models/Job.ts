import mongoose, { Schema, Document, Model } from "mongoose";

export type JobState = "PENDING" | "PROCESSING" | "RETRYING" | "COMPLETED" | "FAILED" | "DEAD_LETTER";
export type JobPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export interface IJob extends Document {
  name: string;
  status: JobState;
  priority: JobPriority;
  data: Record<string, any>;
  attempts: number;
  maxAttempts: number;
  error?: string;
  worker?: string;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // in ms
  lockedBy?: string;
  lockedUntil?: Date;
  retryAfter?: Date;
  lastHeartbeat?: Date;
  correlationId?: string;
  createdBy?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    name: { type: String, required: true, index: true },
    status: { 
      type: String, 
      enum: ["PENDING", "PROCESSING", "RETRYING", "COMPLETED", "FAILED", "DEAD_LETTER"], 
      default: "PENDING", 
      index: true 
    },
    priority: { 
      type: String, 
      enum: ["LOW", "NORMAL", "HIGH", "CRITICAL"], 
      default: "NORMAL" 
    },
    data: { type: Schema.Types.Mixed, default: {} },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    error: { type: String },
    worker: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
    duration: { type: Number },
    lockedBy: { type: String, index: true },
    lockedUntil: { type: Date, index: true },
    retryAfter: { type: Date, index: true },
    lastHeartbeat: { type: Date },
    correlationId: { type: String, index: true },
    createdBy: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
