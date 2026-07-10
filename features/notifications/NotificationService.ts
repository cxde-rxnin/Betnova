import { getNotificationProviders } from "@/lib/providers/notifications";
import { SendNotificationParams } from "./providers/NotificationProvider";

import { Notification } from "@/models/Notification";
import connectToDatabase from "@/lib/db/connect";

export class NotificationService {
  /**
   * Dispatch a notification to all active channels for the user
   */
  static async notifyUser(params: SendNotificationParams): Promise<void> {
    const providers = getNotificationProviders();
    
    // 1. Save to in-app database
    try {
      await connectToDatabase();
      
      // Attempt to infer category if not provided in params
      let category = "OPERATIONAL";
      if (params.title.toLowerCase().includes("deposit") || params.title.toLowerCase().includes("withdraw")) category = "FINANCIAL";
      if (params.title.toLowerCase().includes("bet") || params.title.toLowerCase().includes("settle")) category = "BETTING";

      await Notification.create({
        userId: params.userId,
        category: params.category,
        title: params.title,
        message: params.message,
        read: false,
      });
    } catch (e) {
      console.error("Failed to save in-app notification:", e);
    }

    // 2. Dispatch concurrently to all configured external providers
    await Promise.allSettled(
      providers.map(provider => provider.send(params))
    );
  }
}
