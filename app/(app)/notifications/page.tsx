"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, CheckCircle2, AlertCircle, Info, AlertTriangle, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/features/notifications/hooks";

const categoryIconMap: Record<string, any> = {
  FINANCIAL: CheckCircle2,
  BETTING: Info,
  ACCOUNT: AlertCircle,
  OPERATIONAL: AlertTriangle,
};

const categoryColorMap: Record<string, string> = {
  FINANCIAL: "text-green-500 bg-green-500/10",
  BETTING: "text-blue-500 bg-blue-500/10",
  ACCOUNT: "text-purple-500 bg-purple-500/10",
  OPERATIONAL: "text-orange-500 bg-orange-500/10",
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

  function toggleRead(id: string, currentlyRead: boolean) {
    if (!currentlyRead) {
      markRead(id);
    }
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <PageHeader title="Notifications" description="Stay up to date with your activity.">
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead()} disabled={isMarkingAll}>
            {isMarkingAll ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-1 h-4 w-4" />} 
            Mark all as read
          </Button>
        )}
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : !notifications || notifications.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="New notifications will appear here." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n: any) => {
            const Icon = categoryIconMap[n.category] || Info;
            return (
              <button
                key={n._id}
                type="button"
                onClick={() => toggleRead(n._id, n.read)}
                className={cn(
                  "flex w-full gap-4 rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/30",
                  !n.read && "border-primary/20 bg-primary/[0.02]"
                )}
              >
                <div className={cn("mt-0.5 h-fit rounded-lg p-2", categoryColorMap[n.category] || categoryColorMap.OPERATIONAL)}><Icon className="h-4 w-4" /></div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold">{n.title}</h3>
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
