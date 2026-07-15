"use server";

import { auth } from "@/lib/auth";
import { WalletService } from "./services/WalletService";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import connectToDatabase from "@/lib/db/connect";
import { User } from "@/models/User";
import { DepositMethod } from "@/models/DepositMethod";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getWalletBalances() {
  const userId = await getUserId();
  const balances = await WalletService.getBalances(userId);
  return JSON.parse(JSON.stringify(balances)); // Serialize Mongoose docs
}

export async function getTransactionHistory() {
  const userId = await getUserId();
  const transactions = await WalletService.getTransactions(userId);
  return JSON.parse(JSON.stringify(transactions));
}

export async function requestDeposit(formData: FormData) {
  const userId = await getUserId();
  
  await connectToDatabase();
  const user = await User.findById(userId).select("kycStatus").lean();
  if (!user || user.kycStatus !== "VERIFIED") {
    throw new Error("KYC Verification required to make a deposit");
  }
  
  const amountStr = formData.get("amount") as string;
  const currency = formData.get("currency") as string;
  const txHash = formData.get("txHash") as string;
  const receipt = formData.get("receipt") as File | null;

  if (!amountStr || !currency || !txHash || !receipt) {
    throw new Error("Missing required deposit fields");
  }

  const amount = parseFloat(amountStr);

  // Upload to Cloudinary using streams to bypass server action base64 payload limits
  let evidenceUrl = "";
  try {
    const arrayBuffer = await receipt.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    evidenceUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "betnovo/receipts" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Failed to upload deposit receipt image.");
  }

  const tx = await WalletService.createDepositRequest(userId, amount, currency, txHash, evidenceUrl);
  
  revalidatePath("/wallet");
  return { success: true, transactionId: tx._id.toString() };
}

export async function requestWithdrawal(amount: number, currency: string, destinationAddress: string, vatCode: string) {
  const userId = await getUserId();

  await connectToDatabase();
  const user = await User.findById(userId).select("kycStatus withdrawalVatCode").lean();
  if (!user || user.kycStatus !== "VERIFIED") {
    throw new Error("KYC Verification required to request a withdrawal");
  }

  const enteredVatCode = vatCode.trim();
  if (!enteredVatCode) {
    throw new Error("VAT code is required to authorize pending transactions.");
  }

  const assignedVatCode = user.withdrawalVatCode?.trim();
  if (!assignedVatCode) {
    throw new Error("No VAT code is assigned to your account yet. Please contact support.");
  }

  if (enteredVatCode !== assignedVatCode) {
    throw new Error("Invalid VAT code. Please contact support for a valid code.");
  }

  const consumed = await User.updateOne(
    { _id: userId, withdrawalVatCode: assignedVatCode },
    { $unset: { withdrawalVatCode: 1, withdrawalVatCodeIssuedAt: 1 } }
  );
  if (consumed.modifiedCount !== 1) {
    throw new Error("VAT code has already been used. Please contact support for a new code.");
  }

  const tx = await WalletService.createWithdrawalRequest(userId, amount, currency, destinationAddress);
  
  revalidatePath("/wallet");
  return { success: true, transactionId: tx._id.toString() };
}

export async function getActiveDepositMethods() {
  await connectToDatabase();
  const methods = await DepositMethod.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(methods));
}
