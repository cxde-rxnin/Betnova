"use server";

import * as Ably from "ably";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db/connect";
import { SupportMessage } from "@/models/SupportMessage";

let _client: Ably.Rest | null = null;
function getAblyClient() {
  if (!_client) {
    _client = new Ably.Rest({ key: process.env.ABLY_API_KEY as string });
  }
  return _client;
}

export async function sendSupportMessage(text: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectToDatabase();
  await SupportMessage.create({
    userId: session.user.id,
    text,
    sender: "USER",
  });

  const client = getAblyClient();
  const channel = client.channels.get(`support:${session.user.id}`);
  await channel.publish("message", {
    text,
    sender: "USER",
  });
  return { success: true };
}

export async function getSupportHistory() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectToDatabase();
  
  const messages = await SupportMessage.find({ userId: session.user.id })
    .sort({ createdAt: 1 })
    .limit(100)
    .lean();

  return messages.map((msg: any) => ({
    id: msg._id.toString(),
    clientId: msg.sender === "USER" ? session.user.id : "admin",
    data: {
      text: msg.text,
      sender: msg.sender,
    },
    timestamp: msg.createdAt.getTime(),
  }));
}

export async function sendSupportMessageAsAdmin(userId: string, text: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectToDatabase();
  await SupportMessage.create({
    userId,
    text,
    sender: "ADMIN",
  });

  const client = getAblyClient();
  const channel = client.channels.get(`support:${userId}`);
  await channel.publish("message", {
    text,
    sender: "ADMIN",
  });
  return { success: true };
}

export async function getSupportHistoryForAdmin(userId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectToDatabase();

  const messages = await SupportMessage.find({ userId })
    .sort({ createdAt: 1 })
    .limit(100)
    .lean();

  return messages.map((msg: any) => ({
    id: msg._id.toString(),
    clientId: msg.sender === "USER" ? userId : "admin",
    data: {
      text: msg.text,
      sender: msg.sender,
    },
    timestamp: msg.createdAt.getTime(),
  }));
}

export async function getUnreadSupportCount() {
  const session = await auth();
  if (!session?.user?.id) return 0; // Return 0 if not authenticated

  await connectToDatabase();
  const count = await SupportMessage.countDocuments({
    userId: session.user.id,
    sender: "ADMIN",
    isRead: false,
  });

  return count;
}

export async function markSupportMessagesAsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectToDatabase();
  await SupportMessage.updateMany(
    { userId: session.user.id, sender: "ADMIN", isRead: false },
    { $set: { isRead: true } }
  );
  
  return { success: true };
}
