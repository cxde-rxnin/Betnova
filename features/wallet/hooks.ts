import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWalletBalances, getTransactionHistory, requestDeposit, requestWithdrawal, getActiveDepositMethods } from "./actions";
import { toast } from "sonner";

export function useWalletBalances() {
  return useQuery({
    queryKey: ["walletBalances"],
    queryFn: () => getWalletBalances(),
    refetchInterval: 5000, // Poll every 5 seconds for MVP so we can see mock deposits clear
  });
}

export function useTransactionHistory() {
  return useQuery({
    queryKey: ["transactionHistory"],
    queryFn: () => getTransactionHistory(),
    refetchInterval: 5000, // Keep history fresh
  });
}

export function useDeposit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      return await requestDeposit(formData);
    },
    onSuccess: () => {
      toast.success("Deposit request submitted! Waiting for admin approval...");
      queryClient.invalidateQueries({ queryKey: ["transactionHistory"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit deposit request");
    }
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ amount, currency, destinationAddress, vatCode }: { amount: number; currency: string; destinationAddress: string, vatCode: string }) => {
      return await requestWithdrawal(amount, currency, destinationAddress, vatCode);
    },
    onSuccess: () => {
      toast.success("Withdrawal request submitted! Processing...");
      queryClient.invalidateQueries({ queryKey: ["walletBalances"] });
      queryClient.invalidateQueries({ queryKey: ["transactionHistory"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit withdrawal request");
    }
  });
}

export function useActiveDepositMethods() {
  return useQuery({
    queryKey: ["activeDepositMethods"],
    queryFn: () => getActiveDepositMethods(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
