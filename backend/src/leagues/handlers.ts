import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { LeagueService } from '../services/league-service';
import { verifyAccessToken } from '../auth/tokens';

const prisma = new PrismaClient();

// Get all leagues
export const getAllLeagues = async (req: Request, res: Response) => {
  try {
    const leagues = await LeagueService.getAllLeagues();
    res.json(leagues);
  } catch (error) {
    console.error('Error fetching leagues:', error);
    res.status(500).json({ error: 'Failed to fetch leagues' });
  }
};

// Get league by ID
export const getLeagueById = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params;
    
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        teams: {
          select: {
            id: true,
            name: true,
            isBot: true
          }
        },
        seasons: {
          where: { status: 'ACTIVE' },
          take: 1
        }
      }
    });

    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    res.json(league);
  } catch (error) {
    console.error('Error fetching league:', error);
    res.status(500).json({ error: 'Failed to fetch league' });
  }
};

// Get league standings
export const getLeagueStandings = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params;
    const { seasonId } = req.query;
    
    const standings = await LeagueService.getLeagueStandings(
      leagueId, 
      seasonId as string
    );
    
    res.json(standings);
  } catch (error) {
    console.error('Error fetching league standings:', error);
    res.status(500).json({ error: 'Failed to fetch league standings' });
  }
};

// Get user's current league
export const getUserLeague = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req);
    
    const userTeam = await prisma.team.findFirst({
      where: { 
        ownerId: user.id,
        isBot: false
      },
      include: {
        league: {
          include: {
            teams: {
              select: {
                id: true,
                name: true,
                isBot: true
              }
            }
          }
        }
      }
    });

    if (!userTeam || !userTeam.league) {
      return res.status(404).json({ error: 'User team not found or not in a league' });
    }

    res.json({
      league: userTeam.league,
      userTeam: {
        id: userTeam.id,
        name: userTeam.name,
        isBot: userTeam.isBot
      }
    });
  } catch (error) {
    console.error('Error fetching user league:', error);
    res.status(500).json({ error: 'Failed to fetch user league' });
  }
};

// Assign user team to league (when creating a new team)
export const assignUserTeamToLeague = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.body;
    const user = await getUserFromToken(req);
    
    // Verify team belongs to user
    const team = await prisma.team.findFirst({
      where: { 
        id: teamId,
        ownerId: user.id,
        isBot: false
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found or not owned by user' });
    }

    // Check if team is already in a league
    if (team.leagueId) {
      return res.status(400).json({ error: 'Team is already in a league' });
    }

    // Assign team to 2. Division
    await LeagueService.assignUserTeamToLeague(teamId);
    
    res.json({ message: 'Team assigned to league successfully' });
  } catch (error) {
    console.error('Error assigning team to league:', error);
    res.status(500).json({ error: 'Failed to assign team to league' });
  }
};

// Get league matches
export const getLeagueMatches = async (req: Request, res: Response) => {
  try {
    const { leagueId } = req.params;
    const { seasonId } = req.query;
    
    const matches = await prisma.match.findMany({
      where: {
        leagueId: leagueId,
        seasonId: seasonId as string || undefined
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            isBot: true
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            isBot: true
          }
        }
      },
      orderBy: { matchDate: 'desc' }
    });

    res.json(matches);
  } catch (error) {
    console.error('Error fetching league matches:', error);
    res.status(500).json({ error: 'Failed to fetch league matches' });
  }
};

// Helper function to get user from token
async function getUserFromToken(req: Request) {
  const accessToken = req.cookies?.access_token as string | undefined;
  if (!accessToken) {
    throw new Error('No access token provided');
  }

  const payload = verifyAccessToken(accessToken);
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}