import { useQuery } from "@tanstack/react-query";

export interface UserProfile {
  _id: string;
  email: string;
  username: string;
  name?: string;
  avatar?: string;
  country?: string;
  preferredCurrency?: string;
  timeZone?: string;
  language?: string;
  role: string;
  status: string;
}

export function useCurrentUser() {
  return useQuery<UserProfile>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) {
        throw new Error("Failed to fetch user profile");
      }
      return res.json();
    },
    retry: false,
  });
}
