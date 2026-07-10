export type Role = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface UserSession {
  id: string;
  email: string;
  name?: string;
  role: Role;
}
