"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Radio, Trophy, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Live", href: "/live", icon: Radio },
  { label: "Sports", href: "/sports", icon: Trophy },
  { label: "Predictions", href: "/predictions", icon: Lightbulb },
];

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Logo size="md" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button nativeButton={false} variant="ghost" size="sm" render={<Link href="/login" />}>
            Log In
          </Button>
          <Button nativeButton={false} size="sm" render={<Link href="/register" />}>
            Sign Up
          </Button>
        </div>

        {/* Mobile Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border/60 transition-all duration-300 lg:hidden",
          mobileOpen ? "max-h-96" : "max-h-0 border-t-0"
        )}
      >
        <div className="space-y-1 px-4 pb-4 pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-3">
            <Button nativeButton={false} variant="outline" size="sm" render={<Link href="/login" />}>
              Log In
            </Button>
            <Button nativeButton={false} size="sm" render={<Link href="/register" />}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
