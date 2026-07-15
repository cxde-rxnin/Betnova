import nodemailer from "nodemailer";
import { logger } from "@/lib/logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER || "user@example.com",
    pass: process.env.SMTP_PASS || "password",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Betnovo" <support@betnovo.bet>',
      to,
      subject,
      text,
      html: html || `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 8px;">
          <div style="background-color: #000; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #00ff88; margin: 0; font-size: 24px;">Betnovo</h1>
          </div>
          <div style="background-color: #fff; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #eee; border-top: none;">
            <h2 style="color: #333; margin-top: 0;">${subject}</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">${text.replace(/\n/g, '<br>')}</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px; margin-bottom: 20px;" />
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">This is an automated message from Betnovo Support. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    });
    logger.info(`[Email] Sent email to ${to} for subject: ${subject}`);
  } catch (error) {
    logger.error(`[Email] Failed to send email to ${to}: ${error}`);
    throw new Error("Failed to send email");
  }
}
