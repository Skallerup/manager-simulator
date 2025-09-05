import { z } from "zod";

export const createLeagueSchema = z.object({
  name: z.string().min(1, "League name is required").max(100),
  description: z.string().optional(),
  maxTeams: z.number().int().min(2).max(20).default(8),
  draftMethod: z.enum(["SNAKE", "LINEAR"]).default("SNAKE"),
  signupDeadline: z.string().datetime(),
});

export const updateLeagueSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  maxTeams: z.number().int().min(2).max(20).optional(),
  draftMethod: z.enum(["SNAKE", "LINEAR"]).optional(),
  signupDeadline: z.string().datetime().optional(),
  draftStartTime: z.string().datetime().optional(),
});

export const joinLeagueSchema = z.object({
  leagueId: z.string().cuid(),
});

export type CreateLeagueInput = z.infer<typeof createLeagueSchema>;
export type UpdateLeagueInput = z.infer<typeof updateLeagueSchema>;
export type JoinLeagueInput = z.infer<typeof joinLeagueSchema>;


