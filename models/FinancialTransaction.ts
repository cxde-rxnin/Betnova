import mongoose, { Document, Schema } from "mongoose";
import { TransactionType } from "./LedgerEntry";

export type FinancialTransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface IFinancialTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  currency: string;
  status: FinancialTransactionStatus;
  providerReference?: string; // TX Hash
  destinationAddress?: string; // Admin's wallet for deposit, User's wallet for withdrawal
  evidenceUrl?: string; // Cloudinary URL for deposit receipt
  adminNotes?: string; // Reason for rejection or other notes
  ledgerEntryIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const FinancialTransactionSchema = new Schema<IFinancialTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
    providerReference: {
      type: String,
    },
    destinationAddress: {
      type: String,
    },
    evidenceUrl: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
    ledgerEntryIds: [{
      type: Schema.Types.ObjectId,
      ref: "LedgerEntry",
    }],
  },
  { timestamps: true }
);

export const FinancialTransaction = mongoose.models.FinancialTransaction || mongoose.model<IFinancialTransaction>("FinancialTransaction", FinancialTransactionSchema);
