import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(50),
  leagueId: z.string().cuid(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(50).optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;


