import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GameEngine } from '../services/game-engine/engine';
import { CreateMatchRequest, MatchResponse, SimulateMatchRequest, SimulateMatchResponse } from './types';
import { verifyAccessToken } from '../auth/tokens';

const prisma = new PrismaClient();
const gameEngine = new GameEngine();

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

export const createMatch = async (req: Request<{}, MatchResponse, CreateMatchRequest>, res: Response) => {
  try {
    const { leagueId, homeTeamId, awayTeamId, matchDate } = req.body;

    // Verify teams exist and belong to the league
    const homeTeam = await prisma.team.findFirst({
      where: { id: homeTeamId, leagueId }
    });

    const awayTeam = await prisma.team.findFirst({
      where: { id: awayTeamId, leagueId }
    });

    if (!homeTeam || !awayTeam) {
      return res.status(400).json({ error: 'One or both teams not found in the specified league' });
    }

    if (homeTeamId === awayTeamId) {
      return res.status(400).json({ error: 'A team cannot play against itself' });
    }

    const match = await prisma.match.create({
      data: {
        leagueId,
        homeTeamId,
        awayTeamId,
        matchDate: new Date(matchDate),
        status: 'SCHEDULED'
      },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } }
      }
    });

    const response: MatchResponse = {
      id: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      status: match.status as any,
      matchDate: match.matchDate.toISOString(),
      createdAt: match.createdAt.toISOString(),
      updatedAt: match.updatedAt.toISOString()
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Failed to create match' });
  }
};

export const getMatches = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.query;

    const matches = await prisma.match.findMany({
      where: leagueId ? { leagueId: leagueId as string } : {},
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } }
      },
      orderBy: { matchDate: 'desc' }
    });

    const response: MatchResponse[] = matches.map(match => ({
      id: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      status: match.status as any,
      matchDate: match.matchDate.toISOString(),
      createdAt: match.createdAt.toISOString(),
      updatedAt: match.updatedAt.toISOString()
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
};

export const simulateMatch = async (req: Request<{ id: string }, SimulateMatchResponse, SimulateMatchRequest>, res: Response) => {
  try {
    const { id: matchId } = req.params;

    // Get match with teams and their players
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: {
          include: {
            players: {
              include: {
                player: true
              }
            }
          }
        },
        awayTeam: {
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

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.status !== 'SCHEDULED') {
      return res.status(400).json({ error: 'Match is not in scheduled status' });
    }

    // Convert database players to game engine format
    const homeTeamPlayers = match.homeTeam.players.map(tp => ({
      id: tp.player.id,
      name: tp.player.name,
      position: tp.position,
      age: tp.player.age,
      overall: Math.floor(Math.random() * 40) + 60, // Random overall 60-100
      pace: Math.floor(Math.random() * 40) + 60,
      shooting: Math.floor(Math.random() * 40) + 60,
      passing: Math.floor(Math.random() * 40) + 60,
      defending: Math.floor(Math.random() * 40) + 60,
      physical: Math.floor(Math.random() * 40) + 60,
      isStarter: tp.isStarter
    }));

    const awayTeamPlayers = match.awayTeam.players.map(tp => ({
      id: tp.player.id,
      name: tp.player.name,
      position: tp.position,
      age: tp.player.age,
      overall: Math.floor(Math.random() * 40) + 60, // Random overall 60-100
      pace: Math.floor(Math.random() * 40) + 60,
      shooting: Math.floor(Math.random() * 40) + 60,
      passing: Math.floor(Math.random() * 40) + 60,
      defending: Math.floor(Math.random() * 40) + 60,
      physical: Math.floor(Math.random() * 40) + 60,
      isStarter: tp.isStarter
    }));

    const homeTeam = {
      id: match.homeTeam.id,
      name: match.homeTeam.name,
      formation: match.homeTeam.formation,
      players: homeTeamPlayers
    };

    const awayTeam = {
      id: match.awayTeam.id,
      name: match.awayTeam.name,
      formation: match.awayTeam.formation,
      players: awayTeamPlayers
    };

    // Simulate the match
    const result = gameEngine.simulateMatch(homeTeam, awayTeam);

    // Update match with results
    await prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore: result.homeScore,
        awayScore: result.awayScore,
        status: 'COMPLETED'
      }
    });

    const response: SimulateMatchResponse = {
      matchId: match.id,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      events: result.events,
      possession: result.possession,
      shots: result.shots,
      shotsOnTarget: result.shotsOnTarget
    };

    res.json(response);
  } catch (error) {
    console.error('Error simulating match:', error);
    res.status(500).json({ error: 'Failed to simulate match' });
  }
};

export const getMatchById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } }
      }
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const response: MatchResponse = {
      id: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      status: match.status as any,
      matchDate: match.matchDate.toISOString(),
      createdAt: match.createdAt.toISOString(),
      updatedAt: match.updatedAt.toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
};

// Bot match handlers
export const createBotMatch = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req);
    const { botDifficulty, botRating } = req.body;

    // Get user's team
    const userTeam = await prisma.team.findFirst({
      where: { ownerId: user.id },
      include: {
        players: {
          include: {
            player: true
          }
        }
      }
    });

    if (!userTeam) {
      return res.status(404).json({ error: 'User team not found' });
    }

    // Create bot match record
    const botMatch = await prisma.botMatch.create({
      data: {
        ownerId: user.id,
        userTeamId: userTeam.id,
        botDifficulty,
        botRating,
        status: 'SCHEDULED'
      }
    });

    res.status(201).json({
      id: botMatch.id,
      userTeamId: userTeam.id,
      botDifficulty,
      botRating,
      status: botMatch.status,
      createdAt: botMatch.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error creating bot match:', error);
    res.status(500).json({ error: 'Failed to create bot match' });
  }
};

export const simulateBotMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { events } = req.body; // Events from frontend simulation

    // Get bot match
    const botMatch = await prisma.botMatch.findUnique({
      where: { id },
      include: {
        userTeam: {
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

    if (!botMatch) {
      return res.status(404).json({ error: 'Bot match not found' });
    }

    if (botMatch.status !== 'SCHEDULED' && botMatch.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Match is not in scheduled or completed status' });
    }

    // Calculate final score from events
    const userScore = events.filter((e: any) => e.type === 'goal' && e.team === 'player').length;
    const botScore = events.filter((e: any) => e.type === 'goal' && e.team === 'bot').length;

    // Update bot match with results
    const updatedMatch = await prisma.botMatch.update({
      where: { id },
      data: {
        userScore,
        botScore,
        status: 'COMPLETED',
        events: JSON.stringify(events)
      }
    });

    res.json({
      id: updatedMatch.id,
      userScore: updatedMatch.userScore,
      botScore: updatedMatch.botScore,
      status: updatedMatch.status,
      events: JSON.parse(updatedMatch.events || '[]')
    });
  } catch (error) {
    console.error('Error simulating bot match:', error);
    res.status(500).json({ error: 'Failed to simulate bot match' });
  }
};

export const getBotMatches = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req);

    const botMatches = await prisma.botMatch.findMany({
      where: { ownerId: user.id },
      include: {
        userTeam: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const response = botMatches.map(match => ({
      id: match.id,
      userTeam: match.userTeam,
      botDifficulty: match.botDifficulty,
      botRating: match.botRating,
      userScore: match.userScore,
      botScore: match.botScore,
      status: match.status,
      events: match.events ? JSON.parse(match.events) : [],
      createdAt: match.createdAt.toISOString()
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching bot matches:', error);
    res.status(500).json({ error: 'Failed to fetch bot matches' });
  }
};
