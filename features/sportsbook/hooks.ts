import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSports, getLiveMatches, getUpcomingMatches, getMatchDetails, getStandings, getCompetitions } from "./actions";

export function useSports() {
  return useQuery({
    queryKey: ["sports"],
    queryFn: () => getSports(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useCompetitions(sportId: string) {
  return useQuery({
    queryKey: ["competitions", sportId],
    queryFn: () => getCompetitions(sportId),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useLiveMatches(sportId?: string) {
  return useQuery({
    queryKey: ["liveMatches", sportId],
    queryFn: () => getLiveMatches(sportId),
    // Removed refetchInterval to save API requests
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpcomingMatches(sportId?: string, date?: string) {
  return useQuery({
    queryKey: ["upcomingMatches", sportId, date],
    queryFn: () => getUpcomingMatches(sportId, date),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMatchDetails(matchId: string) {
  return useQuery({
    queryKey: ["matchDetails", matchId],
    queryFn: () => getMatchDetails(matchId),
    // Polling removed to protect API quota
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useStandings(competitionId: string, season?: string) {
  return useQuery({
    queryKey: ["standings", competitionId, season],
    queryFn: () => getStandings(competitionId, season),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useFavorites(type?: string) {
  return useQuery({
    queryKey: ["favorites", type],
    queryFn: async () => {
      const res = await fetch(`/api/favorites${type ? `?type=${type}` : ''}`);
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entityId, entityType }: { entityId: string, entityType: string }) => {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityId, entityType }),
      });
      if (!res.ok) throw new Error("Failed to toggle favorite");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    }
  });
}
