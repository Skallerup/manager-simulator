import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { verifyAccessToken } from "../auth/tokens";
import { GameEngine } from "../services/game-engine/engine";
import {
  CreateTrainingMatchRequest,
  TrainingMatchResponse,
  SimulateTrainingMatchRequest,
  SimulateTrainingMatchResponse,
  LeagueTeam 
} from './types';

const gameEngine = new GameEngine();

// Helper function to get user from token
async function getUserFromToken(req: Request) {
  console.log("Training matches - Cookies received:", req.cookies);
  console.log("Training matches - Headers cookie:", req.headers.cookie);
  
  let accessToken = req.cookies?.access_token as string | undefined;
  
  // If not found in cookies, try parsing from headers.cookie
  if (!accessToken && req.headers.cookie) {
    const cookieString = req.headers.cookie;
    const cookies = cookieString.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as any);
    accessToken = cookies.access_token;
    console.log("Training matches - Parsed access_token from headers:", accessToken);
  }
  
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

export const getLeagueTeams = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req);
    
    // Get user's team and league
    const userTeam = await prisma.team.findFirst({
      where: { ownerId: user.id },
      include: { league: true }
    });

    if (!userTeam || !userTeam.leagueId) {
      return res.status(400).json({ error: 'User team not found or not in a league' });
    }

    // Get all teams in the same league (excluding user's own team)
    const leagueTeams = await prisma.team.findMany({
      where: { 
        leagueId: userTeam.leagueId,
        id: { not: userTeam.id }
      },
      include: {
        owner: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const teams: LeagueTeam[] = leagueTeams.map(team => ({
      id: team.id,
      name: team.name,
      overallRating: team.overallRating,
      formation: team.formation,
      isBot: team.isBot,
      owner: team.owner ? {
        id: team.owner.id,
        name: team.owner.name || 'Unknown'
      } : undefined
    }));

    res.json(teams);
  } catch (error) {
    console.error('Error fetching league teams:', error);
    res.status(500).json({ error: 'Failed to fetch league teams' });
  }
};

export const createTrainingMatch = async (req: Request<{}, TrainingMatchResponse, CreateTrainingMatchRequest>, res: Response) => {
  try {
    const { opponentTeamId } = req.body;
    const user = await getUserFromToken(req);

    // Get user's team
    const userTeam = await prisma.team.findFirst({
      where: { ownerId: user.id }
    });

    if (!userTeam) {
      return res.status(400).json({ error: 'User team not found' });
    }

    // Verify opponent team exists and is in the same league
    const opponentTeam = await prisma.team.findFirst({
      where: { 
        id: opponentTeamId,
        leagueId: userTeam.leagueId
      }
    });

    if (!opponentTeam) {
      return res.status(400).json({ error: 'Opponent team not found in your league' });
    }

    if (opponentTeam.id === userTeam.id) {
      return res.status(400).json({ error: 'Cannot play against your own team' });
    }

    // Create training match
    const trainingMatch = await prisma.trainingMatch.create({
      data: {
        ownerId: user.id,
        userTeamId: userTeam.id,
        opponentTeamId: opponentTeam.id,
        status: 'SCHEDULED'
      },
      include: {
        userTeam: { select: { id: true, name: true } },
        opponentTeam: { select: { id: true, name: true } }
      }
    });

    const response: TrainingMatchResponse = {
      id: trainingMatch.id,
      userTeam: trainingMatch.userTeam,
      opponentTeam: trainingMatch.opponentTeam,
      userScore: trainingMatch.userScore || 0,
      opponentScore: trainingMatch.opponentScore || 0,
      status: trainingMatch.status as any,
      events: trainingMatch.events,
      highlights: trainingMatch.highlights,
      createdAt: trainingMatch.createdAt.toISOString(),
      updatedAt: trainingMatch.updatedAt.toISOString()
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating training match:', error);
    res.status(500).json({ error: 'Failed to create training match' });
  }
};

export const getTrainingMatches = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req);

    const matches = await prisma.trainingMatch.findMany({
      where: { ownerId: user.id },
      include: {
        userTeam: { select: { id: true, name: true } },
        opponentTeam: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const response: TrainingMatchResponse[] = matches.map(match => ({
      id: match.id,
      userTeam: match.userTeam,
      opponentTeam: match.opponentTeam,
      userScore: match.userScore || 0,
      opponentScore: match.opponentScore || 0,
      status: match.status as any,
      events: match.events,
      highlights: match.highlights,
      createdAt: match.createdAt.toISOString(),
      updatedAt: match.updatedAt.toISOString()
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching training matches:', error);
    res.status(500).json({ error: 'Failed to fetch training matches' });
  }
};

export const simulateTrainingMatch = async (req: Request<{ id: string }, SimulateTrainingMatchResponse, SimulateTrainingMatchRequest>, res: Response) => {
  try {
    const { id: matchId } = req.params;

    // Get training match with teams and their players
    const trainingMatch = await prisma.trainingMatch.findUnique({
      where: { id: matchId },
      include: {
        userTeam: {
          include: {
            players: {
              include: {
                player: true
              }
            },
            stadium: true
          }
        },
        opponentTeam: {
          include: {
            players: {
              include: {
                player: true
              }
            }
          }
        }
      }
    });

    if (!trainingMatch) {
      return res.status(404).json({ error: 'Training match not found' });
    }

    if (trainingMatch.status !== 'SCHEDULED') {
      return res.status(400).json({ error: 'Training match is not in scheduled status' });
    }

    // Convert database players to game engine format - ONLY STARTERS
    const userTeamPlayers = trainingMatch.userTeam.players
      .filter(tp => tp.isStarter)
      .map(tp => {
        const overall = Math.floor((tp.player.speed + tp.player.shooting + tp.player.passing + 
                                  tp.player.defending + tp.player.stamina + tp.player.reflexes) / 6);
        return {
          id: tp.player.id,
          name: tp.player.name,
          position: tp.position,
          age: tp.player.age,
          overall: overall,
          speed: tp.player.speed,
          shooting: tp.player.shooting,
          passing: tp.player.passing,
          defending: tp.player.defending,
          stamina: tp.player.stamina,
          reflexes: tp.player.reflexes,
          isCaptain: tp.player.isCaptain,
          isStarter: tp.isStarter
        };
      });

    const opponentTeamPlayers = trainingMatch.opponentTeam.players
      .filter(tp => tp.isStarter)
      .map(tp => {
        const overall = Math.floor((tp.player.speed + tp.player.shooting + tp.player.passing + 
                                  tp.player.defending + tp.player.stamina + tp.player.reflexes) / 6);
        return {
          id: tp.player.id,
          name: tp.player.name,
          position: tp.position,
          age: tp.player.age,
          overall: overall,
          speed: tp.player.speed,
          shooting: tp.player.shooting,
          passing: tp.player.passing,
          defending: tp.player.defending,
          stamina: tp.player.stamina,
          reflexes: tp.player.reflexes,
          isCaptain: tp.player.isCaptain,
          isStarter: tp.isStarter
        };
      });

    const userTeam = {
      id: trainingMatch.userTeam.id,
      name: trainingMatch.userTeam.name,
      formation: trainingMatch.userTeam.formation,
      players: userTeamPlayers
    };

    const opponentTeam = {
      id: trainingMatch.opponentTeam.id,
      name: trainingMatch.opponentTeam.name,
      formation: trainingMatch.opponentTeam.formation,
      players: opponentTeamPlayers
    };

    // Get stadium home advantage (user team is always home in training matches)
    const homeAdvantage = trainingMatch.userTeam.stadium?.homeAdvantage || 0.1;
    console.log(`Training match simulation - User team: ${userTeam.name}, Stadium home advantage: ${(homeAdvantage * 100).toFixed(1)}%`);
    
    // Simulate the match with stadium home advantage
    const result = gameEngine.simulateMatch(userTeam, opponentTeam, { homeAdvantage });

    // Update training match with results
    await prisma.trainingMatch.update({
      where: { id: matchId },
      data: {
        userScore: result.homeScore,
        opponentScore: result.awayScore,
        status: 'COMPLETED',
        events: JSON.stringify(result.events),
        highlights: JSON.stringify(result.highlights)
      }
    });

    const response: SimulateTrainingMatchResponse = {
      matchId: trainingMatch.id,
      userScore: result.homeScore,
      opponentScore: result.awayScore,
      events: result.events,
      highlights: result.highlights,
      stats: {
        userPossession: result.possession?.home || 0,
        opponentPossession: result.possession?.away || 0,
        userShots: result.shots?.home || 0,
        opponentShots: result.shots?.away || 0,
        userShotsOnTarget: result.shotsOnTarget?.home || 0,
        opponentShotsOnTarget: result.shotsOnTarget?.away || 0
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error simulating training match:', error);
    res.status(500).json({ error: 'Failed to simulate training match' });
  }
};
