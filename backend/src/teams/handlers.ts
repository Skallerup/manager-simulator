import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { createTeamSchema, updateTeamSchema } from "./types";
import { verifyAccessToken } from "../auth/tokens";
import { TeamService } from "../services/team-service";
import { LeagueService } from "../services/league-service";

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

    const { name, colors, logo } = parsed.data;

    // Check if user already has a team
    const existingTeam = await prisma.team.findFirst({
      where: { ownerId: user.id },
    });

    if (existingTeam) {
      return res
        .status(400)
        .json({ error: "You already have a team" });
    }

    // Create team with generated players
    const team = await TeamService.createTeamWithGeneratedPlayers({
      name,
      colors,
      logo,
      ownerId: user.id
    });

    // Assign team to 2. Division league
    try {
      await LeagueService.assignUserTeamToLeague(team.id);
      console.log(`Team ${team.name} assigned to 2. Division`);
    } catch (error) {
      console.error('Error assigning team to league:', error);
      // Don't fail team creation if league assignment fails
    }

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
    
    // Get user's teams
    const teams = await TeamService.getUserTeams(user.id);

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

    const team = await TeamService.getTeamWithPlayers(id);

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check if user owns the team
    const teamRecord = await prisma.team.findFirst({
      where: { id, ownerId: user.id },
    });

    if (!teamRecord) {
      return res.status(403).json({
        error: "You don't have permission to view this team",
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

    // Check if new name is unique (if name is being updated)
    if (parsed.data.name && parsed.data.name !== team.name) {
      const nameExists = await prisma.team.findFirst({
        where: {
          name: parsed.data.name,
          ownerId: user.id,
          id: { not: id },
        },
      });

      if (nameExists) {
        return res
          .status(400)
          .json({ error: "Team name already exists" });
      }
    }

    const updatedTeam = await TeamService.updateTeam(id, parsed.data);

    if (!updatedTeam) {
      return res.status(404).json({ error: "Team not found" });
    }

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

    await TeamService.deleteTeam(id);

    return res.status(200).json({ message: "Team deleted successfully" });
  } catch (error: any) {
    console.error("Delete team error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to delete team" });
  }
}

export async function getMyTeamHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);

    // Get user's team
    const team = await prisma.team.findFirst({
      where: { ownerId: user.id },
      include: {
        players: {
          include: {
            player: true
          }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: "No team found for user" });
    }

    // Calculate overall rating
    const playerData = team.players.map(tp => tp.player);
    const overallRating = TeamService.calculateTeamRating(playerData);

    // Check if team has a captain, if not set the best goalkeeper as captain
    const hasCaptain = team.players.some(tp => tp.player.isCaptain);
    if (!hasCaptain) {
      const goalkeepers = team.players.filter(tp => tp.position === 'GOALKEEPER');
      if (goalkeepers.length > 0) {
        // Find the goalkeeper with highest rating
        const bestGoalkeeper = goalkeepers.reduce((best, current) => {
          const bestRating = (best.player.speed + best.player.shooting + best.player.passing + 
                            best.player.defending + best.player.stamina + best.player.reflexes) / 6;
          const currentRating = (current.player.speed + current.player.shooting + current.player.passing + 
                               current.player.defending + current.player.stamina + current.player.reflexes) / 6;
          return currentRating > bestRating ? current : best;
        });

        // Set as captain
        await prisma.player.update({
          where: { id: bestGoalkeeper.player.id },
          data: { isCaptain: true }
        });

        // Update the team's captainId
        await prisma.team.update({
          where: { id: team.id },
          data: { captainId: bestGoalkeeper.player.id }
        });
      }
    }

    res.json({
      id: team.id,
      name: team.name,
      formation: team.formation,
      colors: team.colors ? JSON.parse(team.colors) : null,
      logo: team.logo,
      budget: team.budget,
      overallRating,
      players: team.players.map(tp => ({
        id: tp.player.id,
        name: tp.player.name,
        position: tp.position,
        formationPosition: tp.formationPosition,
        age: tp.player.age,
        rating: Math.floor(Math.random() * 40) + 60, // Random overall 60-100
        isStarter: tp.isStarter,
        isCaptain: tp.player.isCaptain
      })),
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString()
    });
  } catch (error) {
    console.error("Error getting my team:", error);
    res.status(500).json({ error: "Failed to get team" });
  }
}

export async function setCaptainHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { teamId, playerId } = req.params;

    // Check if team exists and user is the owner
    const team = await prisma.team.findFirst({
      where: { id: teamId, ownerId: user.id },
    });

    if (!team) {
      return res.status(404).json({
        error: "Team not found or you don't have permission to update it",
      });
    }

    // Check if player belongs to the team
    const teamPlayer = await prisma.teamPlayer.findFirst({
      where: { teamId, playerId },
    });

    if (!teamPlayer) {
      return res.status(400).json({
        error: "Player is not on this team",
      });
    }

    const updatedTeam = await TeamService.setCaptain(teamId, playerId);

    if (!updatedTeam) {
      return res.status(404).json({ error: "Team not found" });
    }

    return res.status(200).json(updatedTeam);
  } catch (error: any) {
    console.error("Set captain error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to set captain" });
  }
}

