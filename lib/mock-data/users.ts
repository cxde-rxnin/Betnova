export const MOCK_USERS = [
  { id: "u1", name: "Alex Johnson", email: "alex@example.com", role: "USER" as const, avatar: null, createdAt: "2025-11-15T10:30:00Z", status: "active" as const },
  { id: "u2", name: "Sarah Chen", email: "sarah@example.com", role: "USER" as const, avatar: null, createdAt: "2025-12-01T08:15:00Z", status: "active" as const },
  { id: "u3", name: "Marcus Williams", email: "marcus@example.com", role: "ADMIN" as const, avatar: null, createdAt: "2025-10-20T14:00:00Z", status: "active" as const },
  { id: "u4", name: "Emily Davis", email: "emily@example.com", role: "USER" as const, avatar: null, createdAt: "2026-01-10T12:45:00Z", status: "suspended" as const },
  { id: "u5", name: "James Park", email: "james@example.com", role: "USER" as const, avatar: null, createdAt: "2026-02-28T09:30:00Z", status: "active" as const },
];

export const CURRENT_USER = {
  id: "u1",
  name: "Alex Johnson",
  email: "alex@example.com",
  role: "USER" as const,
  avatar: null,
  balance: 2847.50,
  currency: "USD",
};
