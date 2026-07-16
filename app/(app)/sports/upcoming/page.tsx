import { PageHeader } from "@/components/shared/page-header";
import { OddsButton } from "@/components/shared/odds-button";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { getUpcomingMatches } from "@/features/sportsbook/actions";

export default async function UpcomingEventsPage() {
  const upcoming = await getUpcomingMatches().catch(() => []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Upcoming Events" description={`${upcoming.length} events scheduled.`} />
      {upcoming.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No upcoming events" description="New fixtures will appear here as they're scheduled." />
      ) : (
        <div className="space-y-3">
          {upcoming.map((event) => {
            const eventName = `${event.homeTeam?.name} vs ${event.awayTeam?.name}`;
            
            // Get odds from Match Result market
            const matchResultMarket = event.markets?.find(m => m.name === "Match Result");
            const homeOdds = matchResultMarket?.selections.find(s => s.label === event.homeTeam?.name)?.odds || 2.10;
            const awayOdds = matchResultMarket?.selections.find(s => s.label === event.awayTeam?.name)?.odds || 3.50;
            
            return (
              <div key={event.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all hover:shadow-sm hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <Link href={`/sports/match/${event.id}`} className="min-w-0 flex-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <p className="truncate text-xs text-muted-foreground">{event.competitionName}</p>
                  
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex -space-x-1.5 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={event.homeTeam?.logo} alt="Home" className="relative z-10 h-5 w-5 rounded-full border border-background bg-muted object-cover" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={event.awayTeam?.logo} alt="Away" className="relative z-0 h-5 w-5 rounded-full border border-background bg-muted object-cover" />
                    </div>
                    <p className="truncate font-semibold">{eventName}</p>
                  </div>
                  
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(event.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </Link>
                <div className="flex shrink-0 gap-1.5">
                  <OddsButton size="sm" eventId={event.id} eventName={eventName} market="Match Result" label={event.homeTeam?.name} homeLogo={event.homeTeam?.logo} awayLogo={event.awayTeam?.logo} odds={homeOdds} />
                  <OddsButton size="sm" eventId={event.id} eventName={eventName} market="Match Result" label={event.awayTeam?.name} homeLogo={event.homeTeam?.logo} awayLogo={event.awayTeam?.logo} odds={awayOdds} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
