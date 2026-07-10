"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Landmark, Bitcoin, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { CURRENT_USER } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useState } from "react";

const methods = [
  { id: "bank", label: "Bank Transfer", icon: Landmark },
  { id: "crypto", label: "Cryptocurrency", icon: Bitcoin },
];

export default function WithdrawPage() {
  const [selected, setSelected] = useState("bank");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  function handleWithdraw() {
    setStatus("submitting");
    setTimeout(() => setStatus("success"), 1200);
  }

  if (status === "success") {
    return (
      <div className="max-w-lg animate-fade-in text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Withdrawal requested</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ${Number(amount).toFixed(2)} is on its way via {methods.find((m) => m.id === selected)?.label}.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => { setStatus("idle"); setAmount(""); }}>Make another withdrawal</Button>
          <Button render={<Link href="/wallet" />}>Back to Wallet</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" render={<Link href="/wallet" />}><ArrowLeft className="mr-1 h-4 w-4" /> Back to Wallet</Button>
      <PageHeader title="Withdraw Funds" description={`Available balance: $${CURRENT_USER.balance.toLocaleString()}`} />

      <div>
        <label className="mb-2 block text-sm font-medium">Withdrawal Method</label>
        <div className="grid grid-cols-2 gap-2">
          {methods.map((m) => (
            <button key={m.id} onClick={() => setSelected(m.id)} className={cn("flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center text-sm transition-all", selected === m.id ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30")}>
              <m.icon className={cn("h-5 w-5", selected === m.id ? "text-primary" : "text-muted-foreground")} />
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="wd-amount" className="mb-2 block text-sm font-medium">Amount (USD)</label>
        <Input id="wd-amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-lg" />
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={!amount || Number(amount) <= 0 || Number(amount) > CURRENT_USER.balance || status === "submitting"}
        onClick={handleWithdraw}
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
          </>
        ) : (
          `Withdraw $${amount || "0.00"}`
        )}
      </Button>
    </div>
  );
}
