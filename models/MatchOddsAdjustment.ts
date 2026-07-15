import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMatchOddsAdjustment extends Document {
  matchId: string;
  increasePercent: number;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MatchOddsAdjustmentSchema = new Schema<IMatchOddsAdjustment>(
  {
    matchId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    increasePercent: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const MatchOddsAdjustment: Model<IMatchOddsAdjustment> =
  mongoose.models.MatchOddsAdjustment || mongoose.model<IMatchOddsAdjustment>("MatchOddsAdjustment", MatchOddsAdjustmentSchema);
