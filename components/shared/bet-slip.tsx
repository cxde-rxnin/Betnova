"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Ticket, X, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { useBetSlipStore, useSubmitBet } from "@/features/betting/hooks";
import { cn } from "@/lib/utils";

export function BetSlip() {
  const isOpen = useBetSlipStore((s) => s.isOpen);
  const close = useBetSlipStore((s) => s.close);
  const open = useBetSlipStore((s) => s.open);
  const selections = useBetSlipStore((s) => s.selections);
  const removeSelection = useBetSlipStore((s) => s.removeSelection);
  const clearSelections = useBetSlipStore((s) => s.clearSlip);
  const stake = useBetSlipStore((s) => s.stake);
  const setStake = useBetSlipStore((s) => s.setStake);
  const [step, setStep] = useState<1 | 2>(1);
  
  const { mutate: submitBet, isPending } = useSubmitBet();

  const totalOdds = selections.reduce((acc, sel) => acc * sel.lockedOdds, 1);
  const potentialPayout = stake * totalOdds;
  const isAccumulator = selections.length > 1;

  function handlePlaceBet() {
    if (selections.length === 0 || stake <= 0) return;
    submitBet(
      { selections, stake },
      {
        onSuccess: () => {
          toast.success("Bet placed successfully", {
            description: `${selections.length} selection${selections.length === 1 ? "" : "s"} · $${stake.toFixed(2)} staked`,
            icon: <CheckCircle2 className="h-4 w-4" />,
          });
          clearSelections();
          close();
        }
      }
    );
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={open}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95",
          selections.length === 0 && "pointer-events-none opacity-0"
        )}
        aria-label="Open bet slip"
      >
        <Ticket className="h-4 w-4" />
        Bet Slip
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-foreground px-1 text-[11px] font-bold text-primary">
          {selections.length}
        </span>
      </button>

      <Sheet open={isOpen} onOpenChange={(open) => {
        if (open) {
          useBetSlipStore.getState().open();
        } else {
          close();
          setTimeout(() => setStep(1), 300);
        }
      }}>
        <SheetContent side="right" className="theme-marketing dark bg-background w-full sm:max-w-sm p-0 flex flex-col border-l">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center gap-2">
              {step === 2 && (
                <button onClick={() => setStep(1)} className="mr-2 text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <Ticket className="h-4 w-4" /> Bet Slip
            </SheetTitle>
          </SheetHeader>

          {step === 1 ? (
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {selections.length === 0 ? (
                <EmptyState
                  icon={Ticket}
                  title="Your bet slip is empty"
                  description="Select odds from any event to add them here."
                />
              ) : (
                <div className="space-y-3">
                  {selections.map((sel) => (
                    <div key={sel.fixtureId} className="rounded-xl border bg-card p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 pr-4">
                          <p className="truncate text-sm font-bold text-primary mb-1 uppercase tracking-wider">{sel.marketName}</p>
                          <p className="truncate text-base font-semibold">{sel.outcomeName}</p>
                          
                          <div className="flex items-center gap-2 my-2">
                            {(sel.homeLogo || sel.awayLogo) && (
                              <div className="flex -space-x-1.5 shrink-0">
                                {sel.homeLogo && <img src={sel.homeLogo} alt="Home" className="relative z-10 h-5 w-5 rounded-full border border-background bg-muted object-cover" />}
                                {sel.awayLogo && <img src={sel.awayLogo} alt="Away" className="relative z-0 h-5 w-5 rounded-full border border-background bg-muted object-cover" />}
                              </div>
                            )}
                            <p className="truncate text-xs text-muted-foreground">{sel.matchName}</p>
                          </div>
                          
                          <p className="mt-2 text-lg font-bold">Odds: {sel.lockedOdds.toFixed(2)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelection(sel.fixtureId)}
                          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                          aria-label={`Remove ${sel.outcomeName}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={clearSelections}
                    className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                  >
                    Clear all selections
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <h3 className="text-xl font-bold">Set Your Stake</h3>
              
              <div className="rounded-xl border bg-card p-5 space-y-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bet Type</span>
                  <span className="font-semibold">{isAccumulator ? "Accumulator" : "Single"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Selections</span>
                  <span className="font-semibold">{selections.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-b pb-4">
                  <span className="text-muted-foreground">Total Odds</span>
                  <span className="font-semibold text-primary text-lg">{totalOdds.toFixed(2)}</span>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Stake Amount</span>
                  </div>
                  <Input 
                    type="number" 
                    min="0.1" 
                    step="0.1" 
                    placeholder="0.00" 
                    className="text-2xl font-bold text-right h-14 bg-background"
                    value={stake || ""}
                    onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="flex items-center justify-between text-lg border-t pt-5">
                  <span className="font-bold">Estimated Return</span>
                  <span className="font-bold tabular-nums text-green-500">${potentialPayout.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {selections.length > 0 && (
            <div className="border-t bg-card p-4 shrink-0">
              {step === 1 ? (
                <Button className="w-full h-12 text-lg font-bold shadow-lg" size="lg" onClick={() => setStep(2)}>
                  Set Stake & Place Bet
                </Button>
              ) : (
                <Button className="w-full h-12 text-lg font-bold shadow-lg" size="lg" disabled={isPending || stake <= 0} onClick={handlePlaceBet}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Placing bet...
                    </>
                  ) : (
                    "Confirm Bet"
                  )}
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
