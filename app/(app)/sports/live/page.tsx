import { PageHeader } from "@/components/shared/page-header";
import { OddsButton } from "@/components/shared/odds-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Radio } from "lucide-react";
import Link from "next/link";
import { getLiveMatches } from "@/features/sportsbook/actions";

export default async function LiveEventsPage() {
  const liveEvents = await getLiveMatches().catch(() => []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Live Events" description={`${liveEvents.length} events in play right now.`} />
      {liveEvents.length === 0 ? (
        <EmptyState icon={Radio} title="No live events" description="Check back soon — live events will appear here." />
      ) : (
        <div className="space-y-3">
          {liveEvents.map((event) => {
            const eventName = `${event.homeTeam?.name} vs ${event.awayTeam?.name}`;
            return (
              <div key={event.id} className="rounded-xl border bg-card p-4 transition-all hover:shadow-sm hover:border-primary/20 sm:p-5">
                <div className="flex items-center justify-between gap-3">
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
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge variant="secondary" className="bg-destructive/10 text-[10px] text-destructive">
                        <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />LIVE
                      </Badge>
                      {event.liveStatus?.minute && <span className="text-xs text-muted-foreground">{event.liveStatus.minute}&apos;</span>}
                    </div>
                  </Link>
                  <p className="shrink-0 text-2xl font-bold tabular-nums">{event.score?.home ?? 0} - {event.score?.away ?? 0}</p>
                </div>
                <div className="mt-3 flex gap-1.5">
                  <OddsButton eventId={event.id} eventName={eventName} market="Match Result" label={event.homeTeam?.name} homeLogo={event.homeTeam?.logo} awayLogo={event.awayTeam?.logo} odds={2.10} className="flex-1" />
                  <OddsButton eventId={event.id} eventName={eventName} market="Match Result" label={event.awayTeam?.name} homeLogo={event.homeTeam?.logo} awayLogo={event.awayTeam?.logo} odds={3.50} className="flex-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
