import mongoose from "mongoose";

export interface SendNotificationParams {
  userId: string;
  category: "FINANCIAL" | "BETTING" | "ACCOUNT" | "OPERATIONAL";
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface NotificationProvider {
  /**
   * Send a notification to the user through this channel
   */
  send(params: SendNotificationParams): Promise<void>;
}
