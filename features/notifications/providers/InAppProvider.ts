import { NotificationProvider, SendNotificationParams } from "./NotificationProvider";
import { Notification } from "@/models/Notification";
import connectToDatabase from "@/lib/db/connect";
import mongoose from "mongoose";

export class InAppProvider implements NotificationProvider {
  async send(params: SendNotificationParams): Promise<void> {
    await connectToDatabase();
    await Notification.create({
      userId: new mongoose.Types.ObjectId(params.userId),
      category: params.category,
      title: params.title,
      message: params.message,
      metadata: params.metadata,
    });
  }
}
