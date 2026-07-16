"use client";

import { useBetSlipStore, useSubmitBet } from "../hooks";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ticket, X, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function BetSlip() {
  const { selections, stake, setStake, removeSelection, clearSlip: clearSelections, isOpen, open, close } = useBetSlipStore();
  const { mutate: submitBet, isPending } = useSubmitBet();

  const totalOdds = selections.reduce((acc, sel) => acc * sel.lockedOdds, 1);
  const potentialPayout = stake * totalOdds;
  const isAccumulator = selections.length > 1;

  const handleSubmit = () => {
    if (selections.length === 0 || stake <= 0) return;
    submitBet({ selections, stake });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(val) => val ? open() : close()}>
      <SheetTrigger>
        <Button variant="outline" size="sm" className="relative h-9 px-3" onClick={open}>
          <Ticket className="h-4 w-4 mr-2" />
          <span className="font-semibold text-sm">Bet Slip</span>
          {selections.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
              {selections.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="theme-marketing dark flex flex-col h-full sm:max-w-md w-[90vw] p-0 border-l bg-background">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl font-bold">
              <Ticket className="h-5 w-5" /> Bet Slip
            </SheetTitle>
            {selections.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearSelections} className="text-muted-foreground text-xs h-7">
                <Trash2 className="h-3 w-3 mr-1" /> Clear All
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-muted/30 p-4 space-y-4">
          {selections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3">
              <Ticket className="h-12 w-12 opacity-20" />
              <p>Your bet slip is empty.<br/>Add some selections to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selections.map((sel) => (
                <div key={`${sel.fixtureId}-${sel.marketName}-${sel.outcomeName}`} className="bg-card border rounded-xl p-3 relative shadow-sm">
                  <button 
                    onClick={() => removeSelection(sel.fixtureId, sel.marketName, sel.outcomeName)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="pr-6">
                    <div className="text-xs font-semibold text-primary mb-1 uppercase tracking-wide">{sel.marketName}</div>
                    <div className="font-bold mb-1">{sel.outcomeName}</div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {(sel.homeLogo || sel.awayLogo) && (
                        <div className="flex -space-x-1.5 shrink-0">
                          {sel.homeLogo && <img src={sel.homeLogo} alt="Home" className="relative z-10 h-5 w-5 rounded-full border border-background bg-muted object-cover" />}
                          {sel.awayLogo && <img src={sel.awayLogo} alt="Away" className="relative z-0 h-5 w-5 rounded-full border border-background bg-muted object-cover" />}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground line-clamp-1">{sel.matchName}</div>
                    </div>
                    
                    <div className="text-lg font-bold mt-2 text-right">{sel.lockedOdds.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selections.length > 0 && (
          <div className="border-t bg-card p-4 space-y-4">
            <div className="flex items-center justify-between bg-muted/50 p-2 rounded text-sm font-medium">
              <span>Bet Type:</span>
              <Badge variant="secondary">{isAccumulator ? "Accumulator" : "Single"}</Badge>
            </div>
            
            <div className="flex items-center justify-between font-bold">
              <span>Total Odds:</span>
              <span className="text-xl text-primary">{totalOdds.toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Stake (USDT)</span>
              </div>
              <Input 
                type="number" 
                min="0.1" 
                step="0.1" 
                placeholder="0.00" 
                className="text-lg font-semibold text-right"
                value={stake || ""}
                onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="flex items-center justify-between font-bold text-lg border-t pt-4">
              <span>Potential Return:</span>
              <span className="text-green-500">{potentialPayout.toFixed(2)}</span>
            </div>

            <Button 
              className="w-full h-12 text-lg font-bold shadow-lg" 
              onClick={handleSubmit}
              disabled={isPending || stake <= 0}
            >
              {isPending ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : "Place Bet"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
