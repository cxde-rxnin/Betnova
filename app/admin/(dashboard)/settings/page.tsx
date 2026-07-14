"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [maintenance, setMaintenance] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved");
    }, 900);
  }

  return (
    <form className="max-w-2xl space-y-8 animate-fade-in" onSubmit={handleSave}>
      <PageHeader title="System Settings" description="Configure platform-wide settings." />

      <div className="rounded-xl border bg-card p-6 space-y-6">
        <h3 className="font-semibold">General</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="set-name" className="mb-1.5">Platform Name</Label>
            <Input id="set-name" defaultValue="Betnovo" />
          </div>
          <div>
            <Label htmlFor="set-email" className="mb-1.5">Support Email</Label>
            <Input id="set-email" defaultValue="support@betnovo.com" />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Maintenance Mode</p><p className="text-xs text-muted-foreground">Disable public access temporarily.</p></div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" checked={maintenance} onChange={(e) => setMaintenance(e.target.checked)} />
              <div className="h-6 w-11 rounded-full bg-muted transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-6">
        <h3 className="font-semibold">Betting Limits</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="set-min" className="mb-1.5">Min Bet ($)</Label>
            <Input id="set-min" type="number" defaultValue="1" />
          </div>
          <div>
            <Label htmlFor="set-max" className="mb-1.5">Max Bet ($)</Label>
            <Input id="set-max" type="number" defaultValue="10000" />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </form>
  );
}
