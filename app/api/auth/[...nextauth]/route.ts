import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  console.log("NextAuth GET hit:", req.nextUrl.pathname);
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  return handlers.POST(req);
}
