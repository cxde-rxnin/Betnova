import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db/connect";
import { User } from "@/models/User";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, username, avatar, language, timeZone, preferredCurrency } = await req.json();

    await connectToDatabase();
    
    // Check if username is being changed and if it already exists
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: session.user.id } });
      if (existingUser) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { 
        $set: {
          ...(name !== undefined && { name }),
          ...(username !== undefined && { username }),
          ...(avatar !== undefined && { avatar }),
          ...(language !== undefined && { language }),
          ...(timeZone !== undefined && { timeZone }),
          ...(preferredCurrency !== undefined && { preferredCurrency }),
        }
      },
      { new: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
