import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db/connect";
import { Favorite } from "@/models/Favorite";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    await connectToDatabase();
    
    const query: any = { userId: session.user.id };
    if (type) query.entityType = type;

    const favorites = await Favorite.find(query);
    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { entityId, entityType } = await req.json();

    if (!entityId || !entityType) {
      return NextResponse.json({ error: "entityId and entityType are required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const existing = await Favorite.findOne({ userId: session.user.id, entityId, entityType });
    
    if (existing) {
      // Toggle off
      await existing.deleteOne();
      return NextResponse.json({ status: "removed" });
    } else {
      // Toggle on
      await Favorite.create({ userId: session.user.id, entityId, entityType });
      return NextResponse.json({ status: "added" });
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
