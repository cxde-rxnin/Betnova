import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { StatCard } from "@/components/shared/stat-card";
import { Wallet, TrendingUp, Ticket, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getWalletBalances, getTransactionHistory } from "@/features/wallet/actions";
import { getUserBets } from "@/features/betting/actions";
import { getLiveMatches } from "@/features/sportsbook/actions";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name?.split(" ")[0] || "User";

  // Fetch real data
  const [wallets, bets, transactions, liveMatchesResult] = await Promise.all([
    getWalletBalances().catch(() => []),
    getUserBets().catch(() => []),
    getTransactionHistory().catch(() => []),
    getLiveMatches().catch(() => [])
  ]);

  // Aggregate Wallet
  const walletBalance = wallets.reduce((sum: number, w: any) => sum + (w.availableBalance || 0), 0);

  // Aggregate Bets
  const activeBets = bets.filter((b: any) => b.status === "PENDING");
  const wonBets = bets.filter((b: any) => b.status === "WON");
  const totalWinnings = wonBets.reduce((sum: number, bet: any) => sum + (bet.potentialPayout || 0), 0);

  // Aggregate Sports
  const liveEvents = Array.isArray(liveMatchesResult) ? liveMatchesResult : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Dashboard" description={`Welcome back, ${userName}.`} showBack={false} />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Wallet Balance" value={`$${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={Wallet} description="Available balance" />
        <StatCard title="Active Bets" value={activeBets.length} icon={Ticket} description="pending settlement" />
        <StatCard title="Total Winnings" value={`$${totalWinnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={TrendingUp} description="all time" />
        <StatCard title="Live Events" value={liveEvents.length} icon={Trophy} description="happening now" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Live Events */}
        <div>
          <SectionHeader title="Live Now" action={<Button variant="ghost" size="sm" render={<Link href="/sports/live" />}>View all</Button>} />
          <div className="mt-4 space-y-3">
            {liveEvents.length === 0 ? (
              <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
                No live events at the moment.
              </div>
            ) : liveEvents.slice(0, 3).map((event: any) => (
              <Link key={event.id} href={`/sports/match/${event.id}`} className="flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:shadow-sm hover:border-primary/20">
                <div>
                  <p className="text-xs text-muted-foreground">{event.competitionName}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={event.homeTeam?.logo} alt="Home" className="relative z-10 h-5 w-5 rounded-full border border-background" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={event.awayTeam?.logo} alt="Away" className="relative z-0 h-5 w-5 rounded-full border border-background" />
                    </div>
                    <p className="text-sm font-semibold truncate max-w-[180px]">{event.homeTeam?.name} vs {event.awayTeam?.name}</p>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400 text-[10px]">
                      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
                      LIVE
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{event.score?.home ?? 0} - {event.score?.away ?? 0}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Bets */}
        <div>
          <SectionHeader title="Recent Bets" action={<Button variant="ghost" size="sm" render={<Link href="/bets" />}>View all</Button>} />
          <div className="mt-4 space-y-3">
            {bets.length === 0 ? (
               <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
                 You haven&apos;t placed any bets yet.
               </div>
            ) : bets.slice(0, 4).map((bet: any) => (
              <div key={bet._id} className="flex items-center justify-between rounded-xl border bg-card p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {(bet.selections?.[0]?.homeLogo || bet.selections?.[0]?.awayLogo) && (
                      <div className="flex -space-x-1.5 shrink-0">
                        {bet.selections[0].homeLogo && <img src={bet.selections[0].homeLogo} alt="Home" className="relative z-10 h-4 w-4 rounded-full border border-background bg-muted object-cover" />}
                        {bet.selections[0].awayLogo && <img src={bet.selections[0].awayLogo} alt="Away" className="relative z-0 h-4 w-4 rounded-full border border-background bg-muted object-cover" />}
                      </div>
                    )}
                    <p className="text-sm font-semibold truncate">{bet.selections?.[0]?.matchName}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Stake: ${bet.stake.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${bet.potentialPayout ? bet.potentialPayout.toFixed(2) : "0.00"}</p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] mt-0.5",
                      bet.status === "WON" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                      bet.status === "LOST" && "bg-red-500/10 text-red-600 dark:text-red-400",
                      bet.status === "PENDING" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                    )}
                  >
                    {bet.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <SectionHeader title="Recent Transactions" action={<Button variant="ghost" size="sm" render={<Link href="/wallet/transactions" />}>View all</Button>} />
        <div className="mt-4 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No transactions found.
                  </td>
                </tr>
              ) : transactions.slice(0, 5).map((tx: any) => (
                <tr key={tx._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{tx.type}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className={cn("px-4 py-3 text-right font-semibold", tx.type === "DEPOSIT" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground")}>
                    {tx.type === "DEPOSIT" ? "+" : "-"}{tx.amount.toFixed(2)} {tx.currency}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant="secondary" className={cn("text-[10px]", tx.status === "COMPLETED" && "bg-emerald-500/10 text-emerald-600", tx.status === "PENDING" && "bg-amber-500/10 text-amber-600", tx.status === "FAILED" && "bg-red-500/10 text-red-600")}>
                      {tx.status}
                    </Badge>
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
