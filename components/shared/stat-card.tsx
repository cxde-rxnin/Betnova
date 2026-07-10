import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 transition-shadow hover:shadow-md", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {(description || trend) && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          {trend && (
            <span className={cn("font-medium", trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
              {trend.positive ? "+" : ""}{trend.value}%
            </span>
          )}
          {description && <span className="text-muted-foreground">{description}</span>}
        </div>
      )}
    </div>
  );
}
