"use client";

import { useTransactionHistory } from "../hooks";
import { Loader2, ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function TransactionHistory() {
  const { data: transactions, isLoading } = useTransactionHistory();

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground rounded-xl border border-dashed">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Amount</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Date</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Ref</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transactions.map((tx: any) => (
              <tr key={tx._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      tx.type === "DEPOSIT" ? "bg-green-500/10 text-green-500" :
                      tx.type === "WITHDRAWAL" ? "bg-orange-500/10 text-orange-500" :
                      "bg-blue-500/10 text-blue-500"
                    }`}>
                      {tx.type === "DEPOSIT" ? <ArrowDownLeft className="h-4 w-4" /> :
                       tx.type === "WITHDRAWAL" ? <ArrowUpRight className="h-4 w-4" /> :
                       <ArrowRightLeft className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{tx.type.toLowerCase()}</div>
                      <div className="text-xs text-muted-foreground md:hidden">{format(new Date(tx.createdAt), 'MMM d, HH:mm')}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className={`font-semibold ${tx.type === "DEPOSIT" ? "text-green-500" : ""}`}>
                    {tx.type === "DEPOSIT" ? "+" : "-"}{tx.amount.toFixed(2)} {tx.currency}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <Badge variant={
                    tx.status === "COMPLETED" ? "default" :
                    tx.status === "PENDING" ? "secondary" :
                    "destructive"
                  } className={
                    tx.status === "COMPLETED" ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" :
                    tx.status === "PENDING" ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" : ""
                  }>
                    {tx.status}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-muted-foreground hidden md:table-cell">
                  {format(new Date(tx.createdAt), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-4 py-4 text-xs font-mono text-muted-foreground hidden md:table-cell max-w-[120px] truncate">
                  {tx.providerReference || tx._id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
