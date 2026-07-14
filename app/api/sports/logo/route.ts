import { NextResponse } from "next/server";

const API_KEY = process.env.SPORTAPI7_KEY;
const API_URL = "https://sportapi7.p.rapidapi.com/api/v1";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  const name = searchParams.get("name") || "Team";
  const isHome = searchParams.get("isHome") === "true";

  if (!teamId || teamId === "0") {
    return generateFallback(name, isHome);
  }

  try {
    const response = await fetch(`${API_URL}/team/${teamId}/image`, {
      headers: {
        "x-rapidapi-key": API_KEY!,
        "x-rapidapi-host": "sportapi7.p.rapidapi.com"
      },
      next: { revalidate: 86400 } // Cache team images for 24 hours
    });

    if (!response.ok) {
      return generateFallback(name, isHome);
    }

    const buffer = await response.arrayBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400"
      }
    });
  } catch (error) {
    return generateFallback(name, isHome);
  }
}

function generateFallback(name: string, isHome: boolean) {
  const bgColor = isHome ? "2563eb" : "1e293b";
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=fff&rounded=true&bold=true`;
  return NextResponse.redirect(fallbackUrl);
}
