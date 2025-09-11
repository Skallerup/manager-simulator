import { prisma } from '../prisma/client';
import { PlayerGenerator, GeneratedPlayer } from './player-generator';
import { PlayerPosition } from '@prisma/client';

export interface CreateTeamData {
  name: string;
  colors?: string;
  logo?: string;
  ownerId: string;
}

export interface TeamWithPlayers {
  id: string;
  name: string;
  formation: string;
  colors: string | null;
  logo: string | null;
  budget: number;
  overallRating: number;
  players: {
    id: string;
    name: string;
    age: number;
    position: PlayerPosition;
    speed: number;
    shooting: number;
    passing: number;
    defending: number;
    stamina: number;
    reflexes: number;
    marketValue: number;
    isCaptain: boolean;
    isStarter: boolean;
  }[];
}

export class TeamService {
  /**
   * Creates a new team with generated players for a user
   */
  public static async createTeamWithGeneratedPlayers(data: CreateTeamData): Promise<TeamWithPlayers> {
    // Get or create Rookie League
    let rookieLeague = await prisma.rookieLeague.findFirst({
      where: { status: 'ACTIVE' }
    });

    if (!rookieLeague) {
      rookieLeague = await prisma.rookieLeague.create({
        data: {
          name: 'Rookie League',
          description: 'League for new players',
          maxTeams: 50,
          status: 'ACTIVE'
        }
      });
    }

    // Generate team colors and logo if not provided
    const colors = data.colors || JSON.stringify(PlayerGenerator.getRandomTeamColors());
    const logo = data.logo || PlayerGenerator.getRandomTeamLogo();

    // Create the team
    const team = await prisma.team.create({
      data: {
        name: data.name,
        colors,
        logo,
        budget: 10000000, // 10,000,000 øre = 100,000 kr
        ownerId: data.ownerId,
        rookieLeagueId: rookieLeague.id
      }
    });

    // Generate players
    const generatedPlayers = PlayerGenerator.generateTeam();
    
    // Create players in database
    const createdPlayers = await Promise.all(
      generatedPlayers.map(async (playerData, index) => {
        const player = await prisma.player.create({
          data: {
            name: playerData.name,
            age: playerData.age,
            position: playerData.position,
            speed: playerData.speed,
            shooting: playerData.shooting,
            passing: playerData.passing,
            defending: playerData.defending,
            stamina: playerData.stamina,
            reflexes: playerData.reflexes,
            marketValue: playerData.marketValue,
            isGenerated: true,
            isCaptain: playerData.isCaptain,
            number: index + 1
          }
        });

        // Add player to team
        await prisma.teamPlayer.create({
          data: {
            teamId: team.id,
            playerId: player.id,
            position: this.getFieldPosition(playerData.position),
            isStarter: true // All generated players start as starters
          }
        });

        return {
          id: player.id,
          name: player.name,
          age: player.age,
          position: player.position,
          speed: player.speed,
          shooting: player.shooting,
          passing: player.passing,
          defending: player.defending,
          stamina: player.stamina,
          reflexes: player.reflexes,
          marketValue: player.marketValue,
          isCaptain: player.isCaptain,
          isStarter: true
        };
      })
    );

    // Calculate overall rating using only starters (first 11 players)
    const starterPlayers = createdPlayers.slice(0, 11);
    const overallRating = this.calculateTeamRating(starterPlayers);

    return {
      id: team.id,
      name: team.name,
      formation: team.formation,
      colors: team.colors,
      logo: team.logo,
      budget: team.budget,
      overallRating: overallRating,
      players: createdPlayers
    };
  }

