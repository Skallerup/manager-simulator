import { Player, Team, MatchResult, MatchEvent, GameEngineConfig } from './types';

export class GameEngine {
  private config: GameEngineConfig;

  constructor(config: GameEngineConfig = {
    matchLength: 90,
    homeAdvantage: 0.1,
    weatherImpact: 0.05
  }) {
    this.config = config;
  }

  /**
   * Simulate a complete match between two teams
   */
  public simulateMatch(homeTeam: Team, awayTeam: Team): MatchResult {
    const events: MatchEvent[] = [];
    let homeScore = 0;
    let awayScore = 0;
    
    // Calculate team strengths
    const homeStrength = this.calculateTeamStrength(homeTeam) + this.config.homeAdvantage;
    const awayStrength = this.calculateTeamStrength(awayTeam);
    
    // Calculate possession based on team strength
    const totalStrength = homeStrength + awayStrength;
    const homePossession = (homeStrength / totalStrength) * 100;
    const awayPossession = 100 - homePossession;
    
    // Simulate match minute by minute
    for (let minute = 1; minute <= this.config.matchLength; minute++) {
      const minuteEvents = this.simulateMinute(homeTeam, awayTeam, homeStrength, awayStrength, minute);
      events.push(...minuteEvents);
      
      // Count goals
      minuteEvents.forEach(event => {
        if (event.type === 'goal') {
          if (event.team === 'home') homeScore++;
          else awayScore++;
        }
      });
    }
    
    // Calculate match statistics
    const homeShots = events.filter(e => e.team === 'home' && e.type === 'goal').length * 3; // Rough estimate
    const awayShots = events.filter(e => e.team === 'away' && e.type === 'goal').length * 3;
    
    return {
      homeScore,
      awayScore,
      events: events.sort((a, b) => a.minute - b.minute),
      possession: {
        home: Math.round(homePossession),
        away: Math.round(awayPossession)
      },
      shots: {
        home: homeShots,
        away: awayShots
      },
      shotsOnTarget: {
        home: Math.round(homeShots * 0.4),
        away: Math.round(awayShots * 0.4)
      }
    };
  }

  /**
   * Calculate overall team strength based on players
   * Uses the same logic as TeamService.calculateTeamRating
   */
  private calculateTeamStrength(team: Team): number {
    const starters = team.players.filter(p => p.isStarter);
    if (starters.length === 0) return 50; // Default if no starters
    
    const totalStats = starters.reduce((sum, player) => {
      let playerStats = player.speed + player.shooting + player.passing + 
                       player.defending + player.stamina + player.reflexes;
      
      // Captain bonus: +5 to all stats for the captain
      if (player.isCaptain) {
        playerStats += 30; // 5 points per stat * 6 stats
      }
      
      return sum + playerStats;
    }, 0);

    const averageStats = totalStats / (starters.length * 6); // 6 stats per player
    
    // Penalty for incomplete teams (less than 11 players)
    if (starters.length < 11) {
      const penalty = (11 - starters.length) * 15; // 15 points penalty per missing player
      return Math.max(0, Math.round(averageStats - penalty));
    }
    
    return Math.round(averageStats);
  }

  /**
   * Simulate events for a single minute
   */
  private simulateMinute(
    homeTeam: Team, 
    awayTeam: Team, 
    homeStrength: number, 
    awayStrength: number, 
    minute: number
  ): MatchEvent[] {
    const events: MatchEvent[] = [];
    
    // Determine which team has the ball (based on possession)
    const homePossession = homeStrength / (homeStrength + awayStrength);
    const ballWithHome = Math.random() < homePossession;
    
    const attackingTeam = ballWithHome ? homeTeam : awayTeam;
    const defendingTeam = ballWithHome ? awayTeam : homeTeam;
    const teamSide = ballWithHome ? 'home' : 'away';
    
    // Chance of an event happening this minute
    const eventChance = Math.random();
    
    if (eventChance < 0.15) { // 15% chance of goal attempt
      const goalEvent = this.simulateGoal(attackingTeam, teamSide, minute, homeStrength, awayStrength);
      if (goalEvent) events.push(goalEvent);
    } else if (eventChance < 0.25) { // 10% chance of shot
      const shotEvent = this.simulateShot(attackingTeam, teamSide, minute);
      if (shotEvent) events.push(shotEvent);
    } else if (eventChance < 0.28) { // 3% chance of card
      const cardEvent = this.simulateCard(attackingTeam, teamSide, minute);
      if (cardEvent) events.push(cardEvent);
    } else if (eventChance < 0.30) { // 2% chance of substitution
      const subEvent = this.simulateSubstitution(attackingTeam, teamSide, minute);
      if (subEvent) events.push(subEvent);
    }
    
    return events;
  }

