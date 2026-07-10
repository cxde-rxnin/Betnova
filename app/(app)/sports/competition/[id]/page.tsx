"use client";

import { useStandings } from "@/features/sportsbook/hooks";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import Link from "next/link";

export default function CompetitionDetailsPage() {
  const params = useParams();
  const competitionId = params.id as string;
  
  const { data: standings, isLoading } = useStandings(competitionId);

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!standings || standings.length === 0) {
    return <div className="text-center py-20 text-muted-foreground">Standings not available for this competition.</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="League Standings" description="Current season rankings." />

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium text-center w-12">#</th>
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 font-medium text-center">P</th>
                <th className="px-4 py-3 font-medium text-center">W</th>
                <th className="px-4 py-3 font-medium text-center">D</th>
                <th className="px-4 py-3 font-medium text-center">L</th>
                <th className="px-4 py-3 font-medium text-center">GD</th>
                <th className="px-4 py-3 font-medium text-center">Pts</th>
                <th className="px-4 py-3 font-medium text-center hidden md:table-cell">Form</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {standings.map((entry) => (
                <tr key={entry.team.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-center">{entry.rank}</td>
                  <td className="px-4 py-3">
                    <Link href={`/sports/team/${entry.team.id}`} className="flex items-center gap-2 hover:underline">
                      {entry.team.logo && <img src={entry.team.logo} alt={entry.team.name} className="h-5 w-5 object-contain" />}
                      <span className="font-medium">{entry.team.name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">{entry.played}</td>
                  <td className="px-4 py-3 text-center">{entry.won}</td>
                  <td className="px-4 py-3 text-center">{entry.drawn}</td>
                  <td className="px-4 py-3 text-center">{entry.lost}</td>
                  <td className="px-4 py-3 text-center">{entry.goalsFor - entry.goalsAgainst}</td>
                  <td className="px-4 py-3 text-center font-bold text-primary">{entry.points}</td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <div className="flex items-center justify-center gap-1">
                      {entry.form.split('').map((char, i) => (
                        <span key={i} className={`flex h-4 w-4 items-center justify-center rounded-[3px] text-[9px] font-bold text-white ${
                          char === 'W' ? 'bg-green-500' : char === 'D' ? 'bg-gray-400' : 'bg-red-500'
                        }`}>
                          {char}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
