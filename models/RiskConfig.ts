import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRiskConfig extends Document {
  minStake: number;
  maxStake: number;
  maxPayout: number;
  maxAccumulatorSelections: number;
  globalBettingSuspended: boolean;
  fraudAlertStakeThreshold: number; // Alerts if stake > X
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const RiskConfigSchema = new Schema<IRiskConfig>(
  {
    minStake: { type: Number, default: 0.1 },
    maxStake: { type: Number, default: 5000 },
    maxPayout: { type: Number, default: 100000 },
    maxAccumulatorSelections: { type: Number, default: 15 },
    globalBettingSuspended: { type: Boolean, default: false },
    fraudAlertStakeThreshold: { type: Number, default: 1000 },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const RiskConfig: Model<IRiskConfig> = mongoose.models.RiskConfig || mongoose.model<IRiskConfig>("RiskConfig", RiskConfigSchema);
