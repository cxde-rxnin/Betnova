"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Users, Wallet, Activity, ShieldCheck, FileText, ServerCog, AlertTriangle, MessageSquare, LogOut, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: Activity, exact: true },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "KYC Reviews", href: "/admin/kyc", icon: ShieldCheck },
  { name: "Live Support", href: "/admin/support", icon: MessageSquare },
  { name: "Bets", href: "/admin/bets", icon: Ticket },
  { name: "Finances", href: "/admin/finances", icon: Wallet },
  { name: "Risk Rules", href: "/admin/risk", icon: ShieldAlert },
  { name: "Platform Alerts", href: "/admin/alerts", icon: AlertTriangle },
  { name: "Queue & Jobs", href: "/admin/jobs", icon: ServerCog },
  { name: "Audit Logs", href: "/admin/audit", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-full lg:w-64 border-r bg-card/50 flex flex-col p-4 space-y-2">
      <div className="flex items-center gap-2 px-2 py-4 mb-2">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h2 className="text-lg font-bold">Operations Hub</h2>
      </div>
      
      {navItems.map((item) => {
        const isActive = item.exact 
          ? pathname === item.href 
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
      <div className="flex-1" />
      
      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="flex w-full items-center gap-3 px-3 py-2 mt-auto rounded-md transition-colors text-sm font-medium text-red-500 hover:bg-red-500/10"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </button>
    </div>
  );
}
