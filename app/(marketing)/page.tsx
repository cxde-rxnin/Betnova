import Link from "next/link";
import {
  Goal,
  CircleDot,
  Target,
  Trophy,
  CircleDashed,
  Medal,
  Swords,
  Gamepad2,
  ChevronRight,
  Flame,
  Clock,
  Activity,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LiveTicker } from "@/components/marketing/live-ticker";
import { HeroCarousel } from "@/components/marketing/hero-carousel";
import { LiveMarketCard } from "@/components/marketing/live-market-card";
import { WorldCupSection } from "@/features/sportsbook/components/WorldCupSection";
import { SPORTS, EVENTS, type SportEvent } from "@/lib/mock-data";
import { type Match } from "@/features/sportsbook/types";

const sportIcons: Record<string, typeof Goal> = {
  football: Goal,
  basketball: CircleDot,
  tennis: Target,
  cricket: Trophy,
  baseball: CircleDashed,
  hockey: Medal,
  mma: Swords,
  esports: Gamepad2,
};

const sportImages: Record<string, string> = {
  football: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=400&auto=format&fit=crop",
  basketball: "https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=400&auto=format&fit=crop",
  tennis: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=400&auto=format&fit=crop",
  cricket: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=400&auto=format&fit=crop",
  baseball: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=400&auto=format&fit=crop",
  hockey: "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?q=80&w=400&auto=format&fit=crop",
  mma: "https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=400&auto=format&fit=crop",
  esports: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop",
};

import { getLiveMatches, getUpcomingMatches } from "@/features/sportsbook/actions";

export const revalidate = 60;

export default async function LandingPage() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Fetch real API data in parallel
  const [liveMatches, upcomingMatchesToday, upcomingMatchesTomorrow] = await Promise.all([
    getLiveMatches().catch(() => []),
    getUpcomingMatches().catch(() => []),
    getUpcomingMatches(undefined, tomorrowStr).catch(() => [])
  ]);

  const allUpcoming = [...upcomingMatchesToday, ...upcomingMatchesTomorrow];

  // Use up to 18 events for the preview
  const liveEvents = liveMatches.slice(0, 18);
  const upcomingEvents = allUpcoming.slice(0, 18);

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
      period: match.liveStatus?.period,
      odds: { home: homeOdd, draw: drawOdd, away: awayOdd },
      isFavorite: false,
    };
  }

  const displayLiveEvents = liveEvents.map(mapMatchToSportEvent);
  const displayUpcomingEvents = upcomingEvents.map(mapMatchToSportEvent);

  return (
    <>
      <LiveTicker events={displayLiveEvents} />

      {/* Full-width Hero Carousel */}
      <HeroCarousel />

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        
        {/* World Cup 2026 Special Section */}
        <WorldCupSection />

        {/* Sports Categories Bento Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Top Sports
            </h2>
            <Link href="/sports" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="flex flex-col gap-3">
            {/* Top Row - 50% each */}
            <div className="grid grid-cols-2 gap-3">
              {SPORTS.slice(0, 2).map((sport) => (
                <Link
                  key={sport.id}
                  href={`/sports/${sport.id}`}
                  className="group relative h-56 overflow-hidden bg-card transition-all hover:shadow-lg hover:shadow-primary/10"
                >
                  <Image
                    src={sportImages[sport.id] || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800&auto=format&fit=crop"}
                    alt={sport.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 50vw"
                    className="object-cover opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <span className="text-2xl font-bold text-white">{sport.name}</span>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Bottom Row - Remaining items in a single row */}
            <div className="grid grid-cols-6 gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {SPORTS.slice(2, 8).map((sport) => (
                <Link
                  key={sport.id}
                  href={`/sports/${sport.id}`}
                  className="group relative h-36 min-w-[120px] overflow-hidden bg-card transition-all hover:shadow-md hover:shadow-primary/10"
                >
                  <Image
                    src={sportImages[sport.id] || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800&auto=format&fit=crop"}
                    alt={sport.name}
                    fill
                    sizes="(max-width: 768px) 33vw, 16vw"
                    className="object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <span className="text-sm font-semibold text-white">{sport.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Live Matches Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Live Events
            </h2>
            <Link href="/sports?tab=live" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center">
              More Live <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {displayLiveEvents.length > 0 ? (
              displayLiveEvents.map((event) => (
                <LiveMarketCard key={event.id} event={event} />
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="text-muted-foreground">No live events at the moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Upcoming Matches Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Upcoming Matches
            </h2>
            <Link href="/sports" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center">
              All Upcoming <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {displayUpcomingEvents.length > 0 ? (
              displayUpcomingEvents.map((event) => (
                <LiveMarketCard key={event.id} event={event} />
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="text-muted-foreground">No upcoming matches in the next 48 hours.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </>
  );
}
