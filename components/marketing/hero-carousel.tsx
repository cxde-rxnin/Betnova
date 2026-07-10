"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: "welcome-bonus",
    image: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=1200&auto=format&fit=crop",
    badge: "Welcome Offer",
    title: "100% Deposit Match",
    description: "Double your bankroll instantly when you deposit using supported crypto assets. Claim up to $500 in bonus funds today.",
    primaryAction: { label: "Claim Bonus", href: "/register" },
    secondaryAction: { label: "View Terms", href: "/promotions" }
  },
  {
    id: "live-action",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200&auto=format&fit=crop",
    badge: "Live Markets",
    title: "Bet In-Play globally",
    description: "Experience ultra-low latency odds on thousands of live events. Trade every pitch, every possession, every second.",
    primaryAction: { label: "Bet Live Now", href: "/sports?tab=live" },
    secondaryAction: { label: "All Sports", href: "/sports" }
  },
  {
    id: "leaderboard",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1200&auto=format&fit=crop",
    badge: "Competitions",
    title: "Top the Leaderboard",
    description: "Make correct predictions on headline matches to earn points and win weekly cash prizes from the community pool.",
    primaryAction: { label: "Make Predictions", href: "/predictions" },
    secondaryAction: { label: "View Leaderboard", href: "/leaderboard" }
  }
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const slide = slides[currentIndex];

  return (
    <section 
      className="relative overflow-hidden bg-card/40 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-[360px] md:h-[480px] w-full">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              className="object-cover opacity-60"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        
        {/* Content */}
        <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-8 md:px-16 max-w-2xl z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-md mb-4 w-fit">
                <Flame className="h-3.5 w-3.5" /> {slide.badge}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
                {slide.title}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-lg">
                {slide.description}
              </p>
              <div className="flex gap-4">
                <Button nativeButton={false} size="lg" render={<Link href="/register" />} className="shadow-lg shadow-primary/20">
                  Sign Up
                </Button>
                <Button nativeButton={false} size="lg" variant="outline" render={<Link href="/login" />} className="backdrop-blur-md bg-background/30">
                  Login
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute inset-y-0 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-background/50 backdrop-blur-md border-border/50 hover:bg-background/80"
            onClick={() => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-background/50 backdrop-blur-md border-border/50 hover:bg-background/80"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {slides.map((_, i) => (
            <button
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-primary/30 hover:bg-primary/50"
              )}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
