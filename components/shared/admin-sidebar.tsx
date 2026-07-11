"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Users, Wallet, Activity, ShieldCheck, FileText, ServerCog, AlertTriangle, MessageSquare, LogOut, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useUIStore } from "@/lib/store/ui-store";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r bg-card flex flex-col p-4 space-y-2 transition-transform duration-300 lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent setSidebarOpen={setSidebarOpen} pathname={pathname} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 border-r bg-card/50 flex-col p-4 space-y-2 sticky top-0 h-screen shrink-0">
        <SidebarContent setSidebarOpen={setSidebarOpen} pathname={pathname} />
      </div>
    </>
  );
}

function SidebarContent({ setSidebarOpen, pathname }: { setSidebarOpen: (v: boolean) => void, pathname: string }) {
  return (
    <>
      <div className="flex items-center justify-between px-2 py-4 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-bold">Operations Hub</h2>
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSidebarOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <nav className="flex-1 overflow-y-auto space-y-1 px-1">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
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
      </nav>
      
      <div className="shrink-0 pt-4 mt-auto">
        <button
          onClick={() => {
            setSidebarOpen(false);
            signOut({ callbackUrl: "/admin/login" });
          }}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium text-red-500 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </>
  );
}
