"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileNav } from "@/components/shared/profile-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Shield, Smartphone, Loader2 } from "lucide-react";

export default function SecurityPage() {
  const [updating, setUpdating] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUpdating(true);

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("sec-current") as string;
    const newPassword = formData.get("sec-new") as string;
    const confirmPassword = formData.get("sec-confirm") as string;

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      setUpdating(false);
      return;
    }

    try {
      const res = await fetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update password");
      } else {
        toast.success("Password updated successfully");
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setUpdating(false);
    }
  }


  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <PageHeader title="Security" description="Manage your password and two-factor authentication." />
      <ProfileNav />

      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold">Change Password</h3>
        <form className="mt-4 space-y-4" onSubmit={handlePasswordSubmit}>
          <div>
            <Label htmlFor="sec-current" className="mb-1.5">Current Password</Label>
            <PasswordInput id="sec-current" name="sec-current" placeholder="••••••••" required />
          </div>
          <div>
            <Label htmlFor="sec-new" className="mb-1.5">New Password</Label>
            <PasswordInput id="sec-new" name="sec-new" placeholder="••••••••" required minLength={8} />
          </div>
          <div>
            <Label htmlFor="sec-confirm" className="mb-1.5">Confirm New Password</Label>
            <PasswordInput id="sec-confirm" name="sec-confirm" placeholder="••••••••" required minLength={8} />
          </div>
          <Button type="submit" disabled={updating}>
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary"><Shield className="h-5 w-5" /></div>
            <div>
              <h3 className="font-semibold">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                {twoFactor ? "Two-factor authentication is enabled." : "Add an extra layer of security to your account."}
              </p>
            </div>
          </div>
          <Button
            variant={twoFactor ? "outline" : "default"}
            size="sm"
            onClick={() => {
              setTwoFactor((v) => !v);
              toast.success(twoFactor ? "Two-factor authentication disabled" : "Two-factor authentication enabled");
            }}
          >
            {twoFactor ? "Disable" : "Enable"}
          </Button>
        </div>
      </div>
    </div>
  );
}
