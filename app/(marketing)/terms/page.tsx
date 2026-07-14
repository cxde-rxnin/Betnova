import type { Metadata } from "next";
import { MarketingPageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Terms of Service | Betnovo",
  description: "The terms governing your use of the Betnovo platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using the Betnovo platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.",
  },
  {
    title: "2. Eligibility",
    body: "You must be at least 18 years old (or the legal gambling age in your jurisdiction) to use Betnovo. It is your responsibility to ensure that online betting is legal in your jurisdiction.",
  },
  {
    title: "3. Account Registration",
    body: "You must provide accurate information during registration. You are responsible for maintaining the confidentiality of your account credentials.",
  },
  {
    title: "4. Betting Rules",
    body: "All bets are subject to our betting rules and the specific rules for each sport and market. Betnovo reserves the right to void bets in cases of obvious errors or fraud.",
  },
  {
    title: "5. Deposits & Withdrawals",
    body: "Deposits are processed on-chain according to the selected asset. Withdrawal requests are subject to verification and anti-money laundering checks.",
  },
  {
    title: "6. Limitation of Liability",
    body: "Betnovo is provided \"as is\" without warranties of any kind. We are not liable for any losses resulting from the use of our platform.",
  },
  {
    title: "7. Changes to Terms",
    body: "We may update these terms at any time. Continued use of the platform constitutes acceptance of the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <>
      <MarketingPageHero eyebrow="Legal" title="Terms of Service" description="Last updated: July 7, 2026" />
      <div className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 rounded-2xl border border-border/60 bg-card p-8 sm:p-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-heading text-base font-semibold">{section.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
