import { useCallback } from "react";
import useSWR from "swr";
import { teamsApi } from "../lib/teams";
import type { Team, CreateTeamData, UpdateTeamData } from "../lib/types";

// SWR fetcher for teams
const teamsFetcher = (leagueId: string): Promise<Team[]> =>
  teamsApi.getByLeague(leagueId);

export function useTeams(leagueId: string) {
  const {
    data: teams,
    error,
    mutate,
    isLoading,
  } = useSWR<Team[]>(
    leagueId ? ["/api/teams", leagueId] : null,
    ([, id]) => teamsFetcher(id as string),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const createTeam = useCallback(
    async (data: CreateTeamData) => {
      try {
        const newTeam = await teamsApi.create(data);
        // Optimistically update the cache
        mutate((currentTeams) => [...(currentTeams || []), newTeam], false);
        return newTeam;
      } catch (err: unknown) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to create team"
        );
      }
    },
    [mutate]
  );

  const updateTeam = useCallback(
    async (id: string, data: UpdateTeamData) => {
      try {
        const updatedTeam = await teamsApi.update(id, data);
        // Update the cache
        mutate(
          (currentTeams) =>
            currentTeams?.map((team) => (team.id === id ? updatedTeam : team)),
          false
        );
        return updatedTeam;
      } catch (err: unknown) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to update team"
        );
      }
    },
    [mutate]
  );

  const deleteTeam = useCallback(
    async (id: string) => {
      try {
        await teamsApi.delete(id);
        // Update the cache
        mutate(
          (currentTeams) => currentTeams?.filter((team) => team.id !== id),
          false
        );
      } catch (err: unknown) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to delete team"
        );
      }
    },
    [mutate]
  );

  return {
    teams: teams || [],
    isLoading,
    error: error?.message || null,
    fetchTeams: mutate,
    createTeam,
    updateTeam,
    deleteTeam,
  };
}

// SWR fetcher for single team
const teamFetcher = (id: string): Promise<Team> => teamsApi.getById(id);

export function useTeam(id: string) {
  const {
    data: team,
    error,
    mutate,
    isLoading,
  } = useSWR<Team>(
    id ? ["/api/teams", id] : null,
    ([, teamId]) => teamFetcher(teamId as string),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    team: team || null,
    isLoading,
    error: error?.message || null,
    fetchTeam: mutate,
  };
}
