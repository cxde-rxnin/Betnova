"use client";

import { useEffect, useState } from "react";
import { getPlatformAlerts, resolvePlatformAlert } from "@/features/admin/actions";
import { PageHeader } from "@/components/shared/page-header";
import { Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResolving, setIsResolving] = useState<string | null>(null);

  const fetchAlerts = () => {
    getPlatformAlerts().then(data => {
      setAlerts(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (id: string) => {
    setIsResolving(id);
    try {
      await resolvePlatformAlert(id);
      toast.success("Alert resolved");
      fetchAlerts();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsResolving(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Platform Alerts" description="Operational warnings and fraud signals." showBack={false} />

      {isLoading ? <Loader2 className="animate-spin" /> : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border rounded-xl border-dashed">
          <ShieldCheck className="h-12 w-12 text-green-500 mb-4" />
          <p>No active alerts. Platform is healthy.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map(alert => (
            <div key={alert._id} className={cn(
              "rounded-xl border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4",
              !alert.resolved && alert.severity === "CRITICAL" ? "border-red-500/50 bg-red-500/5" : ""
            )}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn("h-5 w-5", 
                    alert.severity === "CRITICAL" ? "text-red-500" : 
                    alert.severity === "ERROR" ? "text-orange-500" : 
                    alert.severity === "WARNING" ? "text-amber-500" : "text-blue-500"
                  )} />
                  <span className="font-bold">{alert.type}</span>
                  <Badge variant="outline">{alert.category}</Badge>
                  {alert.resolved && <Badge className="bg-green-500/10 text-green-600 border-none hover:bg-green-500/20">RESOLVED</Badge>}
                </div>
                <p className="text-sm font-medium">{alert.message}</p>
                <div className="text-xs text-muted-foreground">
                  Source: {alert.source} • Created: {format(new Date(alert.createdAt), "PPpp")}
                </div>
              </div>

              {!alert.resolved && (
                <Button 
                  onClick={() => handleResolve(alert._id)} 
                  disabled={isResolving === alert._id}
                  variant="outline"
                >
                  {isResolving === alert._id ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Resolve"}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
