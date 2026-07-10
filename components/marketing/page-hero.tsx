import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MarketingPageHero({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  className?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_at_top,_#052e16_0%,_#000000_55%,_#030712_100%)]">
      {/* Ambient glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-48 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="bg-grid absolute inset-0 -z-10 opacity-[0.15] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_0%,black_30%,transparent_100%)]" />
      <div className={cn("mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 relative z-10", className)}>
        {eyebrow && (
          <span className="inline-flex rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary/80">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 text-lg text-pretty text-muted-foreground">{description}</p>}
      </div>
    </section>
  );
}
