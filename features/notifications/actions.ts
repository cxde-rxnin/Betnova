"use server";

import { auth } from "@/lib/auth";
import { Notification } from "@/models/Notification";
import connectToDatabase from "@/lib/db/connect";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getUserNotifications() {
  const userId = await getUserId();
  await connectToDatabase();
  
  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
  return JSON.parse(JSON.stringify(notifications));
}

export async function markNotificationRead(notificationId: string) {
  const userId = await getUserId();
  await connectToDatabase();
  
  const updated = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { read: true } },
    { new: true }
  ).lean();
  
  return JSON.parse(JSON.stringify(updated));
}

export async function markAllNotificationsRead() {
  const userId = await getUserId();
  await connectToDatabase();
  
  await Notification.updateMany(
    { userId, read: false },
    { $set: { read: true } }
  );
  
  return { success: true };
}
