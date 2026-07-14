import Link from "next/link";
import { MessageSquare, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingPageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";

export default function ContactPage() {
  return (
    <>
      <MarketingPageHero
        eyebrow="Contact"
        title="Talk to the Betnovo team"
        description="Questions about markets, deposits, or your account? Our support team is ready to help."
      />
      <div className="py-20 sm:py-28">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <Reveal>
            <div className="flex flex-col items-center text-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquare className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Live Support Chat</h2>
                <p className="text-muted-foreground max-w-sm">
                  Our support is handled directly through your account dashboard. Log in to start a live conversation with our team instantly.
                </p>
              </div>
              <Button size="lg" className="gap-2 rounded-full px-8">
                <Link href="/login">
                  Log in to get support
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
