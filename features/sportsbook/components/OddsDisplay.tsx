"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface OddsDisplayProps {
  odds: number;
  label: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  onClick?: () => void;
  isSelected?: boolean;
  disabled?: boolean;
}

export function OddsDisplay({ odds, label, className, size = "default", onClick, isSelected, disabled }: OddsDisplayProps) {
  const [trend, setTrend] = useState<"up" | "down" | "none">("none");
  const [prevOdds, setPrevOdds] = useState(odds);

  useEffect(() => {
    if (odds > prevOdds) {
      setTrend("up");
    } else if (odds < prevOdds) {
      setTrend("down");
    }
    setPrevOdds(odds);

    const timer = setTimeout(() => {
      setTrend("none");
    }, 2000);

    return () => clearTimeout(timer);
  }, [odds, prevOdds]);

  return (
    <Button 
      variant={isSelected ? "default" : "outline"}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col gap-1 h-auto py-2 transition-all relative overflow-hidden",
        trend === "up" && !isSelected && "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400",
        trend === "down" && !isSelected && "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400",
        isSelected && "bg-primary text-primary-foreground border-primary",
        className
      )}
    >
      <span className={cn("text-xs font-normal", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>{label}</span>
      <div className="flex items-center gap-1">
        <span className="font-semibold">{odds.toFixed(2)}</span>
        {trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
        {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
      </div>
    </Button>
  );
}
