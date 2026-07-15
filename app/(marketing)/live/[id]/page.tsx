"use client";

import { useMatchDetails } from "@/features/sportsbook/hooks";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Calendar, MapPin, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OddsDisplay } from "@/features/sportsbook/components/OddsDisplay";
import { MatchPredictionCard } from "@/features/sportsbook/components/MatchPredictionCard";
import Link from "next/link";
import { toast } from "sonner";

export default function PublicMatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const { data: match, isLoading, error } = useMatchDetails(matchId);

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="text-xl font-semibold text-destructive">Unable to load match</div>
        <p className="text-muted-foreground max-w-md">
          {error instanceof Error && error.message.includes("Rate limit") 
            ? "We are currently experiencing high traffic. Please try again in a moment." 
            : "There was a problem loading the match details. Please try again later."}
        </p>
      </div>
    );
  }

  if (!match) {
    return <div className="text-center py-20 text-muted-foreground">Match not found.</div>;
  }

  const handleOddsClick = () => {
    toast("Login required", { description: "Please log in or register to place bets." });
    router.push("/login");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-muted-foreground">
        <Link href="/sports" className="hover:text-primary transition-colors">Sports</Link>
        <span className="mx-2">/</span>
        <span className="capitalize">{match.sportId.replace(/_/g, " ")}</span>
        <span className="mx-2">/</span>
        <span className="">{match.competitionName}</span>
      </div>

      {/* Match Header */}
      <div className="rounded-2xl border bg-card p-6 md:p-8 relative overflow-hidden">
        {match.status === "LIVE" && (
          <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-red-500/50 to-transparent" />
        )}
        
        <div className="flex justify-between items-center mb-8">
          <Badge variant="outline" className="font-normal uppercase tracking-wider text-xs">
            {match.competitionName}
          </Badge>
          <div className="flex items-center gap-2 text-xs font-medium">
            {match.status === "LIVE" ? (
              <Badge variant="secondary" className="bg-red-500/10 text-red-600 px-2 h-6 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                LIVE {match.liveStatus?.minute}&apos;
              </Badge>
            ) : (
              <span suppressHydrationWarning className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(match.startTime).toLocaleString("en-US", { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-4 flex-1">
            {match.homeTeam.logo ? (
              <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="h-20 w-20 md:h-24 md:w-24 object-contain" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-xl">{match.homeTeam.name.substring(0,3)}</div>
            )}
            <h2 className="text-xl md:text-2xl font-bold text-center">{match.homeTeam.name}</h2>
          </div>

          <div className="flex flex-col items-center justify-center px-4 md:px-8">
            {match.status === "PRE_MATCH" ? (
              <div className="text-4xl md:text-5xl font-black text-muted-foreground/30 font-heading">VS</div>
            ) : (
              <div className="text-5xl md:text-7xl font-black font-heading tracking-tighter tabular-nums">
                {match.score?.home ?? 0} - {match.score?.away ?? 0}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 flex-1">
            {match.awayTeam.logo ? (
              <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="h-20 w-20 md:h-24 md:w-24 object-contain" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-xl">{match.awayTeam.name.substring(0,3)}</div>
            )}
            <h2 className="text-xl md:text-2xl font-bold text-center">{match.awayTeam.name}</h2>
          </div>
        </div>

        {match.venue && (
          <div className="mt-8 pt-6 border-t flex justify-center items-center text-sm text-muted-foreground gap-1.5">
            <MapPin className="h-4 w-4" /> {match.venue}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Markets */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Betting Markets
          </h3>
          {match.markets?.map((market) => (
            <div key={market.id} className="rounded-xl border bg-card p-4">
              <h4 className="font-medium mb-4">{market.name}</h4>
              <div className="grid grid-cols-3 gap-3">
                {market.selections.map(sel => (
                  <OddsDisplay 
                    key={sel.id} 
                    odds={sel.odds} 
                    label={sel.label} 
                    size="lg" 
                    isSelected={false}
                    onClick={handleOddsClick}
                  />
                ))}
              </div>
            </div>
          ))}
          {(!match.markets || match.markets.length === 0) && (
            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
              No markets available for this match.
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Match Stats</h3>
          <div className="rounded-xl border bg-card p-4">
            {match.statistics && match.statistics.length > 0 ? (
              <div className="space-y-4">
                {match.statistics.map((stat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{stat.homeValue}</span>
                      <span className="font-medium text-foreground">{stat.type}</span>
                      <span>{stat.awayValue}</span>
                    </div>
                    <div className="flex h-1.5 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="bg-primary" 
                        style={{ width: `${(Number(stat.homeValue) / (Number(stat.homeValue) + Number(stat.awayValue)) || 0.5) * 100}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Stats not available yet.</p>
            )}
          </div>
          
          {match.prediction && (
            <MatchPredictionCard prediction={match.prediction} />
          )}
        </div>
      </div>
    </div>
  );
}
