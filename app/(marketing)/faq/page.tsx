"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketingPageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";

const faqs = [
  { q: "What is Betnova?", a: "Betnova is a real-time sports betting platform. We combine live sports markets with crypto-powered deposits and instant settlement — built more like a trading platform than a traditional sportsbook." },
  { q: "How do I create an account?", a: "Click \"Sign Up\" and provide your email address and a password. Verification is quick and straightforward." },
  { q: "What sports can I trade?", a: "Football, basketball, tennis, cricket, baseball, ice hockey, MMA, esports, and more — with thousands of markets updated daily." },
  { q: "How do deposits and withdrawals work?", a: "Betnova is crypto-native: fund your wallet directly on-chain. Deposits are instant, and withdrawals settle in seconds once a market resolves." },
  { q: "Is my data and funds secure?", a: "Yes. We use 256-bit encryption, two-factor authentication, and on-chain verifiable transactions, following industry best practices throughout." },
  { q: "What are the minimum and maximum position sizes?", a: "Minimum positions start small. Maximum sizes vary by market and are always clearly displayed before you confirm a bet." },
  { q: "Can I trade live, in-play markets?", a: "Yes — our in-play markets update odds in real time as the action unfolds, so you can trade throughout the event." },
  { q: "How do I contact support?", a: "Reach our team via the Contact page, email, or in-app chat. We aim to respond within minutes, 24/7." },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <MarketingPageHero
        eyebrow="Support"
        title="Frequently asked questions"
        description="Everything you need to know about trading on Betnova."
      />
      <div className="py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <Reveal key={faq.q} delay={i * 0.03}>
                  <div className="rounded-2xl border border-border/60 bg-card">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-2xl p-5 text-left text-sm font-medium transition-colors hover:bg-muted/40"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      aria-expanded={isOpen}
                    >
                      {faq.q}
                      <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                    </button>
                    <div className={cn("overflow-hidden transition-all", isOpen ? "max-h-60 px-5 pb-5" : "max-h-0")}>
                      <p className="text-sm text-muted-foreground">{faq.a}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
