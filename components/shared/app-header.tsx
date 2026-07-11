"use client";

import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUIStore } from "@/lib/store/ui-store";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { GlobalSearch } from "@/features/sportsbook/components/GlobalSearch";
import { BetSlip } from "@/features/betting/components/BetSlip";
import { useNotifications } from "@/features/notifications/hooks";

export function AppHeader() {
  const { setSidebarOpen } = useUIStore();
  const { data: session } = useSession();
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter((notification: any) => !notification.read).length || 0;

  const user = session?.user;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-lg px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => useUIStore.getState().toggleSidebar()} aria-label="Toggle menu">
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 md:w-auto md:flex-none ml-4">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2">
        <Link href="/notifications" className="relative inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted transition-colors">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="inline-flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted transition-colors cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {user?.name ? user.name.split(" ").map((n) => n[0]).join("") : user?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name || user?.username || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem><Link href="/profile" className="w-full">Profile</Link></DropdownMenuItem>
            <DropdownMenuItem><Link href="/wallet" className="w-full">Wallet</Link></DropdownMenuItem>
            <DropdownMenuItem><Link href="/profile/preferences" className="w-full">Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="w-full cursor-pointer">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
