import { Match } from "@/features/sportsbook/types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface LiveMatchCardProps {
  match: Match;
}

export function LiveMatchCard({ match }: LiveMatchCardProps) {
  return (
    <Link 
      href={`/sports/match/${match.id}`}
      className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/50 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-red-500/50 to-transparent" />
      
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{match.competitionName}</span>
        <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400 px-2 flex items-center gap-1.5 h-6">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          {match.liveStatus?.minute ? `${match.liveStatus.minute}'` : match.status}
        </Badge>
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="flex flex-col items-center gap-2 flex-1">
          {match.homeTeam.logo ? (
            <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="h-10 w-10 object-contain" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs">{match.homeTeam.name.substring(0,2)}</div>
          )}
          <span className="text-sm font-semibold text-center line-clamp-1">{match.homeTeam.name}</span>
        </div>

        <div className="flex flex-col items-center justify-center px-4 font-heading">
          <div className="text-3xl font-bold tracking-tighter">
            {match.score.home ?? 0} - {match.score.away ?? 0}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
          {match.awayTeam.logo ? (
            <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="h-10 w-10 object-contain" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs">{match.awayTeam.name.substring(0,2)}</div>
          )}
          <span className="text-sm font-semibold text-center line-clamp-1">{match.awayTeam.name}</span>
        </div>
      </div>
    </Link>
  );
}
