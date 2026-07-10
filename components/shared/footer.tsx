import Link from "next/link";
import { X as XIcon, MessageCircle, Send } from "lucide-react";
import { Logo } from "@/components/shared/logo";

const footerLinks = {
  product: [
    { label: "Sports", href: "/sports" },
    { label: "Features", href: "/features" },
    { label: "How It Works", href: "/how-it-works" },
  ],
  company: [
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

const social = [
  { label: "X", href: "https://x.com", icon: XIcon },
  { label: "Discord", href: "https://discord.com", icon: MessageCircle },
  { label: "Telegram", href: "https://telegram.org", icon: Send },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 relative overflow-hidden bg-[radial-gradient(ellipse_at_bottom_left,_#052e16_0%,_#000000_50%,_#030712_100%)]">
      {/* Abstract green glow blobs */}
      <div className="absolute bottom-0 left-0 w-96 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-10 lg:grid-cols-6 lg:gap-8">
          <div className="lg:col-span-2">
            <Logo size="md" />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Real-time sports markets, settled instantly. A premium platform for the modern bettor.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <item.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="mt-3 space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-3 space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Legal</h4>
            <ul className="mt-3 space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Betnova. All rights reserved.</p>
          <p>Betting involves risk. Please play responsibly.</p>
        </div>
      </div>
    </footer>
  );
}
