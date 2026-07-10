"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { TablePagination } from "@/components/shared/table-pagination";
import { DetailDrawer } from "@/components/shared/detail-drawer";
import { EmptyState } from "@/components/shared/empty-state";
import { MOCK_USERS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Wallet } from "lucide-react";

const walletBalances = [2847.5, 1204.0, 15320.75, 0, 632.2];
const wallets = MOCK_USERS.map((user, i) => ({
  ...user,
  balance: walletBalances[i] ?? 0,
  frozen: user.status === "suspended",
}));

const PAGE_SIZE = 4;

export default function AdminWalletsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<(typeof wallets)[number] | null>(null);

  const filtered = useMemo(
    () => wallets.filter((w) => `${w.name} ${w.email}`.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Wallets" description="Platform wallet overview." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Deposits" value="$1,247,500" icon={Wallet} />
        <StatCard title="Total Withdrawals" value="$892,300" icon={Wallet} />
        <StatCard title="Platform Float" value="$355,200" icon={Wallet} />
      </div>

      <div className="space-y-4">
        <TableToolbar search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }} searchPlaceholder="Search by user name or email..." />
        <div className="overflow-hidden rounded-xl border">
          {paged.length === 0 ? (
            <EmptyState icon={Wallet} title="No wallets found" description="Try adjusting your search." />
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium text-right">Balance</th>
                    <th className="px-4 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paged.map((wallet) => (
                    <tr key={wallet.id} onClick={() => setSelected(wallet)} className="cursor-pointer transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-medium">{wallet.name}</p>
                        <p className="text-xs text-muted-foreground">{wallet.email}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">${wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="secondary" className={cn("text-[10px]", wallet.frozen ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success")}>
                          {wallet.frozen ? "Frozen" : "Active"}
                        </Badge>
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
      </div>

      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.name ?? ""}
        description={selected?.email}
        fields={selected ? [
          { label: "Balance", value: `$${selected.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
          { label: "Status", value: <Badge variant="secondary" className={cn("text-[10px]", selected.frozen ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success")}>{selected.frozen ? "Frozen" : "Active"}</Badge> },
          { label: "User ID", value: selected.id },
        ] : []}
      />
    </div>
  );
}
