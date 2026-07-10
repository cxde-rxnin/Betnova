import mongoose, { Document, Schema } from "mongoose";

export type LedgerAccountType = "USER_WALLET" | "TREASURY" | "DEPOSIT_CLEARING" | "WITHDRAWAL_CLEARING" | "BONUS_POOL";

export interface ILedgerAccount extends Document {
  name: string;
  type: LedgerAccountType;
  currency: string;
  referenceId?: string; // e.g. userId for USER_WALLET
  createdAt: Date;
}

const LedgerAccountSchema = new Schema<ILedgerAccount>(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["USER_WALLET", "TREASURY", "DEPOSIT_CLEARING", "WITHDRAWAL_CLEARING", "BONUS_POOL"],
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    referenceId: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

// Ensure only one ledger account per user per currency exists
LedgerAccountSchema.index({ type: 1, referenceId: 1, currency: 1 }, { unique: true, partialFilterExpression: { referenceId: { $exists: true } } });

export const LedgerAccount = mongoose.models.LedgerAccount || mongoose.model<ILedgerAccount>("LedgerAccount", LedgerAccountSchema);
