"use client";

import { useState, useEffect } from "react";
import { getPendingTransactions, approveDeposit, rejectTransaction, approveWithdrawal, getDepositMethods, addDepositMethod, deleteDepositMethod, updateDepositMethod, getAllUsers, adjustUserBalance, generateWithdrawalVatCode } from "@/features/admin/actions";
import { useAdminBets, useAdminManualSettle } from "@/features/betting/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function AdminFinancePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [withdrawHash, setWithdrawHash] = useState<Record<string, string>>({});
  const [methods, setMethods] = useState<any[]>([]);
  const [newMethod, setNewMethod] = useState({ currency: "BTC", network: "", address: "" });
  const [usdEquivalents, setUsdEquivalents] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<any[]>([]);
  
  const [creditUserId, setCreditUserId] = useState<string>("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [isCrediting, setIsCrediting] = useState(false);
  const [vatUserId, setVatUserId] = useState("");
  const [isGeneratingVatCode, setIsGeneratingVatCode] = useState(false);
  const [generatedVatCode, setGeneratedVatCode] = useState<{ code: string; email: string } | null>(null);

  const { data: allBets, isLoading: isLoadingBets } = useAdminBets();
  const { mutate: manualSettle, isPending: isSettling } = useAdminManualSettle();

  const fetchData = async () => {
    try {
      const [txData, methodsData, usersData] = await Promise.all([
        getPendingTransactions(),
        getDepositMethods(),
        getAllUsers()
      ]);
      setTransactions(txData);
      setMethods(methodsData);
      setUsers(usersData);
    } catch (e) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveDeposit = async (id: string, currency: string) => {
    let approvedAmount: number | undefined;
    
    if (currency !== "USDT") {
      const usdStr = usdEquivalents[id];
      if (!usdStr || parseFloat(usdStr) <= 0) {
        toast.error("You must enter the USD equivalent value to credit.");
        return;
      }
      approvedAmount = parseFloat(usdStr);
    }

    setProcessingId(id);
    try {
      await approveDeposit(id, approvedAmount);
      toast.success("Deposit approved and credited!");
      fetchData();
      setUsdEquivalents(prev => { const n = {...prev}; delete n[id]; return n; });
    } catch (e: any) {
      toast.error(e.message || "Approval failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter reason for rejection:");
    if (!reason) return;
    
    setProcessingId(id);
    try {
      await rejectTransaction(id, reason);
      toast.success("Transaction rejected");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Rejection failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    const hash = withdrawHash[id];
    if (!hash) {
      toast.error("You must enter the blockchain TX Hash first");
      return;
    }

    setProcessingId(id);
    try {
      await approveWithdrawal(id, hash);
      toast.success("Withdrawal approved and marked complete!");
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "Approval failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddMethod = async () => {
    if (!newMethod.currency || !newMethod.network || !newMethod.address) return toast.error("Fill all fields");
    try {
      await addDepositMethod({ ...newMethod, isActive: true });
      toast.success("Added deposit method");
      setNewMethod({ currency: "BTC", network: "", address: "" });
      fetchData();
    } catch(e:any) {
      toast.error(e.message);
    }
  };

  const handleToggleMethod = async (id: string, currentStatus: boolean) => {
    try {
      await updateDepositMethod(id, { isActive: !currentStatus });
      toast.success("Status updated");
      fetchData();
    } catch(e:any) {
      toast.error(e.message);
    }
  };

  const handleDeleteMethod = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDepositMethod(id);
      toast.success("Deleted method");
      fetchData();
    } catch(e:any) {
      toast.error(e.message);
    }
  };

  const handleManualCredit = async () => {
    if (!creditUserId || !creditAmount || !creditReason) {
      return toast.error("Please fill all fields to credit user.");
    }
    
    setIsCrediting(true);
    try {
      await adjustUserBalance(creditUserId, "USDT", parseFloat(creditAmount), creditReason);
      toast.success("User successfully credited!");
      setCreditUserId("");
      setCreditAmount("");
      setCreditReason("");
      // optionally refresh data if needed
    } catch (e: any) {
      toast.error(e.message || "Failed to credit user.");
    } finally {
      setIsCrediting(false);
    }
  };

  const handleGenerateVatCode = async () => {
    if (!vatUserId) {
      toast.error("Please select a user first.");
      return;
    }

    setIsGeneratingVatCode(true);
    try {
      const result = await generateWithdrawalVatCode(vatUserId);
      setGeneratedVatCode({ code: result.code, email: result.email });
      toast.success("VAT code generated. Share it with the user via support.");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate VAT code.");
    } finally {
      setIsGeneratingVatCode(false);
    }
  };

  const deposits = transactions.filter(t => t.type === "DEPOSIT");
  const withdrawals = transactions.filter(t => t.type === "WITHDRAWAL");

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Financial Approvals" description="Review and process pending deposits and withdrawals." />

      <Tabs defaultValue="deposits">
        <TabsList>
          <TabsTrigger value="deposits">Deposits ({deposits.length})</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals ({withdrawals.length})</TabsTrigger>
          <TabsTrigger value="bets">Active Bets</TabsTrigger>
          <TabsTrigger value="settings">Deposit Settings</TabsTrigger>
          <TabsTrigger value="credit">Manual Credit</TabsTrigger>
        </TabsList>

        <TabsContent value="deposits" className="mt-6 space-y-4">
          {isLoading ? <Loader2 className="animate-spin" /> : deposits.length === 0 ? <p className="text-muted-foreground">No pending deposits.</p> : (
            deposits.map(tx => (
              <div key={tx._id} className="p-6 rounded-xl border bg-card flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{tx.userId.name} ({tx.userId.email})</h3>
                      <p className="text-sm text-muted-foreground">{format(new Date(tx.createdAt), 'PPpp')}</p>
                    </div>
                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">PENDING</Badge>
                  </div>
                  <div className="text-2xl font-bold text-green-500">+{tx.amount.toFixed(2)} {tx.currency}</div>
                  <div className="text-sm font-mono bg-muted p-2 rounded truncate break-all">TX: {tx.providerReference}</div>
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t items-end">
                    {tx.currency !== "USDT" && (
                      <div className="space-y-1 flex-1">
                        <label className="text-xs font-semibold">USD Equivalent to Credit</label>
                        <Input 
                          placeholder="Amount in USD" 
                          type="number"
                          value={usdEquivalents[tx._id] || ""}
                          onChange={(e) => setUsdEquivalents(prev => ({...prev, [tx._id]: e.target.value}))}
                        />
                      </div>
                    )}
                    <Button onClick={() => handleApproveDeposit(tx._id, tx.currency)} disabled={processingId === tx._id} className="bg-green-600 hover:bg-green-700">
                      {processingId === tx._id ? <Loader2 className="animate-spin h-4 w-4" /> : "Approve Deposit"}
                    </Button>
                    <Button onClick={() => handleReject(tx._id)} disabled={processingId === tx._id} variant="destructive">Reject</Button>
                  </div>
                </div>
                
                <div className="w-full md:w-1/3 bg-muted rounded-lg overflow-hidden flex items-center justify-center min-h-[200px] border">
                  {tx.evidenceUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tx.evidenceUrl} alt="Receipt" className="object-contain w-full h-full max-h-[300px]" />
                  ) : (
                    <span className="text-muted-foreground text-sm">No receipt uploaded</span>
                  )}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-6 space-y-4">
          {isLoading ? <Loader2 className="animate-spin" /> : withdrawals.length === 0 ? <p className="text-muted-foreground">No pending withdrawals.</p> : (
            withdrawals.map(tx => (
              <div key={tx._id} className="p-6 rounded-xl border bg-card flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{tx.userId.name} ({tx.userId.email})</h3>
                      <p className="text-sm text-muted-foreground">{format(new Date(tx.createdAt), 'PPpp')}</p>
                    </div>
                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-500">PENDING</Badge>
                  </div>
                  <div className="text-2xl font-bold text-orange-500">-{tx.amount.toFixed(2)} {tx.currency}</div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Destination Address (Send funds here):</p>
                    <div className="text-sm font-mono bg-muted p-2 rounded truncate break-all select-all">{tx.destinationAddress}</div>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-sm font-medium">Blockchain TX Hash (After you send):</p>
                    <Input 
                      placeholder="Paste TX Hash here to approve..." 
                      value={withdrawHash[tx._id] || ""}
                      onChange={(e) => setWithdrawHash(prev => ({...prev, [tx._id]: e.target.value}))}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => handleApproveWithdrawal(tx._id)} disabled={processingId === tx._id || !withdrawHash[tx._id]}>
                      {processingId === tx._id ? <Loader2 className="animate-spin h-4 w-4" /> : "Approve & Complete"}
                    </Button>
                    <Button onClick={() => handleReject(tx._id)} disabled={processingId === tx._id} variant="destructive">Reject & Refund User</Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="bets" className="mt-6 space-y-4">
          {isLoadingBets ? <Loader2 className="animate-spin" /> : !allBets || allBets.length === 0 ? <p className="text-muted-foreground">No bets found.</p> : (
            allBets.map((bet: any) => (
              <div key={bet._id} className="p-6 rounded-xl border bg-card flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{bet.userId?.name} ({bet.userId?.email})</h3>
                    <p className="text-sm text-muted-foreground">{format(new Date(bet.createdAt), 'PPpp')}</p>
                  </div>
                  <Badge variant="outline">{bet.status}</Badge>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-lg border space-y-2">
                  {bet.selections.map((sel: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span><span className="font-semibold">{sel.outcomeName}</span> @ {sel.lockedOdds}</span>
                      <span className="text-muted-foreground">{sel.matchName}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center bg-muted/50 p-3 rounded">
                  <div>Stake: <span className="font-bold">{bet.stake} {bet.currency}</span></div>
                  <div>Payout: <span className="font-bold text-green-500">{bet.potentialPayout} {bet.currency}</span></div>
                </div>

                {bet.status === "PENDING" && (
                  <div className="flex gap-2 justify-end border-t pt-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-green-500/10 text-green-600 hover:bg-green-500/20"
                      onClick={() => manualSettle({ betId: bet._id, result: "WON" })}
                      disabled={isSettling}
                    >
                      Force Win
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-red-500/10 text-red-600 hover:bg-red-500/20"
                      onClick={() => manualSettle({ betId: bet._id, result: "LOST" })}
                      disabled={isSettling}
                    >
                      Force Loss
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => manualSettle({ betId: bet._id, result: "VOID" })}
                      disabled={isSettling}
                    >
                      Void / Refund
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 rounded-xl border bg-card space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Add New Deposit Method</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Currency Ticker (e.g. BTC, ETH, SOL)</label>
                  <Input value={newMethod.currency} onChange={e => setNewMethod(p => ({...p, currency: e.target.value.toUpperCase()}))} placeholder="BTC" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Network</label>
                  <Input value={newMethod.network} onChange={e => setNewMethod(p => ({...p, network: e.target.value}))} placeholder="e.g. TRC20, ERC20, Native" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Wallet Address</label>
                  <Input value={newMethod.address} onChange={e => setNewMethod(p => ({...p, address: e.target.value}))} placeholder="0x..." />
                </div>
                <Button onClick={handleAddMethod} className="w-full">Add Deposit Method</Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Active Deposit Methods</h3>
              {methods.length === 0 ? <p className="text-muted-foreground text-sm border p-6 rounded-xl bg-card">No deposit methods configured.</p> : (
                methods.map(m => (
                  <div key={m._id} className="p-4 rounded-xl border bg-card flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{m.currency}</span>
                        <Badge variant={m.isActive ? "secondary" : "destructive"}>{m.isActive ? "Active" : "Disabled"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{m.network}</p>
                      <p className="text-xs font-mono mt-1 text-muted-foreground truncate w-48 break-all">{m.address}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleToggleMethod(m._id, m.isActive)}>{m.isActive ? "Disable" : "Enable"}</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteMethod(m._id)}>Delete</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="max-w-xl p-6 rounded-xl border bg-card space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Withdrawal VAT Codes</h3>
            <p className="text-sm text-muted-foreground">
              Generate a VAT code for a user. The user must contact support and enter this code to authorize pending withdrawal transactions.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select User</label>
              <Select value={vatUserId} onValueChange={(value) => setVatUserId(value || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {users.map((u: any) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.name || u.username} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateVatCode} disabled={isGeneratingVatCode || !vatUserId} className="w-full">
              {isGeneratingVatCode ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
              Generate VAT Code
            </Button>
            {generatedVatCode && (
              <div className="space-y-2 rounded-lg border bg-muted/40 p-4">
                <p className="text-sm font-medium">Latest generated code</p>
                <p className="text-xs text-muted-foreground">User: {generatedVatCode.email}</p>
                <Input value={generatedVatCode.code} readOnly className="font-mono text-base tracking-[0.12em]" />
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="credit" className="mt-6">
          <div className="max-w-xl p-6 rounded-xl border bg-card space-y-6">
            <h3 className="font-semibold text-lg border-b pb-2">Fund / Credit User Account</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select User</label>
                <Select value={creditUserId} onValueChange={(v) => setCreditUserId(v || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {users.map((u: any) => (
                      <SelectItem key={u._id} value={u._id}>
                        {u.name || u.username} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount to Credit (USDT)</label>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="e.g. 50" 
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason / Note</label>
                <Input 
                  placeholder="e.g. Manual Deposit, Refund, Promo" 
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                />
              </div>
              <Button onClick={handleManualCredit} disabled={isCrediting || !creditUserId || !creditAmount || !creditReason} className="w-full">
                {isCrediting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                Credit User
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
