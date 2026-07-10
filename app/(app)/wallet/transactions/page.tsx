import { PageHeader } from "@/components/shared/page-header";
import { MOCK_TRANSACTIONS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Transaction History" description="All your wallet transactions." />
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Reference</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Date</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-4 py-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {MOCK_TRANSACTIONS.map((tx) => (
              <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{tx.description}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell font-mono text-xs">{tx.reference}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                <td className={cn("px-4 py-3 text-right font-semibold", tx.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "")}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount.toFixed(2)} {tx.currency}
                </td>
                <td className="px-4 py-3 text-right">
                  <Badge variant="secondary" className={cn("text-[10px]", tx.status === "completed" && "bg-emerald-500/10 text-emerald-600", tx.status === "pending" && "bg-amber-500/10 text-amber-600", tx.status === "failed" && "bg-red-500/10 text-red-600")}>
                    {tx.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
