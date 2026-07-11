"use client";

import { useEffect, useState } from "react";
import { getQueueMetrics, getJobs } from "@/features/admin/actions";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Loader2, ServerCog, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminJobsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getQueueMetrics(), getJobs()]).then(([m, j]) => {
      setMetrics(m);
      setJobs(j);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Queue Architecture" description="Monitor background jobs, worker health, and throughput." showBack={false} />

      {isLoading ? <Loader2 className="animate-spin" /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Pending" value={metrics?.pendingCount?.toString() || "0"} icon={Clock} />
            <StatCard title="Processing" value={metrics?.processingCount?.toString() || "0"} icon={ServerCog} />
            <StatCard title="Completed" value={metrics?.completedCount?.toString() || "0"} icon={CheckCircle} className="text-green-600" />
            <StatCard title="Failed" value={metrics?.failedCount?.toString() || "0"} icon={XCircle} className="text-amber-600" />
            <StatCard title="Dead Letter" value={metrics?.deadLetterCount?.toString() || "0"} icon={XCircle} className="border-red-500/50 bg-red-500/10 text-red-600" />
          </div>

          <div className="rounded-xl border bg-card overflow-hidden mt-8">
            <div className="p-4 border-b font-semibold bg-muted/30">Recent Jobs</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Job Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Attempts</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jobs.map(job => (
                    <tr key={job._id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium">{job.name}</td>
                      <td className="px-6 py-4">
                        <Badge variant={job.status === "COMPLETED" ? "default" : job.status === "FAILED" || job.status === "DEAD_LETTER" ? "destructive" : "secondary"}>
                          {job.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">{job.priority}</td>
                      <td className="px-6 py-4">{job.attempts} / {job.maxAttempts}</td>
                      <td className="px-6 py-4">{job.duration ? `${job.duration}ms` : "-"}</td>
                      <td className="px-6 py-4 text-muted-foreground">{format(new Date(job.createdAt), "PPp")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
