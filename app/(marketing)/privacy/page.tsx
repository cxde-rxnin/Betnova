import type { Metadata } from "next";
import { MarketingPageHero } from "@/components/marketing/page-hero";

export const metadata: Metadata = {
  title: "Privacy Policy | Betnova",
  description: "How Betnova collects, uses, and protects your information.",
};

const sections = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide directly, including your name, email address, and wallet details. We also collect usage data automatically through cookies and analytics.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use your information to provide and improve our services, process transactions, communicate with you, and comply with legal obligations.",
  },
  {
    title: "3. Data Security",
    body: "We implement industry-standard security measures, including encryption and secure access controls, to protect your personal information.",
  },
  {
    title: "4. Sharing of Information",
    body: "We do not sell your personal information. We may share data with trusted service providers who assist in operating our platform, subject to strict confidentiality agreements.",
  },
  {
    title: "5. Your Rights",
    body: "You have the right to access, correct, or delete your personal information. Contact us at privacy@betnova.com for any data-related requests.",
  },
  {
    title: "6. Cookies",
    body: "We use cookies to enhance your experience. You can manage cookie preferences through your browser settings.",
  },
  {
    title: "7. Changes to This Policy",
    body: "We may update this policy periodically. We will notify you of any material changes via email or through the platform.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <MarketingPageHero eyebrow="Legal" title="Privacy Policy" description="Last updated: July 7, 2026" />
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
