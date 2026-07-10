export type TransactionType = "deposit" | "withdrawal" | "bet_placed" | "bet_won" | "bet_refund";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  createdAt: string;
  reference?: string;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "t1", type: "deposit", amount: 500, currency: "USD", status: "completed", description: "Bank Transfer Deposit", createdAt: "2026-07-07T09:00:00Z", reference: "DEP-001234" },
  { id: "t2", type: "bet_placed", amount: -50, currency: "USD", status: "completed", description: "Bet: Arsenal vs Chelsea", createdAt: "2026-07-07T14:30:00Z", reference: "BET-005678" },
  { id: "t3", type: "bet_won", amount: 130, currency: "USD", status: "completed", description: "Won: Man City vs Aston Villa", createdAt: "2026-07-06T17:00:00Z", reference: "WIN-009012" },
  { id: "t4", type: "withdrawal", amount: -200, currency: "USD", status: "pending", description: "Withdrawal to Bank Account", createdAt: "2026-07-06T10:00:00Z", reference: "WDR-003456" },
  { id: "t5", type: "deposit", amount: 1000, currency: "USD", status: "completed", description: "Crypto Deposit (BTC)", createdAt: "2026-07-05T16:00:00Z", reference: "DEP-007890" },
  { id: "t6", type: "bet_placed", amount: -25, currency: "USD", status: "completed", description: "Bet: Barcelona vs Real Madrid", createdAt: "2026-07-07T10:00:00Z", reference: "BET-001122" },
  { id: "t7", type: "bet_placed", amount: -30, currency: "USD", status: "completed", description: "Bet: Mumbai Indians vs CSK", createdAt: "2026-07-06T13:30:00Z", reference: "BET-003344" },
  { id: "t8", type: "withdrawal", amount: -500, currency: "USD", status: "failed", description: "Withdrawal to PayPal", createdAt: "2026-07-04T11:00:00Z", reference: "WDR-005566" },
];
