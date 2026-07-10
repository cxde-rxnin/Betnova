"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileNav } from "@/components/shared/profile-nav";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    
    updateProfile.mutate({ name, username });
  }

  if (isLoading) {
    return <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <PageHeader title="Profile" description="Manage your personal information." />
      <ProfileNav />
      <form className="space-y-4 rounded-xl border bg-card p-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="prof-name" className="mb-1.5">Full Name</Label>
            <Input id="prof-name" name="name" defaultValue={user?.name || ""} />
          </div>
          <div>
            <Label htmlFor="prof-username" className="mb-1.5">Username</Label>
            <Input id="prof-username" name="username" defaultValue={user?.username || ""} />
          </div>
        </div>
        <div>
          <Label htmlFor="prof-email" className="mb-1.5">Email (Cannot be changed)</Label>
          <Input id="prof-email" type="email" defaultValue={user?.email || ""} readOnly className="bg-muted/50 cursor-not-allowed" />
        </div>
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  );
}
