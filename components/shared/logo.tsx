"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center", className)}>
      {showText && (
        <span className={cn("font-heading font-bold tracking-tight", textSizes[size])}>
          Betnovo
        </span>
      )}
    </div>
  );
}
