import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  variant?: "spinner" | "skeleton";
  text?: string;
  rows?: number;
  className?: string;
}

export function LoadingState({ variant = "spinner", text, rows = 3, className }: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-16", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && <p className="mt-3 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
