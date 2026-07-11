import { useQuery } from "@tanstack/react-query";
import { getUnreadSupportCount } from "./actions";

export function useUnreadSupportCount() {
  return useQuery({
    queryKey: ["unreadSupportCount"],
    queryFn: () => getUnreadSupportCount(),
    refetchInterval: 10000, // Poll every 10 seconds
    staleTime: 5000,
  });
}
