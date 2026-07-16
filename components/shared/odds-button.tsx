"use client";

import { useBetSlipStore } from "@/features/betting/hooks";
import { cn } from "@/lib/utils";

interface OddsButtonProps {
  eventId: string;
  eventName: string;
  market: string;
  label: string;
  homeLogo?: string;
  awayLogo?: string;
  odds: number;
  size?: "sm" | "md";
  className?: string;
}

export function OddsButton({ eventId, eventName, market, label, homeLogo, awayLogo, odds, size = "md", className }: OddsButtonProps) {
  const isSelected = useBetSlipStore((s) => s.selections.some((sel) => sel.fixtureId === eventId && sel.marketName === market && sel.outcomeName === label));
  const addSelection = useBetSlipStore((s) => s.addSelection);
  const removeSelection = useBetSlipStore((s) => s.removeSelection);

  return (
    <button
      type="button"
      disabled={odds === 0}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (odds > 0) {
          if (isSelected) {
            removeSelection(eventId, market, label);
          } else {
            addSelection({ 
              fixtureId: eventId, 
              sportId: "unknown", 
              competitionId: "unknown", 
              matchName: eventName, 
              marketName: market, 
              outcomeName: label, 
              homeLogo, 
              awayLogo, 
              lockedOdds: odds 
            });
          }
        }
      }}
      aria-pressed={isSelected}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border font-medium transition-all active:scale-[0.97]",
        isSelected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-muted/50 text-foreground hover:border-primary/50 hover:bg-primary/5",
        odds === 0 && "opacity-50 cursor-not-allowed hover:border-border hover:bg-muted/50",
        size === "sm" ? "px-2 py-1.5 text-xs" : "px-3 py-2.5 text-sm",
        className
      )}
    >
      <span className={cn("text-muted-foreground", isSelected && "text-primary/70", size === "sm" ? "text-[9px]" : "text-[10px]")}>
        {label}
      </span>
      <span className="mt-0.5 font-bold tabular-nums">{odds > 0 ? odds.toFixed(2) : "N/A"}</span>
    </button>
  );
}
