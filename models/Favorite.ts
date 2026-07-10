import mongoose, { Document, Schema } from "mongoose";

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  entityId: string;
  entityType: "TEAM" | "COMPETITION" | "SPORT";
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ["TEAM", "COMPETITION", "SPORT"],
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can only favorite a specific entity once
FavoriteSchema.index({ userId: 1, entityId: 1, entityType: 1 }, { unique: true });

export const Favorite = mongoose.models.Favorite || mongoose.model<IFavorite>("Favorite", FavoriteSchema);
