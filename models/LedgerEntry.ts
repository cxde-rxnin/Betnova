import mongoose, { Document, Schema } from "mongoose";

export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "BET_PLACE" | "BET_WIN" | "REFUND" | "BONUS";

export interface ILedgerEntry extends Document {
  debitAccountId: mongoose.Types.ObjectId;
  creditAccountId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  transactionType: TransactionType;
  referenceId: string; // Links to the FinancialTransaction or Bet
  metadata?: Record<string, any>;
  createdAt: Date;
}

const LedgerEntrySchema = new Schema<ILedgerEntry>(
  {
    debitAccountId: {
      type: Schema.Types.ObjectId,
      ref: "LedgerAccount",
      required: true,
      index: true,
    },
    creditAccountId: {
      type: Schema.Types.ObjectId,
      ref: "LedgerAccount",
      required: true,
      index: true,
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
    transactionType: {
      type: String,
      enum: ["DEPOSIT", "WITHDRAWAL", "TRANSFER", "BET_PLACE", "BET_WIN", "REFUND", "BONUS"],
      required: true,
    },
    referenceId: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // Immutable, so no updatedAt
);

export const LedgerEntry = mongoose.models.LedgerEntry || mongoose.model<ILedgerEntry>("LedgerEntry", LedgerEntrySchema);
