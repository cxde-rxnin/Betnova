import { AppSidebar } from "@/components/shared/app-sidebar";
import { AppHeader } from "@/components/shared/app-header";
import { BetSlip } from "@/components/shared/bet-slip";
import { KycGuard } from "@/components/shared/kyc-guard";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db/connect";
import { User } from "@/models/User";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  let kycStatus = "UNVERIFIED";
  
  if (session?.user?.id) {
    await connectToDatabase();
    const user = await User.findById(session.user.id).select("kycStatus").lean();
    if (user) kycStatus = user.kycStatus;
  }

  return (
    <div className="theme-marketing dark flex min-h-screen bg-background text-foreground">
      <KycGuard kycStatus={kycStatus} />
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <BetSlip />
    </div>
  );
}
