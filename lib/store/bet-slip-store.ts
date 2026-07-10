import { create } from "zustand";

export interface BetSelection {
  id: string;
  eventId: string;
  eventName: string;
  market: string;
  label: string;
  homeLogo?: string;
  awayLogo?: string;
  odds: number;
}

interface BetSlipState {
  isOpen: boolean;
  selections: BetSelection[];
  stake: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addSelection: (selection: Omit<BetSelection, "stake">) => void;
  removeSelection: (id: string) => void;
  clearSelections: () => void;
  setStake: (stake: number) => void;
  isSelected: (id: string) => boolean;
}

export const useBetSlipStore = create<BetSlipState>((set, get) => ({
  isOpen: false,
  selections: [],
  stake: 10,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  addSelection: (selection) =>
    set((state) => {
      if (state.selections.some((s) => s.id === selection.id)) {
        return { selections: state.selections.filter((s) => s.id !== selection.id) };
      }
      return { selections: [...state.selections, selection], isOpen: true };
    }),
  removeSelection: (id) => set((state) => ({ selections: state.selections.filter((s) => s.id !== id) })),
  clearSelections: () => set({ selections: [] }),
  setStake: (stake) => set({ stake: Math.max(0, stake) }),
  isSelected: (id) => get().selections.some((s) => s.id === id),
}));
