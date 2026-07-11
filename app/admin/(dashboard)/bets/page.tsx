"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { TablePagination } from "@/components/shared/table-pagination";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Ticket, Loader2 } from "lucide-react";
import { useAdminBets, useAdminManualSettle } from "@/features/betting/hooks";

const PAGE_SIZE = 10;

export default function AdminBetsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any | null>(null);

  const { data: bets, isLoading } = useAdminBets();
  const { mutate: settleBet, isPending: isSettling } = useAdminManualSettle();

  const filtered = useMemo(() => {
    if (!bets) return [];
    return bets.filter((b: any) => {
      const matchNameStr = b.selections?.map((s:any) => s.matchName).join(" ") || "";
      const matchesSearch = matchNameStr.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || b.status.toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [search, status, bets]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Bets" description="Manage all platform bets." />
      <TableToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by selection or event..."
        filterValue={status}
        onFilterChange={(v) => { setStatus(v); setPage(1); }}
        filterOptions={[
          { label: "All statuses", value: "all" },
          { label: "Pending", value: "pending" },
          { label: "Won", value: "won" },
          { label: "Lost", value: "lost" },
        ]}
      />
        <div className="rounded-xl border bg-card overflow-hidden">
          {paged.length === 0 ? (
            <EmptyState icon={Ticket} title="No bets found" description="Try adjusting your search or filters." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Type</th>
                  <th className="px-4 py-3 font-medium text-right">Stake</th>
                  <th className="px-4 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="h-32 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                ) : (
                  paged.map((bet: any) => (
                    <tr key={bet._id} onClick={() => setSelected(bet)} className="cursor-pointer transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">
                        {bet.userId?.email || bet.userId?.name || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {bet.type} ({bet.selections?.length || 0} legs)
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">${bet.stake.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="secondary" className={cn("text-[10px]", bet.status === "WON" && "bg-success/10 text-success", bet.status === "LOST" && "bg-destructive/10 text-destructive", bet.status === "PENDING" && "bg-warning/10 text-warning")}>{bet.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
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
        title={selected ? `${selected.type} Bet` : ""}
        description={selected ? `${selected.selections?.length || 0} Selection(s)` : ""}
        fields={selected ? [
          { label: "User", value: selected.userId?.email || selected.userId?.name || "Unknown" },
          { label: "Odds", value: selected.totalOdds?.toFixed(2) || "N/A" },
          { label: "Stake", value: `$${selected.stake?.toFixed(2) || 0}` },
          { label: "Potential return", value: `$${selected.potentialPayout?.toFixed(2) || 0}` },
          { label: "Status", value: <Badge variant="secondary" className="text-[10px]">{selected.status}</Badge> },
          { label: "Placed", value: new Date(selected.createdAt).toLocaleString() },
        ] : []}
        footer={
          selected?.status === "PENDING" ? (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Admin Settlement actions</h4>
              <p className="text-xs text-muted-foreground">Manually close or void this bet. This will instantly credit or clear the user's funds.</p>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full bg-success/10 text-success hover:bg-success/20 border-transparent"
                  disabled={isSettling}
                  onClick={() => { settleBet({ betId: selected._id, result: "WON" }); setSelected(null); }}
                >
                  Mark Won
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 border-transparent"
                  disabled={isSettling}
                  onClick={() => { settleBet({ betId: selected._id, result: "LOST" }); setSelected(null); }}
                >
                  Mark Lost
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-muted-foreground hover:bg-muted"
                  disabled={isSettling}
                  onClick={() => { settleBet({ betId: selected._id, result: "VOID" }); setSelected(null); }}
                >
                  Void Bet
                </Button>
              </div>
            </div>
          ) : undefined
        }
      />
    </div>
  );
}
