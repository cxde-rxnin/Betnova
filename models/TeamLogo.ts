import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeamLogo extends Document {
  teamName: string;
  logoUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamLogoSchema = new Schema<ITeamLogo>(
  {
    teamName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    logoUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const TeamLogo: Model<ITeamLogo> = mongoose.models.TeamLogo || mongoose.model<ITeamLogo>("TeamLogo", TeamLogoSchema);
