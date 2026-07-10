import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/connect";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();
    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.resetCode !== code) {
      return NextResponse.json({ error: "Invalid reset code" }, { status: 400 });
    }

    if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
      return NextResponse.json({ error: "Reset code has expired" }, { status: 400 });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user
    user.passwordHash = passwordHash;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "Password reset successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
