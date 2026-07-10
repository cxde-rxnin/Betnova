import { NotificationProvider } from "@/features/notifications/providers/NotificationProvider";
import { InAppProvider } from "@/features/notifications/providers/InAppProvider";
import { PushProvider, SMSProvider } from "@/features/notifications/providers/Placeholders";
import { EmailProvider } from "@/features/notifications/providers/EmailProvider";

let activeProviders: NotificationProvider[] = [];

export function getNotificationProviders(): NotificationProvider[] {
  if (activeProviders.length > 0) return activeProviders;

  // Always enable In-App for now
  activeProviders.push(new InAppProvider());

  // Optionally enable Email if configured
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS === "true") {
    activeProviders.push(new EmailProvider());
  }
  
  if (process.env.ENABLE_PUSH_NOTIFICATIONS === "true") {
    activeProviders.push(new PushProvider());
  }

  return activeProviders;
}
