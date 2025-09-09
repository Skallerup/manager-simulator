import { useCallback } from "react";
import useSWR from "swr";
import { leaguesApi } from "../lib/leagues";
import type { League, CreateLeagueData, UpdateLeagueData } from "../lib/types";
import { useAuth } from "../components/auth/AuthProvider";

// SWR fetcher for leagues
const leaguesFetcher = (): Promise<League[]> => leaguesApi.getAll();

// SWR fetcher for browsing leagues
const browseLeaguesFetcher = (): Promise<League[]> => leaguesApi.browse();

export function useLeagues() {
  const { isAuthenticated } = useAuth();
  
  const {
    data: leagues,
    error,
    mutate,
    isLoading,
  } = useSWR<League[]>(
    isAuthenticated ? "/api/leagues" : null, 
    leaguesFetcher, 
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const createLeague = useCallback(
    async (data: CreateLeagueData) => {
      try {
        const newLeague = await leaguesApi.create(data);
        // Optimistically update the cache
        mutate(
          (currentLeagues) => [newLeague, ...(currentLeagues || [])],
          false
        );
        return newLeague;
      } catch (err: unknown) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to create league"
        );
      }
    },
    [mutate]
  );

  const updateLeague = useCallback(
    async (id: string, data: UpdateLeagueData) => {
      try {
        const updatedLeague = await leaguesApi.update(id, data);
        // Update the cache
        mutate(
          (currentLeagues) =>
            currentLeagues?.map((league) =>
              league.id === id ? updatedLeague : league
            ),
          false
        );
        return updatedLeague;
      } catch (err: unknown) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to update league"
        );
      }
    },
    [mutate]
  );

  const deleteLeague = useCallback(
    async (id: string) => {
      try {
        await leaguesApi.delete(id);
        // Update the cache
        mutate(
          (currentLeagues) =>
            currentLeagues?.filter((league) => league.id !== id),
          false
        );
      } catch (err: unknown) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to delete league"
        );
      }
    },
    [mutate]
  );

  const joinLeague = useCallback(
    async (id: string) => {
      try {
        await leaguesApi.join(id);
        // Revalidate to get updated league data
        await mutate();
      } catch (err: unknown) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to join league"
        );
      }
    },
    [mutate]
  );

  const leaveLeague = useCallback(
    async (id: string) => {
      try {
        await leaguesApi.leave(id);
        // Update the cache
        mutate(
          (currentLeagues) =>
            currentLeagues?.filter((league) => league.id !== id),
          false
        );
      } catch (err: unknown) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to leave league"
        );
      }
    },
    [mutate]
  );

  return {
    leagues: leagues || [],
    isLoading,
    error: error?.message || null,
    fetchLeagues: mutate,
    createLeague,
    updateLeague,
    deleteLeague,
    joinLeague,
    leaveLeague,
  };
}

// SWR fetcher for single league
const leagueFetcher = (id: string): Promise<League> => leaguesApi.getById(id);

export function useLeague(id: string) {
  const { isAuthenticated } = useAuth();
  
  const {
    data: league,
    error,
    mutate,
    isLoading,
  } = useSWR<League>(
    isAuthenticated && id ? ["/api/leagues", id] : null,
    ([, leagueId]) => leagueFetcher(leagueId as string),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    league: league || null,
    isLoading,
    error: error?.message || null,
    fetchLeague: mutate,
  };
}

export function useBrowseLeagues() {
  const { isAuthenticated } = useAuth();
  
  const {
    data: leagues,
    error,
    mutate,
    isLoading,
  } = useSWR<League[]>(
    isAuthenticated ? "/api/leagues/browse" : null, 
    browseLeaguesFetcher, 
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const joinLeague = useCallback(
    async (id: string) => {
      try {
        await leaguesApi.join(id);
        // Revalidate to get updated league data
        await mutate();
      } catch (err: unknown) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to join league"
        );
      }
    },
    [mutate]
  );

  return {
    leagues: leagues || [],
    isLoading,
    error: error?.message || null,
    fetchLeagues: mutate,
    joinLeague,
  };
}
