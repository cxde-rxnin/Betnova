"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileNav } from "@/components/shared/profile-nav";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="h-6 w-11 rounded-full bg-muted transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
      </label>
    </div>
  );
}

export default function PreferencesPage() {
  const [oddsFormat, setOddsFormat] = useState("Decimal");
  const [currency, setCurrency] = useState("USD");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Preferences saved");
    }, 800);
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <PageHeader title="Preferences" description="Customize your experience." />
      <ProfileNav />

      <div className="space-y-6 rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Odds Format</h3>
            <p className="text-sm text-muted-foreground">How odds are displayed.</p>
          </div>
          <select
            value={oddsFormat}
            onChange={(e) => setOddsFormat(e.target.value)}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm"
          >
            <option>Decimal</option>
            <option>Fractional</option>
            <option>American</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Currency</h3>
            <p className="text-sm text-muted-foreground">Display currency for balances.</p>
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm"
          >
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </div>
        <ToggleRow title="Email Notifications" description="Receive updates via email." checked={emailNotifs} onChange={setEmailNotifs} />
        <ToggleRow title="Push Notifications" description="Bet updates and live alerts." checked={pushNotifs} onChange={setPushNotifs} />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          "Save Preferences"
        )}
      </Button>
    </div>
  );
}
