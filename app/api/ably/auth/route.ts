import { NextRequest, NextResponse } from "next/server";
import * as Ably from "ably";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = new Ably.Rest({
      key: process.env.ABLY_API_KEY as string,
      queryTime: true
    });
    // Fetch the token directly on the server to bypass client-side request token issues
    const tokenData = await client.auth.requestToken({
      clientId: session.user.id,
    });
    
    return NextResponse.json(tokenData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
