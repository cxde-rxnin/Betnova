import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/shared/logo";
import { STOCK_IMAGES } from "@/lib/constants/images";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-marketing dark flex min-h-screen bg-background text-foreground">
      {/* Left: Branding panel (hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden border-r border-border/60 lg:flex">
        <Image
          src={STOCK_IMAGES.basketballNet}
          alt="Basketball dropping through the net under stadium lights"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />

        <div className="absolute left-8 top-8 z-10">
          <Link href="/">
            <Logo size="md" />
          </Link>
        </div>
        <div className="relative z-10 mt-auto max-w-sm px-12 pb-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-balance">Bet smarter. Trade every moment.</h2>
          <p className="mt-3 text-muted-foreground">Real-time markets, crypto deposits, instant settlement.</p>
        </div>
      </div>
      {/* Right: Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
        <div className="mb-8 lg:hidden">
          <Link href="/">
            <Logo size="lg" />
          </Link>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
