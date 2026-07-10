"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeposit, useActiveDepositMethods } from "../hooks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Loader2, ArrowLeft } from "lucide-react";
import QRCode from "react-qr-code";

export function DepositModal() {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState("USDT");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const { mutate: deposit, isPending } = useDeposit();
  const { data: methods, isLoading: isLoadingMethods } = useActiveDepositMethods();

  // Selected method object
  const activeMethod = methods?.find((m: any) => m.currency === currency);
  const depositAddress = activeMethod?.address;

  const handleCopy = () => {
    if (depositAddress) {
      navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !txHash || !receiptFile) return;

    const formData = new FormData();
    formData.append("amount", amount.toString());
    formData.append("currency", currency);
    formData.append("txHash", txHash);
    formData.append("receipt", receiptFile);

    deposit(formData, { 
      onSuccess: () => {
        setOpen(false);
        setAmount("");
        setTxHash("");
        setReceiptFile(null);
      }
    });
  };

  return (
      <Sheet open={open} onOpenChange={(val) => {
        setOpen(val);
        if (!val) setTimeout(() => setStep(1), 300);
      }}>
        <SheetTrigger>
          <Button className="w-full">Deposit</Button>
      </SheetTrigger>
      <SheetContent className="theme-marketing dark sm:max-w-[540px] bg-background border-l p-0 flex flex-col w-[90vw]">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="mr-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            Deposit Crypto
          </SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            {step === 1 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Currency</Label>
                  <Select value={currency} onValueChange={(val) => val && setCurrency(val)}>
                    <SelectTrigger className="w-full h-14 text-lg">
                      <SelectValue placeholder={isLoadingMethods ? "Loading..." : "Select currency"} />
                    </SelectTrigger>
                    <SelectContent>
                      {methods?.map((m: any) => (
                        <SelectItem key={m._id} value={m.currency}>
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${m.currency.toLowerCase()}.svg`} alt={m.currency} className="w-6 h-6" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                            <span>{m.currency} ({m.network})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount to Deposit</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    className="w-full h-14 text-lg"
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-xl bg-muted p-5 space-y-4 border flex flex-col items-center">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider font-bold self-start">Send funds to this address</Label>
                  
                  {isLoadingMethods ? (
                    <div className="h-36 w-36 flex items-center justify-center bg-background rounded-xl border shadow-sm"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                  ) : depositAddress ? (
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <QRCode value={depositAddress} size={140} />
                    </div>
                  ) : (
                    <div className="h-36 w-36 flex items-center justify-center bg-background rounded-xl border shadow-sm text-xs text-muted-foreground">No address</div>
                  )}

                  <div className="flex items-center gap-2 w-full">
                    {isLoadingMethods ? (
                      <div className="flex-1 h-10 flex items-center justify-center bg-background rounded-md"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                    ) : (
                      <>
                        <code className="flex-1 bg-background p-2.5 rounded-md text-xs break-all font-mono border text-center text-muted-foreground">
                          {depositAddress}
                        </code>
                        <Button type="button" variant="outline" size="icon" onClick={handleCopy} className="shrink-0 h-10 w-10">
                          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-destructive font-medium bg-destructive/10 p-2 rounded-md flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/color/${currency.toLowerCase()}.svg`} alt={currency} className="w-4 h-4" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    Only send {currency} to this address via the correct network ({activeMethod?.network}). Sending any other asset may result in permanent loss.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Transaction Hash (TxID)</Label>
                  <Input 
                    placeholder="Paste the transaction hash here" 
                    className="w-full h-14"
                    value={txHash} 
                    onChange={(e) => setTxHash(e.target.value)} 
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Upload Receipt/Evidence</Label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    className="w-full h-14 pt-3.5"
                    onChange={handleFileChange} 
                    required
                  />
                  <p className="text-xs text-muted-foreground">Upload a screenshot of the completed transfer.</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t mt-auto bg-card shrink-0">
            {step === 1 ? (
              <Button type="button" className="w-full h-14 text-lg font-bold shadow-lg" disabled={!amount || parseFloat(amount) <= 0} onClick={() => setStep(2)}>
                Next: Transfer Details
              </Button>
            ) : (
              <Button type="submit" className="w-full h-14 text-lg font-bold shadow-lg" disabled={isPending || !amount || !txHash || !receiptFile}>
                {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                I have made the transfer
              </Button>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
