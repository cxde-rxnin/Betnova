"use client";

import type { SportEvent } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useBetSlipStore } from "@/features/betting/hooks";

function spreadFor(event: SportEvent) {
  const diff = (event.odds.away - event.odds.home) * 1.5;
  const favoredHome = event.odds.home <= event.odds.away;
  const value = Math.max(0.5, Math.round(Math.abs(diff) * 2) / 2);
  return favoredHome ? `-${value}` : `+${value}`;
}

function totalFor(event: SportEvent) {
  const base = 2 + (event.odds.home + event.odds.away) / 4;
  return (Math.round(base * 2) / 2).toFixed(1);
}

export function LiveMarketCard({ event, basePath = "/live" }: { event: SportEvent, basePath?: string }) {
  const isLive = event.status === "live";
  const isFinished = event.status === "finished";
  
  const addSelection = useBetSlipStore((s) => s.addSelection);
  const removeSelection = useBetSlipStore((s) => s.removeSelection);
  const selections = useBetSlipStore((s) => s.selections);

  const handleOddsClick = (e: React.MouseEvent, outcomeName: string, odds: number) => {
    e.preventDefault();
    e.stopPropagation();

    const isSelected = selections.some(s => s.fixtureId === event.id && s.marketName === "Match Result" && s.outcomeName === outcomeName);

    if (isSelected) {
      removeSelection(event.id);
    } else {
      addSelection({
        fixtureId: event.id,
        sportId: event.sportId,
        competitionId: event.competitionId,
        matchName: `${event.homeTeam} vs ${event.awayTeam}`,
        marketName: "Match Result",
        outcomeName,
        homeLogo: event.homeTeamLogo || "",
        awayLogo: event.awayTeamLogo || "",
        lockedOdds: odds
      });
    }
  };

  return (
    <Link href={`${basePath}/${event.id}`} className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 block">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">{event.competitionName}</span>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-1 font-semibold text-destructive">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
            </span>
            LIVE {event.minute}&apos;
          </span>
        ) : isFinished ? (
          <span className="rounded-md bg-muted px-2 py-1 font-medium text-muted-foreground">Final</span>
        ) : (
          <span className="rounded-md bg-muted px-2 py-1 font-medium text-muted-foreground">
            {new Date(event.startTime).toLocaleDateString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            {event.homeTeamLogo && (
              <img src={event.homeTeamLogo} alt={event.homeTeam} className="h-4 w-4 shrink-0 object-contain" />
            )}
            <span className="truncate text-sm font-semibold">{event.homeTeam}</span>
          </div>
          <span className="ml-3 shrink-0 tabular-nums text-sm font-semibold text-muted-foreground">
            {event.homeScore ?? "–"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            {event.awayTeamLogo && (
              <img src={event.awayTeamLogo} alt={event.awayTeam} className="h-4 w-4 shrink-0 object-contain" />
            )}
            <span className="truncate text-sm font-semibold">{event.awayTeam}</span>
          </div>
          <span className="ml-3 shrink-0 tabular-nums text-sm font-semibold text-muted-foreground">
            {event.awayScore ?? "–"}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-1.5 text-center">
        {[
          { label: "1", outcome: event.homeTeam, value: event.odds.home },
          { label: "X", outcome: "Draw", value: event.odds.draw },
          { label: "2", outcome: event.awayTeam, value: event.odds.away },
        ].map((m) => {
          const isSelected = selections.some(s => s.fixtureId === event.id && s.marketName === "Match Result" && s.outcomeName === m.outcome);
          return (
            <button 
              key={m.label} 
              onClick={(e) => handleOddsClick(e, m.outcome, m.value)}
              disabled={isFinished || isLive}
              className={cn(
                "rounded-lg px-1.5 py-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                isSelected 
                  ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary ring-offset-1 ring-offset-background" 
                  : "bg-muted/50 hover:bg-primary/10 hover:text-primary text-foreground"
              )}
            >
              <p className={cn("text-[10px] font-medium", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>{m.label}</p>
              <p className="mt-0.5 tabular-nums text-sm font-semibold">{m.value.toFixed(2)}</p>
            </button>
          );
        })}
      </div>

      <div className={cn("mt-4 flex items-center gap-1.5 text-[11px]", isLive ? "text-primary" : "text-muted-foreground")}>
        <span className={cn("h-1.5 w-1.5 rounded-full", isLive ? "bg-primary" : "bg-muted-foreground/50")} />
        {isLive ? "Market open · odds moving" : isFinished ? "Market settled" : "Market opens at kickoff"}
      </div>
    </Link>
  );
}
