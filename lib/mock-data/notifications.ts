export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "Bet Won!", message: "Your bet on Man City vs Aston Villa has won. $130.00 credited.", type: "success", read: false, createdAt: "2026-07-06T17:00:00Z" },
  { id: "n2", title: "Deposit Confirmed", message: "Your deposit of $500.00 has been confirmed.", type: "info", read: false, createdAt: "2026-07-07T09:05:00Z" },
  { id: "n3", title: "Live Match Started", message: "Arsenal vs Chelsea is now live! You have an active bet.", type: "info", read: true, createdAt: "2026-07-07T15:00:00Z" },
  { id: "n4", title: "Withdrawal Failed", message: "Your withdrawal of $500 to PayPal failed. Please try again.", type: "error", read: true, createdAt: "2026-07-04T11:30:00Z" },
  { id: "n5", title: "New Promotion", message: "Get 50% bonus on your next deposit. Limited time offer!", type: "warning", read: false, createdAt: "2026-07-07T08:00:00Z" },
];
