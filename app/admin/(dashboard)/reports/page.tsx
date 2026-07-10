import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { TrendingUp, Users, Ticket, DollarSign } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Reports" description="Platform analytics and insights." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Monthly Revenue" value="$84,520" icon={DollarSign} trend={{ value: 12.5, positive: true }} description="vs last month" />
        <StatCard title="New Users" value="1,247" icon={Users} trend={{ value: 8.3, positive: true }} description="this month" />
        <StatCard title="Bets Placed" value="18,492" icon={Ticket} trend={{ value: 15.7, positive: true }} description="this month" />
        <StatCard title="Avg. Bet Size" value="$42.30" icon={TrendingUp} trend={{ value: 2.1, positive: false }} description="vs last month" />
      </div>
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Detailed charts and analytics will be available in a future update.</p>
      </div>
    </div>
  );
}
