import { NotificationProvider, SendNotificationParams } from "./NotificationProvider";


export class PushProvider implements NotificationProvider {
  async send(params: SendNotificationParams): Promise<void> {
    // Scaffolded for Future (FCM, APNS)
    console.log(`[PushProvider] Sending ${params.category} push to ${params.userId}: ${params.title}`);
  }
}

export class SMSProvider implements NotificationProvider {
  async send(params: SendNotificationParams): Promise<void> {
    // Scaffolded for Future (Twilio)
    console.log(`[SMSProvider] Sending ${params.category} SMS to ${params.userId}: ${params.title}`);
  }
}
