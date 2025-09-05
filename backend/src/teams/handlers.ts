import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { createTeamSchema, updateTeamSchema } from "./types";
import { verifyAccessToken } from "../auth/tokens";

// Helper function to get user from token
async function getUserFromToken(req: Request) {
  const accessToken = req.cookies?.access_token as string | undefined;
  if (!accessToken) {
    throw new Error("No access token provided");
  }

  const payload = verifyAccessToken(accessToken);
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function createTeamHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const parsed = createTeamSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.errors });
    }

    const { name, leagueId } = parsed.data;

    // Check if user is a member of the league
    const leagueMember = await prisma.leagueMember.findFirst({
      where: { userId: user.id, leagueId },
    });

    if (!leagueMember) {
      return res
        .status(403)
        .json({ error: "You must be a member of the league to create a team" });
    }

    // Check if user already has a team in this league
    const existingTeam = await prisma.team.findFirst({
      where: { ownerId: user.id, leagueId },
    });

    if (existingTeam) {
      return res
        .status(400)
        .json({ error: "You already have a team in this league" });
    }

    // Check if league is still accepting teams
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: { teams: true },
    });

    if (!league) {
      return res.status(404).json({ error: "League not found" });
    }

    if (league.status !== "SIGNUP") {
      return res
        .status(400)
        .json({ error: "League is not accepting new teams" });
    }

    if (league.teams.length >= league.maxTeams) {
      return res.status(400).json({ error: "League is full" });
    }

    // Check if team name is unique in the league
    const nameExists = await prisma.team.findFirst({
      where: { name, leagueId },
    });

    if (nameExists) {
      return res
        .status(400)
        .json({ error: "Team name already exists in this league" });
    }

    const team = await prisma.team.create({
      data: {
        name,
        ownerId: user.id,
        leagueId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        league: {
          select: { id: true, name: true },
        },
        _count: {
          select: { draftPicks: true },
        },
      },
    });

    return res.status(201).json(team);
  } catch (error: any) {
    console.error("Create team error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to create team" });
  }
}

export async function getTeamsHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { leagueId } = req.query;

    if (!leagueId || typeof leagueId !== "string") {
      return res.status(400).json({ error: "League ID is required" });
    }

    // Check if user is a member of the league
    const leagueMember = await prisma.leagueMember.findFirst({
      where: { userId: user.id, leagueId },
    });

    if (!leagueMember) {
      return res
        .status(403)
        .json({ error: "You must be a member of the league to view teams" });
    }

    const teams = await prisma.team.findMany({
      where: { leagueId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { draftPicks: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json(teams);
  } catch (error: any) {
    console.error("Get teams error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to get teams" });
  }
}

export async function getTeamHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { id } = req.params;

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        league: {
          select: { id: true, name: true },
        },
        draftPicks: true,
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check if user is a member of the league
    const leagueMember = await prisma.leagueMember.findFirst({
      where: { userId: user.id, leagueId: team.leagueId },
    });

    if (!leagueMember) {
      return res.status(403).json({
        error: "You must be a member of the league to view this team",
      });
    }

    return res.status(200).json(team);
  } catch (error: any) {
    console.error("Get team error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to get team" });
  }
}

export async function updateTeamHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { id } = req.params;
    const parsed = updateTeamSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.errors });
    }

    // Check if team exists and user is the owner
    const team = await prisma.team.findFirst({
      where: { id, ownerId: user.id },
    });

    if (!team) {
      return res.status(404).json({
        error: "Team not found or you don't have permission to update it",
      });
    }

    // Check if league is still in signup phase
    const league = await prisma.league.findUnique({
      where: { id: team.leagueId },
    });

    if (!league || league.status !== "SIGNUP") {
      return res
        .status(400)
        .json({ error: "Cannot update team after signup period" });
    }

    // Check if new name is unique in the league (if name is being updated)
    if (parsed.data.name && parsed.data.name !== team.name) {
      const nameExists = await prisma.team.findFirst({
        where: {
          name: parsed.data.name,
          leagueId: team.leagueId,
          id: { not: id },
        },
      });

      if (nameExists) {
        return res
          .status(400)
          .json({ error: "Team name already exists in this league" });
      }
    }

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: parsed.data,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        league: {
          select: { id: true, name: true },
        },
        _count: {
          select: { draftPicks: true },
        },
      },
    });

    return res.status(200).json(updatedTeam);
  } catch (error: any) {
    console.error("Update team error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to update team" });
  }
}

export async function deleteTeamHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { id } = req.params;

    // Check if team exists and user is the owner
    const team = await prisma.team.findFirst({
      where: { id, ownerId: user.id },
    });

    if (!team) {
      return res.status(404).json({
        error: "Team not found or you don't have permission to delete it",
      });
    }

    // Check if league is still in signup phase
    const league = await prisma.league.findUnique({
      where: { id: team.leagueId },
    });

    if (!league || league.status !== "SIGNUP") {
      return res
        .status(400)
        .json({ error: "Cannot delete team after signup period" });
    }

    await prisma.team.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Team deleted successfully" });
  } catch (error: any) {
    console.error("Delete team error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to delete team" });
  }
}
