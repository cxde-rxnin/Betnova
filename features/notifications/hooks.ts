import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from "./actions";
import { toast } from "sonner";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => getUserNotifications(),
    refetchInterval: 15000, // Poll every 15s to keep notifications fresh
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      console.error(error);
    }
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to mark as read");
    }
  });
}
