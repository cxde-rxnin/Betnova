import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Users, Activity, AlertTriangle, ShieldCheck } from "lucide-react";
import connectToDatabase from "@/lib/db/connect";
import { User } from "@/models/User";
import { PlatformAlert } from "@/models/PlatformAlert";
import { Bet } from "@/models/Bet";

export default async function AdminDashboardPage() {
  await connectToDatabase();
  
  const totalUsers = await User.countDocuments();
  const activeAlerts = await PlatformAlert.countDocuments({ resolved: false });
  const pendingBets = await Bet.countDocuments({ status: "PENDING" });
  
  // Aggregate total exposure (potential payouts of pending bets)
  const exposureResult = await Bet.aggregate([
    { $match: { status: "PENDING" } },
    { $group: { _id: null, totalExposure: { $sum: "$potentialPayout" } } }
  ]);
  const totalExposure = exposureResult[0]?.totalExposure || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Operations Dashboard" description="High-level overview of platform health and risk." showBack={false} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={totalUsers.toString()} icon={Users} />
        <StatCard title="Active Pending Bets" value={pendingBets.toString()} icon={Activity} />
        <StatCard 
          title="Total Exposure (Liability)" 
          value={`$${totalExposure.toFixed(2)}`} 
          icon={ShieldCheck} 
          className="border-primary/20 bg-primary/5"
        />
        <StatCard 
          title="Active Fraud/Risk Alerts" 
          value={activeAlerts.toString()} 
          icon={AlertTriangle} 
          className={activeAlerts > 0 ? "border-red-500/50 bg-red-500/10 text-red-600" : ""}
        />
      </div>
      
      {/* Additional widgets can be added here */}
    </div>
  );
}
