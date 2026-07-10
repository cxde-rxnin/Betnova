import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, UserPlus, Wallet, LineChart, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingPageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "How It Works | Betnova",
  description: "From sign-up to your first trade in four simple steps.",
};

const steps = [
  { 
    icon: UserPlus, 
    title: "Create an account", 
    desc: "Sign up in under a minute with just your email. No lengthy verification queues.",
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=800&auto=format&fit=crop"
  },
  { 
    icon: Wallet, 
    title: "Deposit crypto", 
    desc: "Fund your wallet directly with the assets you already hold — instant, on-chain.",
    image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=800&auto=format&fit=crop"
  },
  { 
    icon: LineChart, 
    title: "Browse live markets", 
    desc: "Explore live and upcoming events. Analyze odds, build your bet slip, place a position.",
    image: "https://images.unsplash.com/photo-1518605368461-1e1e11afcd31?q=80&w=800&auto=format&fit=crop"
  },
  { 
    icon: Trophy, 
    title: "Win & withdraw", 
    desc: "Watch markets settle in real time. Withdraw your winnings in seconds, not days.",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop"
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Get started"
        title="How Betnova works"
        description="Four steps between you and your first live market."
      />
      <div className="divide-y divide-border/30">
        {steps.map((step, i) => {
          const isEven = i % 2 !== 0;
          return (
            <Reveal key={step.title} delay={0.1} className="relative">
              <div className={cn(
                "flex flex-col lg:flex-row min-h-[420px]",
                isEven ? "lg:flex-row-reverse" : "lg:flex-row"
              )}>

                {/* Image — full-bleed, no card */}
                <div className="relative flex-1 min-h-[280px] lg:min-h-0 overflow-hidden">
                  <Image 
                    src={step.image} 
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className={cn(
                    "absolute inset-0",
                    isEven
                      ? "bg-gradient-to-r from-transparent to-background"
                      : "bg-gradient-to-l from-transparent to-background"
                  )} />
                </div>

                {/* Text Section */}
                <div className="flex-1 flex items-center px-8 py-16 sm:px-12 lg:px-20 relative">
                  <div className="absolute inset-0 bg-background" />
                  {/* Huge background step number */}
                  <span className="absolute bottom-4 right-6 text-[160px] font-black leading-none text-muted/10 select-none z-0 hidden lg:block">
                    0{i + 1}
                  </span>
                  <div className={cn(
                    "absolute h-64 w-64 rounded-full bg-primary/10 blur-3xl opacity-60 -z-0",
                    isEven ? "right-0 top-1/2 -translate-y-1/2" : "left-0 top-1/2 -translate-y-1/2"
                  )} />
                  <div className="relative z-10 space-y-6 max-w-lg">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                      <step.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>

              </div>
            </Reveal>
          );
        })}
        
        <div className="py-24 text-center bg-background">
          <Button nativeButton={false} size="lg" render={<Link href="/register" />} className="h-14 px-8 text-lg font-semibold shadow-xl shadow-primary/20">
            Start Betting Now <ArrowRight className="ml-2 h-5 w-5" data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </>
  );
}
