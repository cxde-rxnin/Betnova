import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
    }

    // Placeholder: Verify token against DB, update user.emailVerified = true
    console.log(`Verifying email for token: ${token}`);

    return NextResponse.json({ message: "Email has been successfully verified." });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
