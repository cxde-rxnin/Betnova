import { getWorldCupLive, getWorldCupUpcoming, getWorldCupPast } from "@/features/sportsbook/actions";
import { LiveMarketCard } from "@/components/marketing/live-market-card";
import { Match } from "@/features/sportsbook/types";
import { SportEvent } from "@/lib/mock-data";
import Image from "next/image";

export async function WorldCupSection() {
  const [live, upcoming, past] = await Promise.all([
    getWorldCupLive().catch(() => []),
    getWorldCupUpcoming().catch(() => []),
    getWorldCupPast().catch(() => [])
  ]);

  // If there are absolutely no World Cup events (which shouldn't happen during the tournament), hide section
  if (live.length === 0 && upcoming.length === 0 && past.length === 0) {
    return null;
  }

  function mapMatchToSportEvent(match: Match): SportEvent {
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
      odds: { home: 1.85, draw: 3.20, away: 2.10 }, // Fallback odds
      isFavorite: false,
    };
  }

  const liveEvents = live.map(mapMatchToSportEvent);
  const upcomingEvents = upcoming.map(mapMatchToSportEvent);
  const pastEvents = past.map(mapMatchToSportEvent).slice(0, 10); // Last 10 matches

  return (
    <section className="space-y-6 w-full my-8">
      {/* Official 2026 World Cup Banner */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl border border-primary/20">
        <Image 
          src="https://www.thesportsdb.com/images/media/league/banner/2kgoav1783977158.jpg"
          alt="FIFA World Cup 2026"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-6 left-6 flex items-center gap-4">
          <div className="relative w-16 h-16 sm:w-24 sm:h-24">
            <Image
              src="https://r2.thesportsdb.com/images/media/league/badge/e7er5g1696521789.png"
              alt="World Cup Logo"
              fill
              className="object-contain drop-shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
              FIFA World Cup 2026™
            </h2>
            <p className="text-white/90 font-medium hidden sm:block drop-shadow-md">
              Follow the action live from North America
            </p>
          </div>
        </div>
      </div>

      {/* Live Matches */}
      {liveEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-bold flex items-center gap-2 text-destructive">
            <span className="relative flex h-3 w-3 mr-1">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
            </span>
            Live Now
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {liveEvents.map(event => <LiveMarketCard key={event.id} event={event} />)}
          </div>
        </div>
      )}

      {/* Upcoming Matches */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-primary">Upcoming Matches</h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {upcomingEvents.map(event => <LiveMarketCard key={event.id} event={event} />)}
          </div>
        </div>
      )}

      {/* Past Results */}
      {pastEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-muted-foreground">Past Results</h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 opacity-80 hover:opacity-100 transition-opacity">
            {pastEvents.map(event => <LiveMarketCard key={event.id} event={event} />)}
          </div>
        </div>
      )}
    </section>
  );
}
