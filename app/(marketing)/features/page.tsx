import type { Metadata } from "next";
import {
  ShieldCheck,
  Zap,
  Globe,
  TrendingUp,
  Smartphone,
  Wallet,
  BarChart3,
  Clock,
} from "lucide-react";
import { MarketingPageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Features | Betnovo",
  description: "Real-time odds, crypto deposits, instant settlement, and a platform engineered for precision.",
};

const mainFeatures = [
  { 
    icon: Zap, 
    title: "Real-Time Odds", 
    desc: "Prices update the instant markets move — no stale lines, no delay between the action and your bet slip. Stay ahead of the game with our ultra-low latency infrastructure.",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800&auto=format&fit=crop"
  },
  { 
    icon: TrendingUp, 
    title: "In-Play Trading", 
    desc: "Place bets during live matches with dynamic odds that move with the action, second by second. Our live markets offer hundreds of in-game propositions.",
    image: "https://images.unsplash.com/photo-1518605368461-1e1e11afcd31?q=80&w=800&auto=format&fit=crop"
  },
  { 
    icon: Smartphone, 
    title: "Mobile Optimized", 
    desc: "A fully responsive platform tuned for touch — bet from anywhere, without compromise. The complete desktop experience seamlessly translates to your phone.",
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=800&auto=format&fit=crop"
  },
  { 
    icon: Wallet, 
    title: "Crypto Deposits", 
    desc: "Fund your account directly on-chain. No intermediaries, no waiting on bank rails. Experience instant deposits and lightning-fast withdrawals.",
    image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=800&auto=format&fit=crop"
  },
];

const secondaryFeatures = [
  { icon: ShieldCheck, title: "Bank-Grade Security", desc: "256-bit encryption, two-factor authentication, and continuous fraud monitoring." },
  { icon: Globe, title: "Global Coverage", desc: "Football, basketball, tennis, cricket, and more from leagues worldwide." },
  { icon: BarChart3, title: "Advanced Analytics", desc: "Access detailed statistics, form guides, and historical data to inform every position." },
  { icon: Clock, title: "24/7 Markets", desc: "Trade around the clock with events happening in every timezone, every day." },
];

export default function FeaturesPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Platform"
        title="Everything you need to trade sports markets"
        description="Built for speed, precision, and trust — engineered from the ground up as a real-time platform, not a traditional sportsbook."
      />
      
      {/* Main Z-Pattern Features */}
      <div className="border-b border-border/50 divide-y divide-border/30">
        {mainFeatures.map((f, i) => {
          const isEven = i % 2 !== 0;
          return (
            <Reveal key={f.title} delay={0.1} className="relative">
              <div className={cn(
                "flex flex-col lg:flex-row min-h-[420px]",
                isEven ? "lg:flex-row-reverse" : "lg:flex-row"
              )}>
                
                {/* Image — covers its half fully, no border, no card */}
                <div className="relative flex-1 min-h-[280px] lg:min-h-0 overflow-hidden">
                  <Image 
                    src={f.image} 
                    alt={f.title}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  {/* Gradient fade toward text side */}
                  <div className={cn(
                    "absolute inset-0",
                    isEven
                      ? "bg-gradient-to-r from-transparent to-background"
                      : "bg-gradient-to-l from-transparent to-background"
                  )} />
                </div>

                {/* Text Section */}
                <div className="flex-1 flex items-center px-8 py-16 sm:px-12 lg:px-20 relative">
                  {/* Subtle ambient glow */}
                  <div className="absolute inset-0 bg-background" />
                  <div className={cn(
                    "absolute h-64 w-64 rounded-full bg-primary/10 blur-3xl opacity-60 -z-0",
                    isEven ? "right-0 top-1/2 -translate-y-1/2" : "left-0 top-1/2 -translate-y-1/2"
                  )} />
                  <div className="relative z-10 space-y-6 max-w-lg">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                      <f.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight">
                      {f.title}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>

              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Secondary Features Grid */}
      <div className="py-20 sm:py-28 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">And so much more</h2>
            <p className="mt-4 text-lg text-muted-foreground">Everything you need, built right in.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {secondaryFeatures.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <div className="h-full p-6">
                  <div className="mb-5 inline-flex rounded-lg bg-primary/10 p-2.5 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
