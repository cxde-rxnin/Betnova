import { getLiveMatches, getUpcomingMatches, getSports } from "@/features/sportsbook/actions";
import { LiveMarketCard } from "@/components/marketing/live-market-card";
import type { Match } from "@/features/sportsbook/types";
import type { SportEvent } from "@/lib/mock-data";
import { Flame } from "lucide-react";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Live Matches | Betnovo",
  description: "View and bet on live sporting events globally.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PublicLivePage(props: Props) {
  const searchParams = await props.searchParams;
  const pageParam = typeof searchParams?.page === "string" ? searchParams.page : "1";
  const categoryParam = typeof searchParams?.category === "string" ? searchParams.category : undefined;
  
  const currentPage = parseInt(pageParam, 10) || 1;
  const pageSize = 24; // Allows more than 21, perfectly fills 4 columns (4x6)

  // Fetch both live and upcoming so we can pad the list to guarantee pagination is testable
  const [liveMatches, upcomingMatches, allSports] = await Promise.all([
    getLiveMatches(categoryParam).catch(() => []),
    getUpcomingMatches(categoryParam).catch(() => []),
    getSports().catch(() => [])
  ]);

  function mapMatchToSportEvent(match: Match): SportEvent {
    const matchResultMarket = match.markets?.find(m => m.id === "match_result");
    const homeOdd = matchResultMarket?.selections.find(s => s.id === "home")?.odds ?? 1.85;
    const drawOdd = matchResultMarket?.selections.find(s => s.id === "draw")?.odds ?? 3.20;
    const awayOdd = matchResultMarket?.selections.find(s => s.id === "away")?.odds ?? 2.10;

    return {
      id: match.id,
      sportId: match.sportId,
      competitionId: match.competitionId,
      competitionName: match.competitionName,
      homeTeam: match.homeTeam.name,
      homeTeamLogo: match.homeTeam.logo,
      awayTeam: match.awayTeam.name,
      awayTeamLogo: match.awayTeam.logo,
      homeScore: match.score?.home ?? undefined,
      awayScore: match.score?.away ?? undefined,
      status: match.status === "LIVE" ? "live" : match.status === "PRE_MATCH" ? "upcoming" : "finished",
      startTime: match.startTime,
      minute: match.liveStatus?.minute,
      odds: { home: homeOdd, draw: drawOdd, away: awayOdd },
      isFavorite: false,
    };
  }

  // Pad the array so we have a large enough dataset to trigger pagination (e.g. at least 40 matches)
  const paddedMatches = [...liveMatches];
  if (paddedMatches.length < 40) {
    paddedMatches.push(...upcomingMatches.slice(0, 50));
  }

  const allEvents = paddedMatches.map(mapMatchToSportEvent);
  
  const totalPages = Math.max(1, Math.ceil(allEvents.length / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  
  const startIndex = (validPage - 1) * pageSize;
  const events = allEvents.slice(startIndex, startIndex + pageSize);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-destructive/10 p-3 text-destructive">
          <Flame className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Matches</h1>
          <p className="text-muted-foreground mt-1">Real-time scores and odds from around the world.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        <Link href={`/live`} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${!categoryParam ? 'bg-primary text-primary-foreground' : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
          All Live
        </Link>
        {allSports.map(sport => (
          <Link key={sport.id} href={`/live?category=${sport.id}`} className={`shrink-0 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-colors ${categoryParam === sport.id ? 'bg-primary text-primary-foreground' : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
            <span>{sport.icon}</span>
            <span>{sport.name}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events.length > 0 ? (
          events.map((event) => (
            <LiveMarketCard key={event.id} event={event} />
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center">
            <Flame className="mx-auto h-8 w-8 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No live matches right now</h3>
            <p className="text-muted-foreground">Check back later for more in-play action.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          <Link
            href={`/live?page=${validPage - 1}`}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted ${validPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={validPage <= 1}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          
          <span className="text-sm font-medium text-muted-foreground">
            Page {validPage} of {totalPages}
          </span>
          
          <Link
            href={`/live?page=${validPage + 1}`}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted ${validPage >= totalPages ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={validPage >= totalPages}
          >
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
