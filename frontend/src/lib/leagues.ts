import { apiFetch } from "./api";
import type { League, CreateLeagueData, UpdateLeagueData } from "./types";

export const leaguesApi = {
  // Get all leagues for the current user
  getAll: (): Promise<League[]> => {
    return apiFetch<League[]>("/api/leagues");
  },

  // Browse all public leagues
  browse: (): Promise<League[]> => {
    return apiFetch<League[]>("/api/leagues/browse");
  },

  // Get a specific league
  getById: (id: string): Promise<League> => {
    return apiFetch<League>(`/api/leagues/${id}`);
  },

  // Create a new league
  create: (data: CreateLeagueData): Promise<League> => {
    return apiFetch<League>("/api/leagues", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update a league (admin only)
  update: (id: string, data: UpdateLeagueData): Promise<League> => {
    return apiFetch<League>(`/api/leagues/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete a league (admin only)
  delete: (id: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/api/leagues/${id}`, {
      method: "DELETE",
    });
  },

  // Join a league
  join: (id: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/api/leagues/${id}/join`, {
      method: "POST",
    });
  },

  // Leave a league
  leave: (id: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/api/leagues/${id}/leave`, {
      method: "DELETE",
    });
  },
};
