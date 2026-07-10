import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db/connect";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new passwords are required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const user = await User.findById(session.user.id);
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "User not found or invalid account type" }, { status: 404 });
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordsMatch) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
