"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  showBack?: boolean;
}

export function PageHeader({ title, description, children, className, showBack = true }: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-start gap-3">
        {showBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 mt-0.5 shrink-0 rounded-full hover:bg-muted" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children && <div className="mt-3 flex items-center gap-2 sm:mt-0">{children}</div>}
    </div>
  );
}
