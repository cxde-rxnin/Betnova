"use client";

import { useLiveMatches, useUpcomingMatches } from "@/features/sportsbook/hooks";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { LiveMatchCard } from "@/features/sportsbook/components/LiveMatchCard";

export default function TeamDetailsPage() {
  const params = useParams();
  const teamId = params.id as string;
  
  const { data: upcomingMatches, isLoading: upcomingLoading } = useUpcomingMatches();
  const { data: liveMatches, isLoading: liveLoading } = useLiveMatches();

  const isLoading = upcomingLoading || liveLoading;

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  // Find all matches for this team
  const teamLiveMatches = liveMatches?.filter(m => m.homeTeam.id === teamId || m.awayTeam.id === teamId) || [];
  const teamUpcomingMatches = upcomingMatches?.filter(m => m.homeTeam.id === teamId || m.awayTeam.id === teamId) || [];

  // Get team info from the first match found
  const teamMatch = [...teamLiveMatches, ...teamUpcomingMatches][0];
  const team = teamMatch?.homeTeam.id === teamId ? teamMatch.homeTeam : teamMatch?.awayTeam;

  if (!team) {
    return <div className="text-center py-20 text-muted-foreground">Team not found or no matches scheduled.</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-6 rounded-2xl border bg-card p-6 md:p-8">
        {team.logo ? (
          <img src={team.logo} alt={team.name} className="h-24 w-24 object-contain" />
        ) : (
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-3xl">{team.name.substring(0,3)}</div>
        )}
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-muted-foreground">{team.shortName}</p>
        </div>
      </div>

      {teamLiveMatches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> Live Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamLiveMatches.map(match => (
              <LiveMatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {teamUpcomingMatches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamUpcomingMatches.map(match => (
              <LiveMatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
