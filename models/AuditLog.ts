import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  adminId: mongoose.Types.ObjectId;
  action: string; // e.g., "APPROVE_DEPOSIT", "VOID_BET", "UPDATE_RISK"
  resource: string; // e.g., "FinancialTransaction", "Bet", "RiskConfig"
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // Immutable log
);

export const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
