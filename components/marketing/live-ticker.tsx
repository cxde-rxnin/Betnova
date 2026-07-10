import type { SportEvent } from "@/lib/mock-data";
import Image from "next/image";

export function LiveTicker({ events = [] }: { events?: SportEvent[] }) {
  const liveEvents = events.filter((e) => e.status === "live" || e.status === "upcoming"); // Allow upcoming if no live
  
  // We need enough items to create a seamless marquee loop
  const items = Array.from({ length: 10 }).flatMap(() => liveEvents);

  if (items.length === 0) return null;
  return (
    <div className="group relative overflow-hidden border-b border-border/60 bg-card/60">
      <div 
        className="flex w-max animate-marquee items-center gap-8 py-2.5 group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: `${items.length * 4}s` }}
      >
        {items.map((event, i) => (
          <div key={`${event.id}-${i}`} className="flex shrink-0 items-center gap-2.5 whitespace-nowrap px-2 text-xs font-medium">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
            </span>
            <span className="text-muted-foreground">{event.competitionName}</span>
            <span className="flex items-center gap-1.5 text-foreground">
              {event.homeTeamLogo && (
                <img src={event.homeTeamLogo} alt={event.homeTeam} className="h-3 w-3 object-contain" />
              )}
              {event.homeTeam} <span className="tabular-nums text-primary">{event.homeScore ?? "–"}</span>
              <span className="text-muted-foreground"> vs </span>
              <span className="tabular-nums text-primary">{event.awayScore ?? "–"}</span> {event.awayTeam}
              {event.awayTeamLogo && (
                <img src={event.awayTeamLogo} alt={event.awayTeam} className="h-3 w-3 object-contain" />
              )}
            </span>
            {event.minute && <span className="text-muted-foreground">{event.minute}&apos;</span>}
            <span aria-hidden className="text-border">/</span>
          </div>
        ))}
      </div>
    </div>
  );
}
