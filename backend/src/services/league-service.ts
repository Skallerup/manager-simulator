import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LeagueService {
  // Initialize the league system with 3 levels and bot teams
  static async initializeLeagueSystem() {
    console.log('Initializing league system...');
    
    // Check if leagues already exist
    const existingLeagues = await prisma.league.count();
    if (existingLeagues > 0) {
      console.log('League system already initialized');
      return;
    }

    // Create admin user for leagues
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true }
    });

    if (!adminUser) {
      throw new Error('No admin user found');
    }

    // Create 3 leagues
    const leagues = await Promise.all([
      prisma.league.create({
        data: {
          name: 'Superliga',
          description: 'Den bedste liga i spillet',
          level: 1,
          maxTeams: 12,
          adminId: adminUser.id,
          status: 'ACTIVE'
        }
      }),
      prisma.league.create({
        data: {
          name: '1. Division',
          description: 'Anden bedste liga',
          level: 2,
          maxTeams: 12,
          adminId: adminUser.id,
          status: 'ACTIVE'
        }
      }),
      prisma.league.create({
        data: {
          name: '2. Division',
          description: 'Laveste liga - alle starter her',
          level: 3,
          maxTeams: 12,
          adminId: adminUser.id,
          status: 'ACTIVE'
        }
      })
    ]);

    console.log(`Created ${leagues.length} leagues`);

    // Create bot teams for each league
    for (const league of leagues) {
      await this.createBotTeamsForLeague(league.id, league.level);
    }

    // Create current season for each league
    const currentYear = new Date().getFullYear();
    for (const league of leagues) {
      await prisma.season.create({
        data: {
          year: currentYear,
          status: 'ACTIVE',
          startDate: new Date(),
          leagueId: league.id
        }
      });
    }

    console.log('League system initialized successfully');
  }

  // Create bot teams for a specific league
  static async createBotTeamsForLeague(leagueId: string, level: number) {
    const botTeamNames = this.generateBotTeamNames(level);
    
    for (let i = 0; i < 12; i++) {
      const team = await prisma.team.create({
        data: {
          name: botTeamNames[i],
          isBot: true,
          leagueId: leagueId,
          budget: this.calculateBotBudget(level),
          colors: JSON.stringify({
            primary: this.generateRandomColor(),
            secondary: this.generateRandomColor()
          }),
          logo: this.generateRandomLogo()
        }
      });

      // Create players for bot team
      await this.createBotPlayersForTeam(team.id, level);
    }

    console.log(`Created 12 bot teams for league level ${level}`);
  }

  // Generate bot team names based on level
  static generateBotTeamNames(level: number): string[] {
    const baseNames = [
      'United', 'City', 'Arsenal', 'Chelsea', 'Liverpool', 'Tottenham',
      'West Ham', 'Leicester', 'Everton', 'Newcastle', 'Aston Villa', 'Brighton'
    ];

    const prefixes = level === 1 ? 
      ['FC', 'AC', 'SC', 'AS', 'Real', 'Atletico', 'Barcelona', 'Juventus', 'Inter', 'Milan', 'Bayern', 'Dortmund'] :
      level === 2 ?
      ['Athletic', 'Sporting', 'Racing', 'Olympic', 'Dynamo', 'Spartak', 'Lokomotiv', 'Zenit', 'CSKA', 'Shakhtar', 'Benfica', 'Porto'] :
      ['Rovers', 'Wanderers', 'Athletic', 'Town', 'United', 'City', 'Albion', 'Rangers', 'Celtic', 'Hearts', 'Hibs', 'Aberdeen'];

    return baseNames.map((name, index) => `${prefixes[index]} ${name}`);
  }

  // Calculate bot budget based on league level
  static calculateBotBudget(level: number): number {
    const baseBudget = 10000000; // 10M øre
    const multiplier = level === 1 ? 2.0 : level === 2 ? 1.5 : 1.0;
    return Math.floor(baseBudget * multiplier);
  }

  // Generate random color
  static generateRandomColor(): string {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#000080'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Generate random logo
  static generateRandomLogo(): string {
    const logos = ['logo1', 'logo2', 'logo3', 'logo4', 'logo5', 'logo6', 'logo7', 'logo8', 'logo9', 'logo10'];
    return logos[Math.floor(Math.random() * logos.length)];
  }

  // Create bot players for a team
  static async createBotPlayersForTeam(teamId: string, level: number) {
    const positions = [
      'GOALKEEPER', 
      'DEFENDER', 'DEFENDER', 'DEFENDER', 'DEFENDER', 
      'MIDFIELDER', 'MIDFIELDER', 'MIDFIELDER', 
      'ATTACKER', 'ATTACKER', 'ATTACKER',
      // Add 5 more players for a total of 16
      'DEFENDER', 'MIDFIELDER', 'ATTACKER', 'GOALKEEPER', 'DEFENDER'
    ];
    const danishNames = [
      'Lars', 'Anders', 'Mikkel', 'Jesper', 'Christian', 'Thomas', 'Michael', 'Henrik', 'Søren', 'Niels',
      'Peter', 'Jan', 'Ole', 'Erik', 'Kjeld', 'Bent', 'Poul', 'Svend', 'Knud', 'Vagn',
      'Morten', 'Steen', 'Flemming', 'Jørgen', 'Claus', 'Rasmus', 'Mads', 'Nikolaj', 'Daniel', 'Simon'
    ];

    for (let i = 0; i < 16; i++) {
      const position = positions[i] as 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'ATTACKER';
      const baseStats = this.calculateBotPlayerStats(level, position);
      
      const player = await prisma.player.create({
        data: {
          name: danishNames[Math.floor(Math.random() * danishNames.length)],
          age: Math.floor(Math.random() * 15) + 18, // 18-32
          position: position,
          speed: baseStats.speed,
          shooting: baseStats.shooting,
          passing: baseStats.passing,
          defending: baseStats.defending,
          stamina: baseStats.stamina,
          reflexes: baseStats.reflexes,
          marketValue: baseStats.marketValue,
          isGenerated: true,
          isCaptain: i === 0 // First player is captain
        }
      });

      // Add player to team
      await prisma.teamPlayer.create({
        data: {
          teamId: teamId,
          playerId: player.id,
          position: position,
          isStarter: i < 11 // Only first 11 players are starters
        }
      });

      // Set captain if first player
      if (i === 0) {
        await prisma.team.update({
          where: { id: teamId },
          data: { captainId: player.id }
        });
      }
    }
  }

  // Calculate bot player stats based on level and position
  static calculateBotPlayerStats(level: number, position: string) {
    const baseRating = level === 1 ? 75 : level === 2 ? 65 : 55;
    const variation = 10; // ±10 points variation
    
    let speed = Math.max(1, Math.min(100, baseRating + Math.floor(Math.random() * variation * 2) - variation));
    let shooting = Math.max(1, Math.min(100, baseRating + Math.floor(Math.random() * variation * 2) - variation));
    let passing = Math.max(1, Math.min(100, baseRating + Math.floor(Math.random() * variation * 2) - variation));
    let defending = Math.max(1, Math.min(100, baseRating + Math.floor(Math.random() * variation * 2) - variation));
    let stamina = Math.max(1, Math.min(100, baseRating + Math.floor(Math.random() * variation * 2) - variation));
    let reflexes = Math.max(1, Math.min(100, baseRating + Math.floor(Math.random() * variation * 2) - variation));

    // Position-specific bonuses
    if (position === 'GOALKEEPER') {
      reflexes = Math.min(100, reflexes + 15);
      defending = Math.min(100, defending + 10);
    } else if (position === 'DEFENDER') {
      defending = Math.min(100, defending + 15);
      speed = Math.min(100, speed + 5);
    } else if (position === 'MIDFIELDER') {
      passing = Math.min(100, passing + 15);
      stamina = Math.min(100, stamina + 10);
    } else if (position === 'ATTACKER') {
      shooting = Math.min(100, shooting + 15);
      speed = Math.min(100, speed + 10);
    }

    const overallRating = Math.floor((speed + shooting + passing + defending + stamina + reflexes) / 6);
    const marketValue = Math.floor(overallRating * 100000); // 100k øre per rating point

    return {
      speed,
      shooting,
      passing,
      defending,
      stamina,
      reflexes,
      marketValue
    };
  }

  // Assign user team to a league (replace a bot team)
  static async assignUserTeamToLeague(userTeamId: string) {
    // Find the 2. Division league (level 3)
    const division2 = await prisma.league.findFirst({
      where: { level: 3 },
      include: { teams: true }
    });

    if (!division2) {
      throw new Error('2. Division league not found');
    }

    // Find a bot team to replace
    const botTeam = division2.teams.find(team => team.isBot);
    if (!botTeam) {
      throw new Error('No bot team available to replace');
    }

    // Get user team
    const userTeam = await prisma.team.findUnique({
      where: { id: userTeamId },
      include: { players: { include: { player: true } } }
    });

    if (!userTeam) {
      throw new Error('User team not found');
    }

    // Move user team to league
    await prisma.team.update({
      where: { id: userTeamId },
      data: { leagueId: division2.id }
    });

    // Delete bot team and its players
    await prisma.teamPlayer.deleteMany({
      where: { teamId: botTeam.id }
    });
    
    await prisma.player.deleteMany({
      where: { 
        teamPlayers: {
          some: { teamId: botTeam.id }
        }
      }
    });

    await prisma.team.delete({
      where: { id: botTeam.id }
    });

    console.log(`User team ${userTeam.name} assigned to ${division2.name}, replaced bot team ${botTeam.name}`);
  }

  // Get league standings
  static async getLeagueStandings(leagueId: string, seasonId?: string) {
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        teams: {
          include: {
            seasonStats: {
              where: seasonId ? { seasonId } : undefined,
              orderBy: { points: 'desc' }
            }
          }
        }
      }
    });

    if (!league) {
      throw new Error('League not found');
    }

    return league.teams.map(team => ({
      id: team.id,
      name: team.name,
      isBot: team.isBot,
      stats: team.seasonStats[0] || {
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        position: 0
      }
    }));
  }

  // Get all leagues with basic info
  static async getAllLeagues() {
    return await prisma.league.findMany({
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
      },
      orderBy: { level: 'asc' }
    });
  }
}
