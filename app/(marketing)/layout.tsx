import { MarketingNav } from "@/components/shared/marketing-nav";
import { Footer } from "@/components/shared/footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-marketing dark flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
