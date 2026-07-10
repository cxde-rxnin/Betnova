"use client";

import { useUpcomingMatches } from "@/features/sportsbook/hooks";
import { Loader2, Lightbulb, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function PredictionsPage() {
  const { data: upcomingMatches, isLoading } = useUpcomingMatches("football");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-center justify-center text-center">
        <Badge variant="secondary" className="mb-4">
          <Lightbulb className="mr-1.5 h-3.5 w-3.5" /> AI Powered
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Today's Predictions
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          View advanced AI betting advice, win probabilities, and expected goals for today's top matches. Select a match below to see its full prediction analysis.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : upcomingMatches?.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed text-center">
          <div className="text-xl font-semibold text-muted-foreground">No matches scheduled today</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingMatches?.slice(0, 15).map((match) => (
            <Link 
              key={match.id} 
              href={`/live/${match.id}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium uppercase tracking-wider">{match.competitionName}</span>
                <span>{new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                    {match.homeTeam.logo ? (
                      <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="h-8 w-8 object-contain" />
                    ) : (
                      <span className="text-xs font-bold">{match.homeTeam.name.substring(0,3)}</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-center line-clamp-1">{match.homeTeam.name}</span>
                </div>

                <div className="text-sm font-bold text-muted-foreground/50">VS</div>

                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                    {match.awayTeam.logo ? (
                      <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="h-8 w-8 object-contain" />
                    ) : (
                      <span className="text-xs font-bold">{match.awayTeam.name.substring(0,3)}</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-center line-clamp-1">{match.awayTeam.name}</span>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <TrendingUp className="h-4 w-4" />
                View Prediction
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