// Update team formation
export async function updateFormationHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { teamId } = req.params;
    const { formation } = req.body;

    const validFormations = ['4-4-2', '4-3-3', '3-5-2', '5-3-2'];
    if (!validFormations.includes(formation)) {
      return res.status(400).json({ error: 'Invalid formation' });
    }

    // Check if team exists and user is the owner
    const team = await prisma.team.findFirst({
      where: { id: teamId, ownerId: user.id },
      include: { players: { include: { player: true } } }
    });

    if (!team) {
      return res.status(404).json({
        error: "Team not found or you don't have permission to update it",
      });
    }

    // Update formation
    await prisma.team.update({
      where: { id: teamId },
      data: { formation }
    });

    // Update formation positions for starters
    const starters = team.players.filter(tp => tp.isStarter).slice(0, 11);
    const formationPositions = getFormationPositions(formation);

    for (let i = 0; i < starters.length && i < formationPositions.length; i++) {
      await prisma.teamPlayer.update({
        where: { id: starters[i].id },
        data: { formationPosition: formationPositions[i] }
      });
    }

    res.json({ success: true, formation });
  } catch (error) {
    console.error("Error updating formation:", error);
    res.status(500).json({ error: "Failed to update formation" });
  }
}

// Swap players in formation
export async function swapPlayersHandler(req: Request, res: Response) {
  try {
    const user = await getUserFromToken(req);
    const { teamId } = req.params;
    const { fromPlayerId, toPlayerId } = req.body;

    // Check if team exists and user is the owner
    const team = await prisma.team.findFirst({
      where: { id: teamId, ownerId: user.id },
    });

    if (!team) {
      return res.status(404).json({
        error: "Team not found or you don't have permission to update it",
      });
    }

    // Get both players
    const fromPlayer = await prisma.teamPlayer.findFirst({
      where: { teamId, playerId: fromPlayerId },
      include: { player: true }
    });

    const toPlayer = await prisma.teamPlayer.findFirst({
      where: { teamId, playerId: toPlayerId },
      include: { player: true }
    });

    if (!fromPlayer || !toPlayer) {
      return res.status(404).json({ error: "One or both players not found" });
    }

    // Validate position compatibility
    if (!isPositionCompatible(fromPlayer.player.position, toPlayer.player.position)) {
      return res.status(400).json({ 
        error: "Players cannot be swapped - incompatible positions",
        fromPosition: fromPlayer.player.position,
        toPosition: toPlayer.player.position
      });
    }

    // Swap their starter status and formation positions
    const fromStarter = fromPlayer.isStarter;
    const fromFormationPosition = fromPlayer.formationPosition;

    await prisma.teamPlayer.update({
      where: { id: fromPlayer.id },
      data: { 
        isStarter: toPlayer.isStarter,
        formationPosition: toPlayer.formationPosition
      }
    });

    await prisma.teamPlayer.update({
      where: { id: toPlayer.id },
      data: { 
        isStarter: fromStarter,
        formationPosition: fromFormationPosition
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error swapping players:", error);
    res.status(500).json({ error: "Failed to swap players" });
  }
}

// Helper function to get formation positions
function getFormationPositions(formation: string): string[] {
  const formations = {
    '4-4-2': ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'],
    '4-3-3': ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'LW', 'ST', 'RW'],
    '3-5-2': ['GK', 'CB', 'CB', 'CB', 'LM', 'CM', 'CM', 'CM', 'RM', 'ST', 'ST'],
    '5-3-2': ['GK', 'LB', 'CB', 'CB', 'RB', 'LWB', 'CM', 'CM', 'RWB', 'ST', 'ST']
  };
  
  return formations[formation as keyof typeof formations] || formations['4-4-2'];
}

// Helper function to check position compatibility
function isPositionCompatible(position1: string, position2: string): boolean {
  // Same position is always compatible
  if (position1 === position2) return true;
  
  // Goalkeepers can only play goalkeeper
  if (position1 === 'GOALKEEPER' || position2 === 'GOALKEEPER') return false;
  
  // Defenders can play with defenders
  if (position1 === 'DEFENDER' && position2 === 'DEFENDER') return true;
  
  // Midfielders can play with midfielders
  if (position1 === 'MIDFIELDER' && position2 === 'MIDFIELDER') return true;
  
  // Attackers can play with attackers
  if (position1 === 'ATTACKER' && position2 === 'ATTACKER') return true;
  
  return false;
}
