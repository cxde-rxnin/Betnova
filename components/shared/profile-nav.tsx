"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { label: "Personal Info", href: "/profile" },
  { label: "Security", href: "/profile/security" },
  { label: "Verification", href: "/profile/kyc" },
  { label: "Preferences", href: "/profile/preferences" },
];

export function ProfileNav() {
  const pathname = usePathname();

  return (
    <div className="inline-flex w-fit items-center gap-1 rounded-full bg-muted p-1">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
