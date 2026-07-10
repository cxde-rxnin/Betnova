import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db/connect";
import { User } from "@/models/User";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { KycUploadForm } from "@/features/profile/components/KycUploadForm";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, Clock, FileWarning } from "lucide-react";

export default async function KycPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await connectToDatabase();
  const user = await User.findById(session.user.id);
  if (!user) redirect("/login");

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <PageHeader title="Identity Verification" description="Securely upload your identification documents to verify your account." />

      <div className="p-6 rounded-xl border bg-card space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h3 className="text-lg font-semibold">Verification Status</h3>
            <p className="text-sm text-muted-foreground">This helps us keep the platform secure and compliant.</p>
          </div>
          <div>
            {user.kycStatus === "UNVERIFIED" && <Badge variant="secondary" className="bg-muted text-muted-foreground"><FileWarning className="w-3 h-3 mr-1" /> Unverified</Badge>}
            {user.kycStatus === "PENDING" && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600"><Clock className="w-3 h-3 mr-1" /> Pending Review</Badge>}
            {user.kycStatus === "VERIFIED" && <Badge variant="secondary" className="bg-green-500/10 text-green-600"><ShieldCheck className="w-3 h-3 mr-1" /> Verified</Badge>}
            {user.kycStatus === "REJECTED" && <Badge variant="secondary" className="bg-red-500/10 text-red-600"><ShieldAlert className="w-3 h-3 mr-1" /> Rejected</Badge>}
          </div>
        </div>

        {user.kycStatus === "UNVERIFIED" || user.kycStatus === "REJECTED" ? (
          <div className="space-y-4">
            {user.kycStatus === "REJECTED" && (
              <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-600">
                Your previous submission was rejected. Please ensure the document is clear, valid, and matches your profile details.
              </div>
            )}
            <KycUploadForm />
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              {user.kycStatus === "VERIFIED" ? <ShieldCheck className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
            </div>
            <h3 className="text-xl font-bold">
              {user.kycStatus === "VERIFIED" ? "Identity Verified" : "Review in Progress"}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {user.kycStatus === "VERIFIED" 
                ? "Your identity has been successfully verified. You have full access to all platform features."
                : "Your document is currently being reviewed by our compliance team. This usually takes up to 24 hours."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
