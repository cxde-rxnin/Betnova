"use client";

import { useUserBets, useTriggerAutoSettlement, useBetSlipStore } from "@/features/betting/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { Loader2, ExternalLink, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyPlus } from "lucide-react";

function BetCard({ bet }: { bet: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const clearSlip = useBetSlipStore((s) => s.clearSlip);
  const addSelection = useBetSlipStore((s) => s.addSelection);
  const openSlip = useBetSlipStore((s) => s.open);

  const handleRebet = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSlip();
    bet.selections.forEach((sel: any) => {
      if (sel.status === "PENDING") {
        addSelection({
          fixtureId: sel.fixtureId,
          sportId: sel.sportId,
          competitionId: sel.competitionId,
          matchName: sel.matchName,
          marketName: sel.marketName,
          outcomeName: sel.outcomeName,
          lockedOdds: sel.lockedOdds,
          homeLogo: sel.homeLogo,
          awayLogo: sel.awayLogo
        });
      }
    });
    openSlip();
  };

  return (
    <div className="rounded-xl border bg-card p-5 relative overflow-hidden transition-all">
      <div 
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline">{bet.type}</Badge>
          <span className="text-sm text-muted-foreground">{format(new Date(bet.createdAt), "PPp")}</span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform ml-1 group-hover:text-foreground", isExpanded && "rotate-180")} />
        </div>
        <div className="flex items-center gap-2">
          {bet.status !== "WON" && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs hover:bg-primary/10 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
              onClick={handleRebet}
            >
              <CopyPlus className="h-3.5 w-3.5 mr-1.5" /> Reuse
            </Button>
          )}
          <Badge className={cn(
            bet.status === "PENDING" ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" : 
            bet.status === "WON" ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : 
            bet.status === "LOST" ? "bg-red-500/10 text-red-600 hover:bg-red-500/20" : 
            "bg-muted text-muted-foreground"
          )}>
            {bet.status}
          </Badge>
        </div>
      </div>

      <div className={cn(
        "space-y-3 transition-all duration-300 ease-in-out overflow-hidden", 
        isExpanded ? "max-h-[2000px] opacity-100 mt-6 mb-6" : "max-h-0 opacity-0 m-0"
      )}>
        {bet.selections.map((sel: any, i: number) => {
          const displayStatus = bet.status === "WON" ? "WON" : sel.status;
          return (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/30 p-3 rounded-lg border">
            <div>
              <div className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                displayStatus === "WON" ? "text-green-500" :
                displayStatus === "LOST" ? "text-red-500" :
                "text-amber-500"
              )}>
                {displayStatus}
              </div>
              <div className="font-bold flex items-center gap-2 my-1">
                {sel.outcomeName} 
                <span className="text-muted-foreground font-normal">@</span> 
                {sel.lockedOdds.toFixed(2)}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {(sel.homeLogo || sel.awayLogo) && (
                  <div className="flex -space-x-1.5 shrink-0">
                    {sel.homeLogo && <img src={sel.homeLogo} alt="Home" className="relative z-10 h-4 w-4 rounded-full border border-background bg-muted object-cover" />}
                    {sel.awayLogo && <img src={sel.awayLogo} alt="Away" className="relative z-0 h-4 w-4 rounded-full border border-background bg-muted object-cover" />}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">{sel.matchName}</div>
              </div>
            </div>
            <Button nativeButton={false} variant="ghost" size="sm" render={<Link href={`/sports/match/${sel.fixtureId}`} />} className="mt-2 sm:mt-0 h-8 px-2 text-xs">
              View Match <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        );
        })}
      </div>

      <div className="flex items-center justify-between border-t pt-4 mt-4">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Total Stake</div>
          <div className="font-bold text-lg">{bet.stake.toFixed(2)} {bet.currency}</div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-sm text-muted-foreground">Potential Payout</div>
          <div className={cn("font-bold text-lg", bet.status === "WON" ? "text-green-500" : "")}>
            {bet.potentialPayout.toFixed(2)} {bet.currency}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BetsPage() {
  const { data: bets, isLoading } = useUserBets();
  const { mutate: checkSettlement } = useTriggerAutoSettlement();

  // Trigger lazy evaluation on load
  useEffect(() => {
    if (bets) {
      bets.forEach((bet: any) => {
        if (bet.status === "PENDING") {
          checkSettlement(bet._id);
        }
      });
    }
  }, [bets, checkSettlement]);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="My Bets" description="Track your open and settled wagers." />

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : bets && bets.length > 0 ? (
        <div className="space-y-4">
          {bets.map((bet: any) => (
            <BetCard key={bet._id} bet={bet} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground border rounded-xl border-dashed">
          You haven't placed any bets yet!
        </div>
      )}
    </div>
  );
}
