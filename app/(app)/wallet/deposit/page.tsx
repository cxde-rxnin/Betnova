"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CreditCard, Landmark, Bitcoin, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

const methods = [
  { id: "card", label: "Credit Card", icon: CreditCard },
  { id: "bank", label: "Bank Transfer", icon: Landmark },
  { id: "crypto", label: "Cryptocurrency", icon: Bitcoin },
];

export default function DepositPage() {
  const [selected, setSelected] = useState("card");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const presets = [50, 100, 250, 500, 1000];

  function handleDeposit() {
    setStatus("submitting");
    setTimeout(() => setStatus("success"), 1200);
  }

  if (status === "success") {
    return (
      <div className="max-w-lg animate-fade-in text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Deposit successful</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ${Number(amount).toFixed(2)} has been added to your wallet via {methods.find((m) => m.id === selected)?.label}.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => { setStatus("idle"); setAmount(""); }}>Make another deposit</Button>
          <Button render={<Link href="/wallet" />}>Back to Wallet</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" render={<Link href="/wallet" />}><ArrowLeft className="mr-1 h-4 w-4" /> Back to Wallet</Button>
      <PageHeader title="Deposit Funds" description="Add funds to your Betnova wallet." />

      <div>
        <label className="mb-2 block text-sm font-medium">Payment Method</label>
        <div className="grid grid-cols-3 gap-2">
          {methods.map((m) => (
            <button key={m.id} onClick={() => setSelected(m.id)} className={cn("flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center text-sm transition-all", selected === m.id ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30")}>
              <m.icon className={cn("h-5 w-5", selected === m.id ? "text-primary" : "text-muted-foreground")} />
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="dep-amount" className="mb-2 block text-sm font-medium">Amount (USD)</label>
        <Input id="dep-amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-lg" />
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button key={p} onClick={() => setAmount(String(p))} className="rounded-lg border px-3 py-1 text-xs font-medium hover:bg-muted transition-colors">${p}</button>
          ))}
        </div>
      </div>

      <Button className="w-full" size="lg" disabled={!amount || Number(amount) <= 0 || status === "submitting"} onClick={handleDeposit}>
        {status === "submitting" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
          </>
        ) : (
          `Deposit $${amount || "0.00"}`
        )}
      </Button>
    </div>
  );
}