  /**
   * Simulate a goal attempt
   */
  private simulateGoal(team: Team, teamSide: 'home' | 'away', minute: number, homeStrength: number, awayStrength: number): MatchEvent | null {
    const attackers = team.players.filter(p => p.isStarter && p.position === 'ATTACKER');
    if (attackers.length === 0) return null;
    
    const attacker = attackers[Math.floor(Math.random() * attackers.length)];
    
    // Calculate goal chance based on team strength difference
    const attackingStrength = teamSide === 'home' ? homeStrength : awayStrength;
    const defendingStrength = teamSide === 'home' ? awayStrength : homeStrength;
    
    // Base goal chance from player stats
    const playerGoalChance = (attacker.shooting + attacker.overall) / 200;
    
    // Modify by team strength difference
    const strengthDifference = (attackingStrength - defendingStrength) / 100;
    const goalChance = Math.max(0.05, Math.min(0.8, playerGoalChance + strengthDifference * 0.3));
    
    if (Math.random() < goalChance) {
      return {
        minute,
        type: 'goal',
        team: teamSide,
        player: attacker.name,
        description: `Goal! ${attacker.name} scores!`
      };
    }
    
    return null;
  }

  /**
   * Simulate a shot attempt
   */
  private simulateShot(team: Team, teamSide: 'home' | 'away', minute: number): MatchEvent | null {
    const attackers = team.players.filter(p => p.isStarter && (p.position === 'ATTACKER' || p.position === 'MIDFIELDER'));
    if (attackers.length === 0) return null;
    
    const attacker = attackers[Math.floor(Math.random() * attackers.length)];
    
    return {
      minute,
      type: 'shot',
      team: teamSide,
      player: attacker.name,
      description: `${attacker.name} shoots!`
    };
  }

  /**
   * Simulate a card event
   */
  private simulateCard(team: Team, teamSide: 'home' | 'away', minute: number): MatchEvent | null {
    const players = team.players.filter(p => p.isStarter);
    if (players.length === 0) return null;
    
    const player = players[Math.floor(Math.random() * players.length)];
    const cardChance = 0.02; // 2% chance of card
    
    if (Math.random() < cardChance) {
      const isRed = Math.random() < 0.1; // 10% chance of red card
      return {
        minute,
        type: isRed ? 'red_card' : 'yellow_card',
        team: teamSide,
        player: player.name,
        description: `${isRed ? 'Red' : 'Yellow'} card for ${player.name}`
      };
    }
    
    return null;
  }

  /**
   * Simulate a substitution
   */
  private simulateSubstitution(team: Team, teamSide: 'home' | 'away', minute: number): MatchEvent | null {
    const starters = team.players.filter(p => p.isStarter);
    const substitutes = team.players.filter(p => !p.isStarter);
    
    if (starters.length === 0 || substitutes.length === 0) return null;
    
    const subChance = 0.01; // 1% chance of substitution per minute
    
    if (Math.random() < subChance) {
      const playerOut = starters[Math.floor(Math.random() * starters.length)];
      const playerIn = substitutes[Math.floor(Math.random() * substitutes.length)];
      
      return {
        minute,
        type: 'substitution',
        team: teamSide,
        player: `${playerOut.name} off, ${playerIn.name} on`,
        description: `Substitution: ${playerOut.name} replaced by ${playerIn.name}`
      };
    }
    
    return null;
  }

  /**
   * Generate random player stats for testing
   */
  public generateRandomPlayer(name: string, position: string): Player {
    const baseStats = {
      GOALKEEPER: { overall: 70, pace: 50, shooting: 20, passing: 60, defending: 80, physical: 70 },
      DEFENDER: { overall: 75, pace: 60, shooting: 30, passing: 70, defending: 85, physical: 80 },
      MIDFIELDER: { overall: 80, pace: 70, shooting: 60, passing: 85, defending: 70, physical: 75 },
      ATTACKER: { overall: 85, pace: 85, shooting: 90, passing: 70, defending: 40, physical: 80 }
    };
    
    const base = baseStats[position as keyof typeof baseStats] || baseStats.MIDFIELDER;
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      position,
      age: Math.floor(Math.random() * 10) + 20, // 20-30 years old
      overall: base.overall + Math.floor(Math.random() * 20) - 10, // ±10 from base
      pace: base.pace + Math.floor(Math.random() * 20) - 10,
      shooting: base.shooting + Math.floor(Math.random() * 20) - 10,
      passing: base.passing + Math.floor(Math.random() * 20) - 10,
      defending: base.defending + Math.floor(Math.random() * 20) - 10,
      physical: base.physical + Math.floor(Math.random() * 20) - 10,
      isStarter: false
    };
  }
}
