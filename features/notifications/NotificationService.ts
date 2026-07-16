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
    
    // Dispatch concurrently to all configured external providers (including In-App)
    await Promise.allSettled(
      providers.map(provider => provider.send(params))
    );
  }
}
