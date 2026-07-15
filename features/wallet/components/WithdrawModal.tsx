"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWithdraw, useWalletBalances } from "../hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";

export function WithdrawModal() {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [vatCode, setVatCode] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const { mutate: withdraw, isPending } = useWithdraw();
  const { data: balances } = useWalletBalances();

  const selectedWallet = balances?.find((b: any) => b.currency === currency);
  const availableBalance = selectedWallet?.availableBalance || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !address) return;
    
    if (step === 2) {
      setStep(3);
      return;
    }
    
    if (step === 3) {
      if (!vatCode.trim()) return;
      withdraw(
        { amount: parseFloat(amount), currency, destinationAddress: address, vatCode },
        { onSuccess: () => {
            setOpen(false);
            setAmount("");
            setAddress("");
            setVatCode("");
        }}
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) setTimeout(() => setStep(1), 300);
    }}>
      <SheetTrigger>
        <Button variant="outline" className="w-full">Withdraw</Button>
      </SheetTrigger>
      <SheetContent className="theme-marketing dark sm:max-w-[540px] bg-background border-l p-0 flex flex-col w-[90vw]">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            {(step === 2 || step === 3) && (
              <button onClick={() => setStep(step === 3 ? 2 : 1)} className="mr-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            Withdraw Crypto
          </SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <Label>Select Currency</Label>
                  <Select value={currency} onValueChange={(val) => val && setCurrency(val)}>
                    <SelectTrigger className="w-full h-14 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {balances?.map((b: any) => {
                        const logoUrl = b.currency === 'USDT' ? 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg' : b.currency === 'BTC' ? 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg' : 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg';
                        return (
                          <SelectItem key={b.currency} value={b.currency}>
                            <div className="flex items-center gap-3">
                              <img src={logoUrl} alt={b.currency} className="w-6 h-6" />
                              <span>{b.currency}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground text-right pt-1">Available: <span className="font-bold text-foreground">{availableBalance.toFixed(2)} {currency}</span></p>
                </div>

                <div className="space-y-2">
                  <Label>Amount to Withdraw</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      step="0.01" 
                      max={availableBalance}
                      placeholder="0.00" 
                      className="w-full h-14 text-lg pr-16"
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      required
                    />
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="sm" 
                      className="absolute right-2 top-2 h-10 px-3 text-xs font-bold"
                      onClick={() => setAmount(availableBalance.toString())}
                    >
                      MAX
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="rounded-xl border bg-card p-5 space-y-3 mb-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">Withdrawal Amount</span>
                    <span className="font-bold text-3xl flex items-center gap-3">
                      <img src={currency === 'USDT' ? 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/usdt.svg' : currency === 'BTC' ? 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/btc.svg' : 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/eth.svg'} alt={currency} className="w-8 h-8" />
                      {parseFloat(amount).toFixed(2)} {currency}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Destination Address</Label>
                  <Input 
                    placeholder={`Enter your ${currency} wallet address`} 
                    className="w-full h-14 text-lg"
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    required
                  />
                  <p className="text-xs text-destructive font-medium bg-destructive/10 p-2 rounded-md">
                    Please double-check this address. Withdrawals to incorrect addresses cannot be reversed.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-lg">VAT Authorization Code</h3>
                    <p className="text-sm text-muted-foreground">To authorize pending transactions, contact support to obtain your VAT code and enter it below.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>VAT Code</Label>
                    <Input 
                      placeholder="Enter VAT code" 
                      className="w-full h-14 text-lg font-mono"
                      value={vatCode}
                      onChange={(e) => setVatCode(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t mt-auto bg-card shrink-0">
            {step === 1 && (
              <Button 
                type="button" 
                className="w-full h-14 text-lg font-bold shadow-lg" 
                disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance} 
                onClick={() => setStep(2)}
              >
                Next: Destination Address
              </Button>
            )}
            {step === 2 && (
              <Button type="submit" className="w-full h-14 text-lg font-bold shadow-lg" disabled={!address}>
                Next: VAT Authorization
              </Button>
            )}
            {step === 3 && (
              <Button type="submit" className="w-full h-14 text-lg font-bold shadow-lg" disabled={isPending || !vatCode.trim()}>
                {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Confirm Withdrawal
              </Button>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
