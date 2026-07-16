"use server";

import { auth } from "@/lib/auth";
import { FinancialTransaction } from "@/models/FinancialTransaction";
import { LedgerService } from "@/features/wallet/services/LedgerService";
import { revalidatePath } from "next/cache";
import connectToDatabase from "@/lib/db/connect";
import { requirePermission } from "@/lib/rbac";
import { AuditLog } from "@/models/AuditLog";
import { User } from "@/models/User";
import { RiskConfig } from "@/models/RiskConfig";
import { DepositMethod } from "@/models/DepositMethod";
import { NotificationService } from "@/features/notifications/NotificationService";
import { randomBytes } from "crypto";

async function getAdminId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

function generateVatCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function getPendingTransactions() {
  await requirePermission("VIEW_FINANCES");
  await connectToDatabase();
  const txs = await FinancialTransaction.find({ status: "PENDING" })
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
  
  return JSON.parse(JSON.stringify(txs));
}

export async function approveDeposit(transactionId: string, approvedAmount?: number) {
  await requirePermission("MANAGE_FINANCES");
  const adminId = await getAdminId();
  await connectToDatabase();

  const tx = await FinancialTransaction.findById(transactionId);
  if (!tx || tx.type !== "DEPOSIT" || tx.status !== "PENDING") {
    throw new Error("Invalid deposit transaction");
  }

  let amountToCredit = tx.amount;
  let currencyToCredit = tx.currency;

  if (tx.currency !== "USDT") {
    if (!approvedAmount || approvedAmount <= 0) throw new Error("Must provide USD equivalent for crypto deposits");
    amountToCredit = approvedAmount;
    currencyToCredit = "USDT";
  }

  const depositClearing = await LedgerService.getSystemAccount("DEPOSIT_CLEARING", currencyToCredit);
  const userAccount = await LedgerService.getUserAccount(tx.userId.toString(), currencyToCredit);

  const ledgerEntryId = await LedgerService.executeTransfer({
    debitAccountId: depositClearing._id.toString(),
    creditAccountId: userAccount._id.toString(),
    amount: amountToCredit,
    currency: currencyToCredit,
    transactionType: "DEPOSIT",
    referenceId: tx._id.toString(),
    userIdToUpdate: tx.userId.toString(),
  });

  tx.status = "COMPLETED";
  tx.ledgerEntryIds.push(ledgerEntryId);
  await tx.save();

  await AuditLog.create({
    adminId,
    action: "APPROVE_DEPOSIT",
    resource: "FinancialTransaction",
    resourceId: tx._id.toString(),
    details: { amount: tx.amount, currency: tx.currency }
  });

  // Send notification to user
  await NotificationService.notifyUser({
    userId: tx.userId.toString(),
    category: "FINANCIAL",
    title: "Deposit Approved",
    message: `Your deposit of ${tx.amount} ${tx.currency} has been approved and credited to your wallet as ${amountToCredit} ${currencyToCredit}.`,
  });

  revalidatePath("/admin/finances");
  revalidatePath("/wallet");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function rejectTransaction(transactionId: string, reason: string) {
  await requirePermission("MANAGE_FINANCES");
  const adminId = await getAdminId();
  await connectToDatabase();
  
  const tx = await FinancialTransaction.findById(transactionId);
  if (!tx || tx.status !== "PENDING") throw new Error("Invalid transaction");

  // If rejecting a withdrawal, we must refund the locked balance back to available
  if (tx.type === "WITHDRAWAL") {
    const userAccount = await LedgerService.getUserAccount(tx.userId.toString(), tx.currency);
    const withdrawalClearing = await LedgerService.getSystemAccount("WITHDRAWAL_CLEARING", tx.currency);

    // Reverse the initial lock
    const ledgerEntryId = await LedgerService.executeTransfer({
      debitAccountId: withdrawalClearing._id.toString(),
      creditAccountId: userAccount._id.toString(),
      amount: tx.amount,
      currency: tx.currency,
      transactionType: "REFUND",
      referenceId: tx._id.toString(),
      userIdToUpdate: tx.userId.toString(),
    });
    tx.ledgerEntryIds.push(ledgerEntryId);
  }

  tx.status = "FAILED";
  tx.adminNotes = reason;
  await tx.save();

  await AuditLog.create({
    adminId,
    action: "REJECT_TRANSACTION",
    resource: "FinancialTransaction",
    resourceId: tx._id.toString(),
    details: { reason, type: tx.type }
  });

  revalidatePath("/admin/finances");
  return { success: true };
}

export async function approveWithdrawal(transactionId: string, providerTxHash: string) {
  await requirePermission("MANAGE_FINANCES");
  const adminId = await getAdminId();
  await connectToDatabase();
  
  const tx = await FinancialTransaction.findById(transactionId);
  if (!tx || tx.type !== "WITHDRAWAL" || tx.status !== "PENDING") throw new Error("Invalid withdrawal");

  // At this point, the admin has sent the funds on the blockchain and provided the TX Hash.
  // The funds are currently locked in WITHDRAWAL_CLEARING.
  // We don't need another ledger entry since the funds have left the platform, 
  // but if we want strict accounting, we would move it from WITHDRAWAL_CLEARING to an external dummy account.
  // For MVP, marking as COMPLETED is sufficient since the user balance was already decremented.

  tx.status = "COMPLETED";
  tx.providerReference = providerTxHash;
  await tx.save();

  await AuditLog.create({
    adminId,
    action: "APPROVE_WITHDRAWAL",
    resource: "FinancialTransaction",
    resourceId: tx._id.toString(),
    details: { providerTxHash }
  });

  revalidatePath("/admin/finances");
  return { success: true };
}

export async function generateWithdrawalVatCode(userId: string) {
  await requirePermission("MANAGE_FINANCES");
  const adminId = await getAdminId();
  await connectToDatabase();

  const user = await User.findById(userId).select("email");
  if (!user) throw new Error("User not found");

  const code = generateVatCode();
  user.withdrawalVatCode = code;
  user.withdrawalVatCodeIssuedAt = new Date();
  await user.save();

  await AuditLog.create({
    adminId,
    action: "GENERATE_WITHDRAWAL_VAT_CODE",
    resource: "User",
    resourceId: user._id.toString(),
    details: { userId: user._id.toString() },
  });

  revalidatePath("/admin/finances");
  return { success: true, code, userId: user._id.toString(), email: user.email };
}

// USERS & KYC
import { Wallet } from "@/models/Wallet";

export async function getAllUsers() {
  await requirePermission("VIEW_USERS");
  await connectToDatabase();
  
  const users = await User.aggregate([
    {
      $lookup: {
        from: "wallets",
        localField: "_id",
        foreignField: "userId",
        as: "wallets"
      }
    },
    { $sort: { createdAt: -1 } }
  ]);

  return JSON.parse(JSON.stringify(users));
}

export async function approveKyc(userId: string) {
  await requirePermission("VIEW_USERS"); // Or MANAGE_USERS
  const adminId = await getAdminId();
  await connectToDatabase();

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.kycStatus = "VERIFIED";
  await user.save();

  await AuditLog.create({
    adminId,
    action: "APPROVE_KYC",
    resource: "User",
    resourceId: user._id.toString(),
  });

  revalidatePath("/admin/kyc");
  revalidatePath("/admin/users");
  revalidatePath("/", "layout"); // Force layout re-fetch for KycGuard
  return { success: true };
}

export async function rejectKyc(userId: string) {
  await requirePermission("VIEW_USERS"); // Or MANAGE_USERS
  const adminId = await getAdminId();
  await connectToDatabase();

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.kycStatus = "REJECTED";
  await user.save();

  await AuditLog.create({
    adminId,
    action: "REJECT_KYC",
    resource: "User",
    resourceId: user._id.toString(),
  });

  revalidatePath("/admin/kyc");
  revalidatePath("/admin/users");
  revalidatePath("/", "layout"); // Force layout re-fetch for KycGuard
  return { success: true };
}

export async function toggleUserSuspension(targetUserId: string, suspend: boolean) {
  await requirePermission("VIEW_USERS"); // Or MANAGE_USERS if it existed
  const adminId = await getAdminId();
  await connectToDatabase();

  const user = await User.findById(targetUserId);
  if (!user) throw new Error("User not found");
  
  if (user.role === "SUPER_ADMIN") throw new Error("Cannot suspend SUPER_ADMIN");

  user.status = suspend ? "SUSPENDED" : "ACTIVE";
  await user.save();

  await AuditLog.create({
    adminId,
    action: suspend ? "SUSPEND_USER" : "UNSUSPEND_USER",
    resource: "User",
    resourceId: user._id.toString(),
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function adjustUserBalance(targetUserId: string, currency: string, amount: number, reason: string) {
  await requirePermission("MANAGE_FINANCES");
  const adminId = await getAdminId();
  await connectToDatabase();

  if (amount === 0) throw new Error("Amount cannot be zero");

  // To preserve double-entry accounting, use a TREASURY system account
  const systemAccount = await LedgerService.getSystemAccount("TREASURY", currency);
  const userAccount = await LedgerService.getUserAccount(targetUserId, currency);

  let ledgerEntryId;
  if (amount > 0) {
    ledgerEntryId = await LedgerService.executeTransfer({
      debitAccountId: systemAccount._id.toString(),
      creditAccountId: userAccount._id.toString(),
      amount: Math.abs(amount),
      currency: currency,
      transactionType: "BONUS", // Using BONUS or custom string
      referenceId: adminId, // using adminId as reference
      userIdToUpdate: targetUserId,
    });
  } else {
    // Debit user, Credit Admin Adjustment
    ledgerEntryId = await LedgerService.executeTransfer({
      debitAccountId: userAccount._id.toString(),
      creditAccountId: systemAccount._id.toString(),
      amount: Math.abs(amount),
      currency: currency,
      transactionType: "TRANSFER", // Using TRANSFER for admin deduction
      referenceId: adminId,
      userIdToUpdate: targetUserId,
    });
  }

  await AuditLog.create({
    adminId,
    action: "ADJUST_BALANCE",
    resource: "Wallet",
    resourceId: userAccount._id.toString(),
    details: { amount, currency, reason, ledgerEntryId }
  });

  // Send notification to user
  const actionText = amount > 0 ? "credited to" : "debited from";
  await NotificationService.notifyUser({
    userId: targetUserId,
    category: "FINANCIAL",
    title: "Account Balance Updated",
    message: `${Math.abs(amount)} ${currency} has been ${actionText} your wallet. Reason: ${reason}`,
  });

  revalidatePath("/admin/users");
  return { success: true };
}

// RISK
export async function getRiskConfig() {
  await requirePermission("MANAGE_RISK");
  await connectToDatabase();
  let config = await RiskConfig.findOne();
  if (!config) config = await RiskConfig.create({});
  return JSON.parse(JSON.stringify(config));
}

export async function updateRiskConfig(data: any) {
  await requirePermission("MANAGE_RISK");
  const adminId = await getAdminId();
  await connectToDatabase();

  let config = await RiskConfig.findOne();
  if (!config) config = await RiskConfig.create(data);
  else {
    Object.assign(config, data);
    config.updatedBy = adminId as any;
    await config.save();
  }

  await AuditLog.create({
    adminId,
    action: "UPDATE_RISK_CONFIG",
    resource: "RiskConfig",
    resourceId: config._id.toString(),
    details: data
  });

  revalidatePath("/admin/risk");
  return { success: true };
}

// --------------------------------------------------------------------------------
// Deposit Method Settings (Platform Config)
// --------------------------------------------------------------------------------

export async function getDepositMethods() {
  await requirePermission("MANAGE_FINANCES");
  await connectToDatabase();
  const methods = await DepositMethod.find({}).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(methods));
}

export async function addDepositMethod(data: { currency: string; network: string; address: string; isActive: boolean }) {
  await requirePermission("MANAGE_FINANCES");
  const adminId = await getAdminId();
  await connectToDatabase();

  await DepositMethod.create(data);
  
  await AuditLog.create({
    adminId,
    action: "ADD_DEPOSIT_METHOD",
    resource: "DepositMethod",
    resourceId: "system",
    details: { currency: data.currency }
  });

  revalidatePath("/admin/finances");
  revalidatePath("/wallet");
  return { success: true };
}

export async function updateDepositMethod(id: string, data: { currency?: string; network?: string; address?: string; isActive?: boolean }) {
  await requirePermission("MANAGE_FINANCES");
  const adminId = await getAdminId();
  await connectToDatabase();

  await DepositMethod.findByIdAndUpdate(id, { $set: data });

  await AuditLog.create({
    adminId,
    action: "UPDATE_DEPOSIT_METHOD",
    resource: "DepositMethod",
    resourceId: id,
    details: { updatedKeys: Object.keys(data) }
  });

  revalidatePath("/admin/finances");
  revalidatePath("/wallet");
  return { success: true };
}

export async function deleteDepositMethod(id: string) {
  await requirePermission("MANAGE_FINANCES");
  const adminId = await getAdminId();
  await connectToDatabase();

  await DepositMethod.findByIdAndDelete(id);

  await AuditLog.create({
    adminId,
    action: "DELETE_DEPOSIT_METHOD",
    resource: "DepositMethod",
    resourceId: id,
  });

  revalidatePath("/admin/finances");
  revalidatePath("/wallet");
  return { success: true };
}

// AUDIT
export async function getAuditLogs() {
  await requirePermission("VIEW_AUDIT");
  await connectToDatabase();
  const logs = await AuditLog.find().populate("adminId", "name email role").sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(logs));
}

// QUEUE / JOBS
import { QueueService } from "@/features/jobs/QueueService";
import { Job } from "@/models/Job";

export async function getQueueMetrics() {
  await requirePermission("VIEW_DASHBOARD");
  const metrics = await QueueService.getMetrics();
  return JSON.parse(JSON.stringify(metrics));
}

export async function getJobs() {
  await requirePermission("VIEW_DASHBOARD");
  await connectToDatabase();
  const jobs = await Job.find().sort({ createdAt: -1 }).limit(100);
  return JSON.parse(JSON.stringify(jobs));
}

// ALERTS
import { PlatformAlert } from "@/models/PlatformAlert";

export async function getPlatformAlerts() {
  await requirePermission("VIEW_DASHBOARD");
  await connectToDatabase();
  const alerts = await PlatformAlert.find().sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(alerts));
}

export async function resolvePlatformAlert(alertId: string) {
  await requirePermission("VIEW_DASHBOARD"); // Assuming OPERATIONS/ADMIN can resolve
  const adminId = await getAdminId();
  await connectToDatabase();
  
  const alert = await PlatformAlert.findById(alertId);
  if (!alert) throw new Error("Alert not found");

  alert.status = "RESOLVED";
  alert.resolved = true;
  alert.resolvedBy = adminId as any;
  alert.resolvedAt = new Date();
  await alert.save();

  await AuditLog.create({
    adminId,
    action: "RESOLVE_ALERT",
    resource: "PlatformAlert",
    resourceId: alert._id.toString()
  });

  revalidatePath("/admin/alerts");
  revalidatePath("/admin");
  return { success: true };
}

export async function generateWithdrawalAmlCode(userId: string) {
  await requirePermission("MANAGE_FINANCES");
  const adminId = await getAdminId();
  await connectToDatabase();

  const user = await User.findById(userId).select("email withdrawalAmlCode");
  if (!user) throw new Error("User not found");

  const amlCode = generateVatCode(); // Using same generation method for AML
  
  await User.findByIdAndUpdate(userId, {
    withdrawalAmlCode: amlCode,
    withdrawalAmlCodeIssuedAt: new Date(),
  });

  await AuditLog.create({
    adminId,
    action: "GENERATE_WITHDRAWAL_AML_CODE",
    resource: "User",
    resourceId: userId,
    details: { amlCode }
  });

  return { success: true, code: amlCode, email: user.email };
}
