"use client";

import { useEffect, useState } from "react";
import { getRiskConfig, updateRiskConfig } from "@/features/admin/actions";
import { PageHeader } from "@/components/shared/page-header";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function AdminRiskPage() {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getRiskConfig().then(data => {
      setConfig(data);
      setIsLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateRiskConfig(config);
      toast.success("Risk Rules updated successfully.");
    } catch (e: any) {
      toast.error(e.message || "Failed to update risk rules.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Risk Rules" description="Configure global betting limits and exposure thresholds." showBack={false} />

      {isLoading || !config ? <Loader2 className="animate-spin" /> : (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border bg-card p-6 space-y-6">
            <h3 className="font-semibold text-lg flex items-center justify-between">
              Platform Status
              <div className="flex items-center gap-2 text-sm font-normal">
                <Switch 
                  checked={config.globalBettingSuspended} 
                  onCheckedChange={(c) => setConfig({...config, globalBettingSuspended: c})} 
                />
                Suspend All Betting
              </div>
            </h3>
            
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Stake (USDT)</Label>
                  <Input 
                    type="number" 
                    value={config.minStake} 
                    onChange={e => setConfig({...config, minStake: parseFloat(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Stake (USDT)</Label>
                  <Input 
                    type="number" 
                    value={config.maxStake} 
                    onChange={e => setConfig({...config, maxStake: parseFloat(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Payout (USDT)</Label>
                  <Input 
                    type="number" 
                    value={config.maxPayout} 
                    onChange={e => setConfig({...config, maxPayout: parseFloat(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Accumulator Selections</Label>
                  <Input 
                    type="number" 
                    value={config.maxAccumulatorSelections} 
                    onChange={e => setConfig({...config, maxAccumulatorSelections: parseInt(e.target.value)})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fraud Alert Stake Threshold</Label>
                  <Input 
                    type="number" 
                    value={config.fraudAlertStakeThreshold} 
                    onChange={e => setConfig({...config, fraudAlertStakeThreshold: parseFloat(e.target.value)})} 
                  />
                  <p className="text-xs text-muted-foreground">Alerts admins if a bet exceeds this.</p>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Save Risk Rules"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
