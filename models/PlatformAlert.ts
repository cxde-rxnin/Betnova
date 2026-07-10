import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlatformAlert extends Document {
  type: "FRAUD_SIGNAL" | "EXPOSURE_WARNING" | "SYSTEM_ERROR" | "RECONCILIATION_ERROR";
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  category: "FINANCIAL" | "BETTING" | "SYSTEM" | "SECURITY";
  source: string;
  relatedEntity?: string;
  message: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  acknowledgedBy?: mongoose.Types.ObjectId;
  acknowledgedAt?: Date;
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  createdAt: Date;
  updatedAt: Date;
}

const PlatformAlertSchema = new Schema<IPlatformAlert>(
  {
    type: { type: String, enum: ["FRAUD_SIGNAL", "EXPOSURE_WARNING", "SYSTEM_ERROR", "RECONCILIATION_ERROR"], required: true, index: true },
    severity: { type: String, enum: ["INFO", "WARNING", "ERROR", "CRITICAL"], required: true },
    category: { type: String, enum: ["FINANCIAL", "BETTING", "SYSTEM", "SECURITY"], default: "SYSTEM" },
    source: { type: String, default: "SYSTEM" },
    relatedEntity: { type: String },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    resolved: { type: Boolean, default: false, index: true },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: "User" },
    acknowledgedAt: { type: Date },
    status: { type: String, enum: ["OPEN", "ACKNOWLEDGED", "RESOLVED"], default: "OPEN", index: true },
  },
  { timestamps: true }
);

export const PlatformAlert: Model<IPlatformAlert> = mongoose.models.PlatformAlert || mongoose.model<IPlatformAlert>("PlatformAlert", PlatformAlertSchema);
