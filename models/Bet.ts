import mongoose, { Document, Schema } from "mongoose";

export type BetStatus = "PENDING" | "WON" | "LOST" | "VOID";
export type BetType = "SINGLE" | "ACCUMULATOR";

export interface IBetSelection {
  fixtureId: string;
  sportId: string;
  competitionId: string;
  matchName: string;
  marketName: string; // e.g., "h2h"
  outcomeName: string; // e.g., "Home", "Away", "Draw"
  homeLogo?: string;
  awayLogo?: string;
  lockedOdds: number;
  status: BetStatus;
}

export interface IBet extends Document {
  userId: mongoose.Types.ObjectId;
  type: BetType;
  status: BetStatus;
  stake: number;
  totalOdds: number;
  potentialPayout: number;
  currency: string;
  selections: IBetSelection[];
  ledgerEntryIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const BetSelectionSchema = new Schema<IBetSelection>({
  fixtureId: { type: String, required: true },
  sportId: { type: String, required: true },
  competitionId: { type: String, required: true },
  matchName: { type: String, required: true },
  marketName: { type: String, required: true },
  outcomeName: { type: String, required: true },
  homeLogo: { type: String },
  awayLogo: { type: String },
  lockedOdds: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "WON", "LOST", "VOID"], default: "PENDING" },
});

const BetSchema = new Schema<IBet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["SINGLE", "ACCUMULATOR"], required: true },
    status: { type: String, enum: ["PENDING", "WON", "LOST", "VOID"], default: "PENDING", index: true },
    stake: { type: Number, required: true, min: 0.01 },
    totalOdds: { type: Number, required: true },
    potentialPayout: { type: Number, required: true },
    currency: { type: String, required: true, default: "USDT" },
    selections: [BetSelectionSchema],
    ledgerEntryIds: [{ type: Schema.Types.ObjectId, ref: "LedgerEntry" }],
  },
  { timestamps: true }
);

export const Bet = mongoose.models.Bet || mongoose.model<IBet>("Bet", BetSchema);
