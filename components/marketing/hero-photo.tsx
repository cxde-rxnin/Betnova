"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { STOCK_IMAGES } from "@/lib/constants/images";

export function HeroPhoto() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:mx-0">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border/60"
      >
        <Image
          src="/hero-stadium.png"
          alt="Packed stadium arena under dramatic lights, mid-match"
          fill
          priority
          sizes="(min-width: 1024px) 32rem, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent mix-blend-overlay" />
      </motion.div>

      {/* Floating live stat chip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
        className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl border border-white/10 bg-background/70 p-4 backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
          </span>
          <span className="text-xs font-semibold text-foreground">68,204 watching live</span>
        </div>
        <span className="rounded-md bg-primary/15 px-2 py-1 text-[11px] font-semibold text-primary">2,100+ markets</span>
      </motion.div>
    </div>
  );
}