  /**
   * Gets a team with all its players
   */
  public static async getTeamWithPlayers(teamId: string): Promise<TeamWithPlayers | null> {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        players: {
          include: {
            player: true
          }
        }
      }
    });

    if (!team) return null;

    // Calculate overall rating using only starters
    const starterPlayers = team.players.filter(tp => tp.isStarter).map(tp => tp.player);
    const overallRating = this.calculateTeamRating(starterPlayers);

    return {
      id: team.id,
      name: team.name,
      formation: team.formation,
      colors: team.colors,
      logo: team.logo,
      budget: team.budget,
      overallRating: overallRating,
      players: team.players.map(tp => ({
        id: tp.player.id,
        name: tp.player.name,
        age: tp.player.age,
        position: tp.player.position,
        speed: tp.player.speed,
        shooting: tp.player.shooting,
        passing: tp.player.passing,
        defending: tp.player.defending,
        stamina: tp.player.stamina,
        reflexes: tp.player.reflexes,
        marketValue: tp.player.marketValue,
        isCaptain: tp.player.isCaptain,
        isStarter: tp.isStarter
      }))
    };
  }

  /**
   * Gets all teams for a user
   */
  public static async getUserTeams(userId: string): Promise<TeamWithPlayers[]> {
    const teams = await prisma.team.findMany({
      where: { ownerId: userId },
      include: {
        players: {
          include: {
            player: true
          }
        }
      }
    });

    return teams.map(team => ({
      id: team.id,
      name: team.name,
      formation: team.formation,
      colors: team.colors,
      logo: team.logo,
      budget: team.budget,
      overallRating: this.calculateTeamRating(team.players.map(tp => tp.player)),
      players: team.players.map(tp => ({
        id: tp.player.id,
        name: tp.player.name,
        age: tp.player.age,
        position: tp.player.position,
        speed: tp.player.speed,
        shooting: tp.player.shooting,
        passing: tp.player.passing,
        defending: tp.player.defending,
        stamina: tp.player.stamina,
        reflexes: tp.player.reflexes,
        marketValue: tp.player.marketValue,
        isCaptain: tp.player.isCaptain,
        isStarter: tp.isStarter
      }))
    }));
  }

  /**
   * Updates team information
   */
  public static async updateTeam(teamId: string, data: {
    name?: string;
    formation?: string;
    colors?: string;
    logo?: string;
  }): Promise<TeamWithPlayers | null> {
    const team = await prisma.team.update({
      where: { id: teamId },
      data
    });

    return this.getTeamWithPlayers(team.id);
  }

  /**
   * Sets a player as team captain
   */
  public static async setCaptain(teamId: string, playerId: string): Promise<TeamWithPlayers | null> {
    // First, remove captain status from all players in the team
    await prisma.player.updateMany({
      where: {
        teamPlayers: {
          some: { teamId }
        }
      },
      data: { isCaptain: false }
    });

    // Set the new captain
    await prisma.player.update({
      where: { id: playerId },
      data: { isCaptain: true }
    });

    // Update team's captainId
    await prisma.team.update({
      where: { id: teamId },
      data: { captainId: playerId }
    });

    return this.getTeamWithPlayers(teamId);
  }

  /**
   * Deletes a team and all its players
   */
  public static async deleteTeam(teamId: string): Promise<void> {
    // Get all players in the team
    const teamPlayers = await prisma.teamPlayer.findMany({
      where: { teamId },
      include: { player: true }
    });

    // Delete team players
    await prisma.teamPlayer.deleteMany({
      where: { teamId }
    });

    // Delete generated players (not real players from API)
    const generatedPlayerIds = teamPlayers
      .filter(tp => tp.player.isGenerated)
      .map(tp => tp.player.id);

    if (generatedPlayerIds.length > 0) {
      await prisma.player.deleteMany({
        where: { id: { in: generatedPlayerIds } }
      });
    }

    // Delete the team
    await prisma.team.delete({
      where: { id: teamId }
    });
  }

  /**
   * Converts database position to field position
   */
  private static getFieldPosition(position: PlayerPosition): string {
    switch (position) {
      case 'GOALKEEPER':
        return 'GK';
      case 'DEFENDER':
        return 'DEF';
      case 'MIDFIELDER':
        return 'MID';
      case 'ATTACKER':
        return 'FWD';
      default:
        return 'MID';
    }
  }

  /**
   * Calculates team overall rating with captain bonus
   * More realistic calculation that penalizes incomplete teams (less than 11 players)
   */
  public static calculateTeamRating(players: any[]): number {
    console.log("=== calculateTeamRating DEBUG START ===");
    console.log("calculateTeamRating - Players received:", players.length);
    console.log("calculateTeamRating - Players details:", players.map(p => ({ 
      name: p.name || 'Unknown', 
      isCaptain: p.isCaptain, 
      stats: { speed: p.speed, shooting: p.shooting, passing: p.passing, defending: p.defending, stamina: p.stamina, reflexes: p.reflexes }
    })));
    
    if (players.length === 0) {
      console.log("calculateTeamRating - No players, returning 0");
      console.log("=== calculateTeamRating DEBUG END ===");
      return 0;
    }

    const totalStats = players.reduce((sum, player) => {
      let playerStats = player.speed + player.shooting + player.passing + 
                       player.defending + player.stamina + player.reflexes;
      
      // Captain bonus: +5 to all stats for the captain
      if (player.isCaptain) {
        playerStats += 30; // 5 points per stat * 6 stats
        console.log("calculateTeamRating - Captain bonus applied to player:", player.name || 'Unknown');
      }
      
      console.log("calculateTeamRating - Player stats:", player.name || 'Unknown', "=", playerStats);
      return sum + playerStats;
    }, 0);

    const averageStats = totalStats / (players.length * 6); // 6 stats per player
    console.log("calculateTeamRating - Total stats:", totalStats);
    console.log("calculateTeamRating - Average stats:", averageStats);
    
    // Penalty for incomplete teams (less than 11 players)
    if (players.length < 11) {
      const penalty = (11 - players.length) * 3; // 3 points penalty per missing player
      const finalRating = Math.max(0, Math.round(averageStats - penalty));
      console.log("calculateTeamRating - Incomplete team penalty:", penalty, "points");
      console.log("calculateTeamRating - Final rating with penalty:", finalRating);
      console.log("=== calculateTeamRating DEBUG END ===");
      return finalRating;
    }
    
    // Minimum team strength requirement
    if (players.length < 5) {
      console.log("calculateTeamRating - Team has less than 5 players, returning 0");
      console.log("=== calculateTeamRating DEBUG END ===");
      return 0; // Teams with less than 5 players have 0 strength
    }
    
    const finalRating = Math.round(averageStats);
    console.log("calculateTeamRating - Final rating (complete team):", finalRating);
    console.log("=== calculateTeamRating DEBUG END ===");
    return finalRating;
  }

  /**
   * Gets team statistics
   */
  public static getTeamStats(players: any[]): {
    overallRating: number;
    totalValue: number;
    averageAge: number;
    positionCounts: Record<string, number>;
  } {
    const overallRating = this.calculateTeamRating(players);
    const totalValue = players.reduce((sum, player) => sum + player.marketValue, 0);
    const averageAge = players.length > 0 ? 
      Math.round(players.reduce((sum, player) => sum + player.age, 0) / players.length) : 0;

    const positionCounts = players.reduce((counts, player) => {
      const pos = this.getFieldPosition(player.position);
      counts[pos] = (counts[pos] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      overallRating,
      totalValue,
      averageAge,
      positionCounts
    };
  }
}
