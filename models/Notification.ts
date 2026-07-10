import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  category: "FINANCIAL" | "BETTING" | "ACCOUNT" | "OPERATIONAL";
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { 
      type: String, 
      enum: ["FINANCIAL", "BETTING", "ACCOUNT", "OPERATIONAL"], 
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
