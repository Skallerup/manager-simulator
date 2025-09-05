import { apiFetch } from "./api";
import type { Team, CreateTeamData, UpdateTeamData } from "./types";

export const teamsApi = {
  // Get all teams in a league
  getByLeague: (leagueId: string): Promise<Team[]> => {
    return apiFetch<Team[]>(`/api/teams?leagueId=${leagueId}`);
  },

  // Get a specific team
  getById: (id: string): Promise<Team> => {
    return apiFetch<Team>(`/api/teams/${id}`);
  },

  // Create a new team
  create: (data: CreateTeamData): Promise<Team> => {
    return apiFetch<Team>("/api/teams", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update a team (owner only)
  update: (id: string, data: UpdateTeamData): Promise<Team> => {
    return apiFetch<Team>(`/api/teams/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete a team (owner only)
  delete: (id: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/api/teams/${id}`, {
      method: "DELETE",
    });
  },
};


