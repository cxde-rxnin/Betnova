import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db/connect";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { name, username, email, password } = await req.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "An account with that email already exists" },
          { status: 400 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: "An account with that username already exists" },
          { status: 400 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      username,
      email,
      passwordHash,
      role: "USER",
    });

    return NextResponse.json(
      { message: "Account created successfully", user: { id: newUser._id, email: newUser.email } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong while creating the account" },
      { status: 500 }
    );
  }
}
