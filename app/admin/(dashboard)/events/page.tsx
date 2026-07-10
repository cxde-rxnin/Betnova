"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { TablePagination } from "@/components/shared/table-pagination";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { EmptyState } from "@/components/shared/empty-state";
import { EVENTS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";

const PAGE_SIZE = 5;

export default function AdminEventsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<(typeof EVENTS)[number] | null>(null);

  const filtered = useMemo(() => {
    return EVENTS.filter((e) => {
      const matchesSearch = `${e.homeTeam} ${e.awayTeam} ${e.competitionName}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || e.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      <div className="overflow-hidden rounded-xl border">
        {paged.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No events found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Match</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Competition</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paged.map((event) => (
                  <tr key={event.id} onClick={() => setSelected(event)} className="cursor-pointer transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{event.homeTeam} vs {event.awayTeam}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{event.competitionName}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{new Date(event.startTime).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="secondary" className={cn("text-[10px]", event.status === "live" && "bg-destructive/10 text-destructive", event.status === "upcoming" && "bg-info/10 text-info", event.status === "finished" && "bg-muted text-muted-foreground")}>{event.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          { label: "Status", value: <Badge variant="secondary" className="text-[10px]">{selected.status}</Badge> },
          { label: "Start time", value: new Date(selected.startTime).toLocaleString() },
          { label: "Score", value: selected.homeScore !== undefined ? `${selected.homeScore} - ${selected.awayScore}` : "—" },
          { label: "Odds (1 / X / 2)", value: `${selected.odds.home.toFixed(2)} / ${selected.odds.draw > 0 ? selected.odds.draw.toFixed(2) : "—"} / ${selected.odds.away.toFixed(2)}` },
        ] : []}
      />
    </div>
  );
}
