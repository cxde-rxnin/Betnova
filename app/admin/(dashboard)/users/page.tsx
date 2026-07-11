"use client";

import { useEffect, useState } from "react";
import { getAllUsers } from "@/features/admin/actions";
import { PageHeader } from "@/components/shared/page-header";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Ban, CheckCircle, Wallet as WalletIcon, ShieldCheck, Check, X } from "lucide-react";
import { toggleUserSuspension, adjustUserBalance, approveKyc, rejectKyc } from "@/features/admin/actions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  const loadUsers = () => {
    getAllUsers().then(data => {
      setUsers(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleSuspend = async (userId: string, currentStatus: string) => {
    try {
      await toggleUserSuspension(userId, currentStatus === "ACTIVE");
      toast.success(`User ${currentStatus === "ACTIVE" ? "suspended" : "unsuspended"}`);
      loadUsers();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser || !adjustAmount || !adjustReason) return;
    try {
      await adjustUserBalance(selectedUser._id, "USDT", parseFloat(adjustAmount), adjustReason);
      toast.success("Balance adjusted successfully");
      setIsAdjustOpen(false);
      loadUsers();
      setAdjustAmount("");
      setAdjustReason("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleKycStatus = async (userId: string, action: "APPROVE" | "REJECT") => {
    try {
      if (action === "APPROVE") {
        await approveKyc(userId);
        toast.success("User KYC forcefully approved");
      } else {
        await rejectKyc(userId);
        toast.success("User KYC forcefully rejected");
      }
      loadUsers();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="User Management" description="View and manage platform users." showBack={false} />

      {isLoading ? <Loader2 className="animate-spin" /> : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">KYC</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(user => (
                <tr key={user._id} className="hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{user.name || user.username}</div>
                    <div className="text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">{user.role}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className={user.status === "ACTIVE" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={user.kycStatus === "VERIFIED" ? "bg-green-500/10 text-green-600 border-green-200" : user.kycStatus === "PENDING" ? "bg-yellow-500/10 text-yellow-600 border-yellow-200" : user.kycStatus === "REJECTED" ? "bg-red-500/10 text-red-600 border-red-200" : "bg-gray-500/10 text-gray-600"}>
                      {user.kycStatus || "UNVERIFIED"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {format(new Date(user.createdAt), "PP")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedUser(user);
                          setIsAdjustOpen(true);
                        }}>
                          <WalletIcon className="mr-2 h-4 w-4" />
                          Adjust Balance
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className={user.status === "ACTIVE" ? "text-red-600" : "text-green-600"}
                          onClick={() => handleToggleSuspend(user._id, user.status)}
                        >
                          {user.status === "ACTIVE" ? (
                            <><Ban className="mr-2 h-4 w-4" /> Suspend Account</>
                          ) : (
                            <><CheckCircle className="mr-2 h-4 w-4" /> Unsuspend Account</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            KYC Status
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleKycStatus(user._id, "APPROVE")} disabled={user.kycStatus === "VERIFIED"}>
                              <Check className="mr-2 h-4 w-4" /> Force Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleKycStatus(user._id, "REJECT")} disabled={user.kycStatus === "REJECTED"}>
                              <X className="mr-2 h-4 w-4" /> Force Reject
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust User Balance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>User</Label>
              <Input disabled value={selectedUser?.email || ""} />
            </div>
            <div className="space-y-2">
              <Label>Current USDT Balance</Label>
              <Input disabled value={`$${selectedUser?.wallets?.find((w: any) => w.currency === "USDT")?.availableBalance || 0}`} />
            </div>
            <div className="space-y-2">
              <Label>Adjustment Amount (use negative for deduction)</Label>
              <Input 
                type="number" 
                placeholder="e.g. 100 or -50" 
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Reason (Required for Ledger)</Label>
              <Input 
                placeholder="e.g. Courtesy Bonus" 
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjustBalance}>Apply Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
