import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISupportMessage extends Document {
  userId: mongoose.Types.ObjectId;
  text: string;
  sender: "USER" | "ADMIN";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupportMessageSchema = new Schema<ISupportMessage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true },
    sender: { type: String, enum: ["USER", "ADMIN"], required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SupportMessage: Model<ISupportMessage> =
  mongoose.models.SupportMessage || mongoose.model<ISupportMessage>("SupportMessage", SupportMessageSchema);
