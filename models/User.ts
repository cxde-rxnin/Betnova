import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  username: string;
  name?: string;
  passwordHash?: string;
  avatar?: string;
  country?: string;
  preferredCurrency?: string;
  timeZone?: string;
  language?: string;
  status: "ACTIVE" | "SUSPENDED";
  kycStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  kycDocumentUrl?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  role: "USER" | "SUPER_ADMIN" | "ADMIN" | "OPERATIONS" | "FINANCE" | "SUPPORT" | "RISK_ANALYST";
  lastLogin?: Date;
  resetCode?: string;
  resetCodeExpires?: Date;
  withdrawalOtp?: string;
  withdrawalOtpExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
    },
    avatar: {
      type: String,
    },
    country: {
      type: String,
      default: "US",
    },
    preferredCurrency: {
      type: String,
      default: "USD",
    },
    timeZone: {
      type: String,
      default: "UTC",
    },
    language: {
      type: String,
      default: "en",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
    kycStatus: {
      type: String,
      enum: ["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"],
      default: "UNVERIFIED",
    },
    kycDocumentUrl: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["USER", "SUPER_ADMIN", "ADMIN", "OPERATIONS", "FINANCE", "SUPPORT", "RISK_ANALYST"],
      default: "USER",
    },
    lastLogin: {
      type: Date,
    },
    resetCode: {
      type: String,
    },
    resetCodeExpires: {
      type: Date,
    },
    withdrawalOtp: {
      type: String,
    },
    withdrawalOtpExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Prevent model recompilation error in development
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
