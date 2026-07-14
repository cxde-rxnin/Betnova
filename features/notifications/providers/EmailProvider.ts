import { NotificationProvider, SendNotificationParams } from "./NotificationProvider";
import nodemailer from "nodemailer";
import { User } from "@/models/User";
import { logger } from "@/lib/logger";

export class EmailProvider implements NotificationProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || "user@example.com",
        pass: process.env.SMTP_PASS || "password",
      },
    });
  }

  async send(params: SendNotificationParams): Promise<void> {
    try {
      // Find the user's email address
      const user = await User.findById(params.userId);
      if (!user || !user.email) {
        logger.warn(`[EmailProvider] Cannot send email, user ${params.userId} not found or has no email.`);
        return;
      }

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"Betnovo Notifications" <noreply@betnovo.com>',
        to: user.email,
        subject: params.title,
        text: params.message,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>${params.title}</h2>
            <p>${params.message}</p>
            <p style="color: #666; margin-top: 20px; font-size: 14px;">Log in to your Betnovo account to view more details.</p>
            <p style="color: #888; font-size: 12px; margin-top: 30px;">This is an automated notification from Betnovo.</p>
          </div>
        `,
      });

      logger.info(`[EmailProvider] Sent email to ${user.email} (User: ${params.userId})`);
    } catch (error) {
      logger.error(`[EmailProvider] Failed to send email to user ${params.userId}: ${error}`);
    }
  }
}
