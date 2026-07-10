import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDepositMethod extends Document {
  currency: string;
  network: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepositMethodSchema = new Schema<IDepositMethod>(
  {
    currency: { type: String, required: true, uppercase: true },
    network: { type: String, required: true },
    address: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DepositMethod: Model<IDepositMethod> = mongoose.models.DepositMethod || mongoose.model<IDepositMethod>("DepositMethod", DepositMethodSchema);
