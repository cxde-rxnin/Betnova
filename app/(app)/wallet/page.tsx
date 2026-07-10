"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, History, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWalletBalances } from "@/features/wallet/hooks";
import { DepositModal } from "@/features/wallet/components/DepositModal";
import { WithdrawModal } from "@/features/wallet/components/WithdrawModal";
import { TransactionHistory } from "@/features/wallet/components/TransactionHistory";

export default function WalletPage() {
  const { data: balances, isLoading } = useWalletBalances();

  const defaultWallet = { availableBalance: 0, lockedBalance: 0, currency: "USDT" };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Wallet" description="Manage your crypto funds securely.">
        <DepositModal />
        <WithdrawModal />
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard 
            title="Available Balance" 
            value={`$${balances?.reduce((acc: number, w: any) => acc + w.availableBalance, 0).toFixed(2) || "0.00"}`} 
            icon={Wallet} 
            className="sm:col-span-1 border-primary/20 bg-primary/5" 
          />
          <StatCard 
            title="Locked Balance" 
            value={`$${balances?.reduce((acc: number, w: any) => acc + w.lockedBalance, 0).toFixed(2) || "0.00"}`} 
            icon={Lock} 
          />
          <StatCard 
            title="Total Balance" 
            value={`$${balances?.reduce((acc: number, w: any) => acc + w.availableBalance + w.lockedBalance, 0).toFixed(2) || "0.00"}`} 
            icon={ArrowDownToLine} 
          />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5" /> Transaction History
          </h2>
        </div>
        <TransactionHistory />
      </div>
    </div>
  );
}
