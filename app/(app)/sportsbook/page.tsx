import { getSports, getLiveMatches, getUpcomingMatches } from "@/features/sportsbook/actions";
import { LiveMarketCard } from "@/components/marketing/live-market-card";
import type { Match } from "@/features/sportsbook/types";
import type { SportEvent } from "@/lib/mock-data";
import type { Metadata } from "next";
import Link from "next/link";
import { Flame, CalendarDays, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { WorldCupSection } from "@/features/sportsbook/components/WorldCupSection";

export const metadata: Metadata = {
  title: "Sportsbook | Betnova",
  description: "Live betting and sports markets.",
};

export const revalidate = 60;

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

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

export default async function DashboardSportsbookPage(props: Props) {
  const searchParams = await props.searchParams;
  const sports = await getSports().catch(() => []);
  
  const tabParam = typeof searchParams?.tab === "string" ? searchParams.tab : "";
  const activeSportId = tabParam || (sports[0]?.id ?? "football");

  const [liveMatches, upcomingMatches] = await Promise.all([
    getLiveMatches(activeSportId).catch(() => []),
    getUpcomingMatches(activeSportId).catch(() => [])
  ]);

  const liveEvents = liveMatches.map(mapMatchToSportEvent);
  const upcomingEvents = upcomingMatches.map(mapMatchToSportEvent);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Sportsbook Hub" description="Browse live and upcoming matches by sport." />

      <WorldCupSection />

      {/* Tabs */}
      <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex w-max space-x-2">
          {sports.map((sport) => {
            const isActive = sport.id === activeSportId;
            return (
              <Link
                key={sport.id}
                href={`/sportsbook?tab=${sport.id}`}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <span>{sport.icon}</span>
                {sport.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-12">
        {/* Live Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Live Events
            </h2>
            <Link href="/sports/live" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center">
              More Live &gt;
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {liveEvents.length > 0 ? (
              liveEvents.map((event) => (
                <LiveMarketCard key={event.id} event={event} basePath="/sports/match" />
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center bg-card/50">
                <Flame className="mx-auto h-8 w-8 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No live matches</h3>
                <p className="text-muted-foreground">There are currently no active live matches for this sport.</p>
              </div>
            )}
          </div>
        </section>

        {/* Upcoming Section */}
        <section>
          <div className="mb-6 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Upcoming Matches</h2>
            <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {upcomingEvents.length}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <LiveMarketCard key={event.id} event={event} basePath="/sports/match" />
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-border p-12 text-center bg-card/50">
                <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming matches</h3>
                <p className="text-muted-foreground">There are no upcoming scheduled matches for this sport today.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
