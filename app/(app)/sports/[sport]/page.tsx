"use client";

import { PageHeader } from "@/components/shared/page-header";
import { OddsButton } from "@/components/shared/odds-button";
import { useSports, useCompetitions, useUpcomingMatches, useLiveMatches } from "@/features/sportsbook/hooks";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export default function SportCompetitionsPage() {
  const params = useParams();
  const sportId = params.sport as string;

  const { data: sports, isLoading: sportsLoading } = useSports();
  const { data: competitions, isLoading: compsLoading } = useCompetitions(sportId);
  const { data: upcomingMatches, isLoading: upcomingLoading } = useUpcomingMatches(sportId);
  const { data: liveMatches, isLoading: liveLoading } = useLiveMatches(sportId);

  const sport = sports?.find((s) => s.id === sportId);
  
  const allMatches = useMemo(() => {
    if (!upcomingMatches && !liveMatches) return [];
    return [...(liveMatches || []), ...(upcomingMatches || [])];
  }, [upcomingMatches, liveMatches]);

  if (!sportsLoading && !sport) return notFound();

  const isLoading = sportsLoading || compsLoading || upcomingLoading || liveLoading;

  if (isLoading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title={`${sport?.icon || ""} ${sport?.name || ""}`} description={`${allMatches.length} matches across ${competitions?.length || 0} competitions.`} />

      {(competitions && competitions.length > 0) && (
        <div className="space-y-3">
          {competitions.map((comp) => {
            const events = allMatches.filter((e) => e.competitionId === comp.id);
            if (events.length === 0) return null;
            return (
              <div key={comp.id} className="rounded-xl border bg-card">
                <div className="border-b px-4 py-3 sm:px-5 flex items-center gap-3">
                  {comp.logo && <img src={comp.logo} alt={comp.name} className="h-6 w-6 object-contain" />}
                  <div>
                    <h3 className="font-semibold">{comp.name}</h3>
                    <p className="text-xs text-muted-foreground">{comp.country} · {events.length} matches</p>
                  </div>
                </div>
                <div className="divide-y">
                  {events.map((event) => {
                    const eventName = `${event.homeTeam.name} vs ${event.awayTeam.name}`;
                    const increaseMultiplier = 1 + (event.oddsIncreasePercent || 0) / 100;
                    const homeOdds = parseFloat((2.10 * increaseMultiplier).toFixed(2));
                    const awayOdds = parseFloat((3.50 * increaseMultiplier).toFixed(2));
                    return (
                      <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 sm:px-5 hover:bg-muted/30 transition-colors border-b last:border-0">
                        <Link href={`/sports/match/${event.id}`} className="min-w-0 flex-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1.5 shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={event.homeTeam?.logo} alt="Home" className="relative z-10 h-5 w-5 rounded-full border border-background bg-muted object-cover" />
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={event.awayTeam?.logo} alt="Away" className="relative z-0 h-5 w-5 rounded-full border border-background bg-muted object-cover" />
                            </div>
                            <p className="truncate text-sm font-medium">{eventName}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.status === "LIVE" ? <span className="text-red-500 font-bold">LIVE {event.liveStatus?.minute}'</span> : new Date(event.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            {" · "} {event.score?.home ?? 0} - {event.score?.away ?? 0}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
