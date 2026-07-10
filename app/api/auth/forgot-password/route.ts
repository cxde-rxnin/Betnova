import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/connect";
import { User } from "@/models/User";
import { NotificationService } from "@/features/notifications/NotificationService";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't leak whether user exists for security reasons
      return NextResponse.json({ success: true, message: "If that email exists, a code was sent." });
    }

    // Generate 6-digit numeric code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.resetCode = resetCode;
    user.resetCodeExpires = resetCodeExpires;
    await user.save();

    // Send email via NotificationService
    await NotificationService.notifyUser({
      userId: user._id.toString(),
      category: "ACCOUNT",
      title: "Your Password Reset Code",
      message: `Your password reset code is ${resetCode}. It will expire in 15 minutes.`,
    });

    return NextResponse.json({ success: true, message: "Code sent" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
