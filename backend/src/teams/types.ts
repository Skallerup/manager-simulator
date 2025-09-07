import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1).max(50),
  colors: z.string().optional(),
  logo: z.string().optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  formation: z.string().optional(),
  colors: z.string().optional(),
  logo: z.string().optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;