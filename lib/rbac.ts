import { auth } from "@/lib/auth";

export const PERMISSIONS = {
  VIEW_USERS: "VIEW_USERS",
  MANAGE_USERS: "MANAGE_USERS",
  VIEW_FINANCES: "VIEW_FINANCES",
  MANAGE_FINANCES: "MANAGE_FINANCES",
  VIEW_BETS: "VIEW_BETS",
  MANAGE_BETS: "MANAGE_BETS",
  MANAGE_RISK: "MANAGE_RISK",
  VIEW_AUDIT: "VIEW_AUDIT",
  VIEW_DASHBOARD: "VIEW_DASHBOARD",
} as const;

export type Permission = keyof typeof PERMISSIONS;
export type Role = "USER" | "SUPER_ADMIN" | "ADMIN" | "OPERATIONS" | "FINANCE" | "SUPPORT" | "RISK_ANALYST";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  ADMIN: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_USERS, PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_FINANCES, PERMISSIONS.MANAGE_FINANCES,
    PERMISSIONS.VIEW_BETS, PERMISSIONS.MANAGE_BETS,
    PERMISSIONS.MANAGE_RISK, PERMISSIONS.VIEW_AUDIT
  ],
  OPERATIONS: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_USERS, PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_BETS, PERMISSIONS.MANAGE_BETS,
  ],
  FINANCE: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_FINANCES, PERMISSIONS.MANAGE_FINANCES,
  ],
  RISK_ANALYST: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_BETS,
    PERMISSIONS.MANAGE_RISK,
  ],
  SUPPORT: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_BETS,
  ],
  USER: [],
};

export async function hasPermission(permission: Permission): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.role) return false;
  
  const userRole = session.user.role as Role;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  
  return permissions.includes(permission) || userRole === "SUPER_ADMIN"; // Quick fallback
}

export async function requirePermission(permission: Permission) {
  const allowed = await hasPermission(permission);
  if (!allowed) {
    throw new Error(`Unauthorized: Missing permission ${permission}`);
  }
}

export function getUserPermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role as Role] || [];
}
