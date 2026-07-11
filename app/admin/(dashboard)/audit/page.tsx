"use client";

import { useEffect, useState } from "react";
import { getAuditLogs } from "@/features/admin/actions";
import { PageHeader } from "@/components/shared/page-header";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAuditLogs().then(data => {
      setLogs(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Audit Logs" description="Immutable record of administrative actions." showBack={false} />

      {isLoading ? <Loader2 className="animate-spin" /> : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Admin</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Resource</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map(log => (
                <tr key={log._id} className="hover:bg-muted/30">
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.createdAt), "PPpp")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{log.adminId?.name || log.adminId?.email}</div>
                    <div className="text-xs text-muted-foreground">{log.adminId?.role}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs">{log.resource}</div>
                    <div className="text-xs text-muted-foreground break-all">{log.resourceId}</div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
