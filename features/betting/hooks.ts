import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { submitBet, getUserBets, triggerAutoSettlement, getAdminAllBets, adminManualSettle } from "./actions";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IBetSelection } from "@/models/Bet";

// ZUSTAND STORE FOR GLOBAL BETSLIP
interface BetSlipState {
  selections: Omit<IBetSelection, "status">[];
  stake: number;
  isOpen: boolean;
  addSelection: (selection: Omit<IBetSelection, "status">) => void;
  removeSelection: (fixtureId: string, marketName: string, outcomeName: string) => void;
  setStake: (stake: number) => void;
  clearSlip: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useBetSlipStore = create<BetSlipState>()(
  persist(
    (set) => ({
      selections: [],
      stake: 0,
      isOpen: false,
      addSelection: (selection) => 
        set((state) => {
          // Prevent exact duplicate selections (same fixture, market, and outcome)
          const isDuplicate = state.selections.some(s => 
            s.fixtureId === selection.fixtureId && 
            s.marketName === selection.marketName && 
            s.outcomeName === selection.outcomeName
          );
          if (isDuplicate) return state;
          
          return { selections: [...state.selections, selection], isOpen: true };
        }),
      removeSelection: (fixtureId, marketName, outcomeName) =>
        set((state) => ({
          selections: state.selections.filter(s => 
            !(s.fixtureId === fixtureId && s.marketName === marketName && s.outcomeName === outcomeName)
          )
        })),
      setStake: (stake) => set({ stake }),
      clearSlip: () => set({ selections: [], stake: 0, isOpen: false }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen }))
    }),
    { name: "betnovo-betslip" }
  )
);

// REACT QUERY HOOKS
export function useUserBets() {
  return useQuery({
    queryKey: ["userBets"],
    queryFn: () => getUserBets(),
  });
}

export function useSubmitBet() {
  const queryClient = useQueryClient();
  const clearSlip = useBetSlipStore(state => state.clearSlip);
  
  return useMutation({
    mutationFn: async ({ selections, stake }: { selections: Omit<IBetSelection, "status">[], stake: number }) => {
      const response = await submitBet(selections, stake);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.bet;
    },
    onSuccess: () => {
      toast.success("Bet placed successfully! Good luck!");
      clearSlip();
      queryClient.invalidateQueries({ queryKey: ["userBets"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalances"] }); // Refresh wallet
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to place bet.");
    }
  });
}

export function useTriggerAutoSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (betId: string) => await triggerAutoSettlement(betId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userBets"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalances"] });
    }
  });
}

// ADMIN HOOKS
export function useAdminBets() {
  return useQuery({
    queryKey: ["adminBets"],
    queryFn: () => getAdminAllBets(),
  });
}

export function useAdminManualSettle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ betId, result }: { betId: string, result: "WON" | "LOST" | "VOID" }) => {
      const response = await adminManualSettle(betId, result);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.bet;
    },
    onSuccess: () => {
      toast.success("Bet manually settled.");
      queryClient.invalidateQueries({ queryKey: ["adminBets"] });
    },
    onError: (e: any) => {
      toast.error(e.message || "Failed to settle bet.");
    }
  });
}
