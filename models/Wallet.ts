import mongoose, { Document, Schema } from "mongoose";

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  currency: string;
  availableBalance: number;
  lockedBalance: number;
  status: "ACTIVE" | "FROZEN";
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "USDT",
    },
    availableBalance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lockedBalance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "FROZEN"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

// One wallet per currency per user
WalletSchema.index({ userId: 1, currency: 1 }, { unique: true });

export const Wallet = mongoose.models.Wallet || mongoose.model<IWallet>("Wallet", WalletSchema);
