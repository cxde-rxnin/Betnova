"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { TablePagination } from "@/components/shared/table-pagination";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CalendarDays, Loader2 } from "lucide-react";
import { useLiveMatches, useUpcomingMatches, useAdminSetMatchOddsIncrease } from "@/features/sportsbook/hooks";
import type { Match } from "@/features/sportsbook/types";

const PAGE_SIZE = 5;

export default function AdminEventsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Match | null>(null);
  const [increaseInputs, setIncreaseInputs] = useState<Record<string, string>>({});
  const { data: liveEvents, isLoading: loadingLive } = useLiveMatches();
  const { data: upcomingEvents, isLoading: loadingUpcoming } = useUpcomingMatches();
  const { mutate: updateOddsIncrease, isPending: isUpdating } = useAdminSetMatchOddsIncrease();

  const allEvents = useMemo(() => {
    return [...(liveEvents || []), ...(upcomingEvents || [])];
  }, [liveEvents, upcomingEvents]);

  const filtered = useMemo(() => {
    return allEvents.filter((e) => {
      const matchesSearch = `${e.homeTeam.name} ${e.awayTeam.name} ${e.competitionName}`.toLowerCase().includes(search.toLowerCase());
      const mappedStatus = e.status === "LIVE" ? "live" : e.status === "PRE_MATCH" ? "upcoming" : "finished";
      const matchesStatus = status === "all" || mappedStatus === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status, allEvents]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isLoading = loadingLive || loadingUpcoming;

  const handleApplyIncrease = (event: Match) => {
    const rawValue = increaseInputs[event.id];
    if (rawValue === undefined || rawValue.trim() === "") return;
    const parsed = Number(rawValue);
    updateOddsIncrease({ matchId: event.id, increasePercent: parsed });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Events" description="Manage all sporting events." />
      <TableToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by team or competition..."
        filterValue={status}
        onFilterChange={(v) => { setStatus(v); setPage(1); }}
        filterOptions={[
          { label: "All statuses", value: "all" },
          { label: "Live", value: "live" },
          { label: "Upcoming", value: "upcoming" },
          { label: "Finished", value: "finished" },
        ]}
      />
      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="h-40 grid place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : paged.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No events found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Match</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Competition</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Date</th>
                    <th className="px-4 py-3 font-medium">Odds Increase (%)</th>
                    <th className="px-4 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                {paged.map((event) => (
                  <tr key={event.id} onClick={() => setSelected(event)} className="cursor-pointer transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{event.homeTeam.name} vs {event.awayTeam.name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{event.competitionName}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{new Date(event.startTime).toLocaleDateString()}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={500}
                          step="0.1"
                          className="h-8 w-28"
                          value={increaseInputs[event.id] ?? String(event.oddsIncreasePercent || 0)}
                          onChange={(e) => setIncreaseInputs((prev) => ({ ...prev, [event.id]: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleApplyIncrease(event)}
                          disabled={isUpdating}
                        >
                          Apply
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="secondary" className={cn("text-[10px]", event.status === "LIVE" && "bg-destructive/10 text-destructive", event.status === "PRE_MATCH" && "bg-info/10 text-info", event.status === "FINISHED" && "bg-muted text-muted-foreground")}>
                        {event.status === "PRE_MATCH" ? "UPCOMING" : event.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            <div className="border-t">
              <TablePagination page={page} pageCount={pageCount} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected ? `${selected.homeTeam} vs ${selected.awayTeam}` : ""}
        description={selected?.competitionName}
        fields={selected ? [
          { label: "Status", value: <Badge variant="secondary" className="text-[10px]">{selected.status === "PRE_MATCH" ? "UPCOMING" : selected.status}</Badge> },
          { label: "Start time", value: new Date(selected.startTime).toLocaleString() },
          { label: "Score", value: `${selected.score.home ?? 0} - ${selected.score.away ?? 0}` },
          { label: "Odds increase", value: `${(selected.oddsIncreasePercent || 0).toFixed(2)}%` },
        ] : []}
      />
    </div>
  );
}
