"use client";

import { useEffect, useState } from "react";
import { getAllUsers, approveKyc, rejectKyc } from "@/features/admin/actions";
import { PageHeader } from "@/components/shared/page-header";
import { Loader2, ExternalLink, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminKycPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = () => {
    getAllUsers().then(data => {
      // Filter only users who have uploaded documents (pending or already reviewed)
      setUsers(data.filter((u: any) => u.kycDocumentUrl));
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await approveKyc(userId);
      toast.success("KYC Approved");
      loadUsers();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await rejectKyc(userId);
      toast.success("KYC Rejected");
      loadUsers();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="KYC Verification" description="Review and approve user identity documents." showBack={false} />

      {isLoading ? <Loader2 className="animate-spin" /> : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map(user => (
            <div key={user._id} className="rounded-xl border bg-card overflow-hidden flex flex-col">
              <div className="p-4 border-b flex items-start justify-between bg-muted/20">
                <div>
                  <div className="font-medium text-foreground">{user.name || user.username}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
                <Badge variant="secondary" className={
                  user.kycStatus === "VERIFIED" ? "bg-green-500/10 text-green-600" :
                  user.kycStatus === "REJECTED" ? "bg-red-500/10 text-red-600" :
                  "bg-yellow-500/10 text-yellow-600"
                }>
                  {user.kycStatus}
                </Badge>
              </div>
              
              <div className="p-4 flex-1 flex flex-col items-center justify-center bg-muted/10 relative group">
                {/* We use standard img to avoid next/image domain config issues for arbitrary cloudinary paths if not configured fully */}
                <img 
                  src={user.kycDocumentUrl} 
                  alt="KYC Document" 
                  className="max-h-48 object-contain rounded-md shadow-sm border"
                />
                <Link href={user.kycDocumentUrl} target="_blank" className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm"><ExternalLink className="w-4 h-4 mr-2"/> View Full Size</Button>
                </Link>
              </div>

              {user.kycStatus === "PENDING" && (
                <div className="p-4 border-t flex gap-2">
                  <Button onClick={() => handleApprove(user._id)} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-2" /> Approve
                  </Button>
                  <Button onClick={() => handleReject(user._id)} variant="destructive" className="flex-1">
                    <X className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              )}
            </div>
          ))}

          {users.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border rounded-xl bg-card">
              No KYC documents submitted yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
