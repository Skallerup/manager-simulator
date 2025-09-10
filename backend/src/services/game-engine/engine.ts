import { Player, Team, MatchResult, MatchEvent, MatchHighlight, GameEngineConfig } from './types';

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
    const highlights: MatchHighlight[] = [];
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
      
      // Generate highlights for important events
      const minuteHighlights = this.generateHighlights(minuteEvents, minute);
      highlights.push(...minuteHighlights);
      
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
      highlights: highlights.sort((a, b) => a.minute - b.minute),
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
    
    // Penalty for incomplete teams (less than 16 players)
    if (starters.length < 16) {
      const penalty = (16 - starters.length) * 5; // 5 points penalty per missing player (reduced from 15)
      return Math.max(0, Math.round(averageStats - penalty));
    }
    
    // Minimum team strength requirement
    if (starters.length < 5) {
      return 0; // Teams with less than 5 players have 0 strength
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
    const defendingSide = ballWithHome ? 'away' : 'home';
    
    // Chance of an event happening this minute
    const eventChance = Math.random();
    
    // Check if attacking team has any attackers
    const hasAttackers = attackingTeam.players.some(p => p.isStarter && p.position === 'ATTACKER');
    
    if (eventChance < 0.05) { // 5% chance of goal attempt (reduced from 15%)
      if (hasAttackers) {
        const goalEvent = this.simulateGoal(attackingTeam, teamSide, minute, homeStrength, awayStrength);
        if (goalEvent) events.push(goalEvent);
      } else {
        // If no attackers, simulate a save instead
        const saveEvent = this.simulateSave(defendingTeam, defendingSide, minute);
        if (saveEvent) events.push(saveEvent);
      }
    } else if (eventChance < 0.10) { // 5% chance of shot (reduced from 10%)
      if (hasAttackers) {
        const shotEvent = this.simulateShot(attackingTeam, teamSide, minute);
        if (shotEvent) events.push(shotEvent);
      } else {
        // If no attackers, simulate a save instead
        const saveEvent = this.simulateSave(defendingTeam, defendingSide, minute);
        if (saveEvent) events.push(saveEvent);
      }
    } else if (eventChance < 0.12) { // 2% chance of card (reduced from 3%)
      const cardEvent = this.simulateCard(attackingTeam, teamSide, minute);
      if (cardEvent) events.push(cardEvent);
    } else if (eventChance < 0.13) { // 1% chance of substitution (reduced from 2%)
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
    
    // Base goal chance from player stats (much lower)
    const playerGoalChance = (attacker.shooting + attacker.overall) / 400; // Reduced from 200 to 400
    
    // Modify by team strength difference
    const strengthDifference = (attackingStrength - defendingStrength) / 100;
    const goalChance = Math.max(0.01, Math.min(0.3, playerGoalChance + strengthDifference * 0.1)); // Much lower max chance
    
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
   * Simulate a save attempt
   */
  private simulateSave(team: Team, teamSide: 'home' | 'away', minute: number): MatchEvent | null {
    const goalkeepers = team.players.filter(p => p.isStarter && p.position === 'GOALKEEPER');
    if (goalkeepers.length === 0) return null;
    
    const goalkeeper = goalkeepers[Math.floor(Math.random() * goalkeepers.length)];
    
    return {
      minute,
      type: 'save',
      team: teamSide,
      player: goalkeeper.name,
      description: `${goalkeeper.name} saved!`
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
   * Generate highlights from match events
   */
  private generateHighlights(events: MatchEvent[], minute: number): MatchHighlight[] {
    const highlights: MatchHighlight[] = [];
    
    events.forEach(event => {
      if (this.isHighlightWorthy(event)) {
        highlights.push(this.createHighlight(event, minute));
      }
    });
    
    return highlights;
  }

  /**
   * Check if an event is worth highlighting
   */
  private isHighlightWorthy(event: MatchEvent): boolean {
    return ['goal', 'save', 'red_card', 'penalty'].includes(event.type);
  }

  /**
   * Create a highlight from a match event
   */
  private createHighlight(event: MatchEvent, minute: number): MatchHighlight {
    const highlightId = Math.random().toString(36).substr(2, 9);
    
    return {
      id: highlightId,
      eventType: event.type,
      minute,
      player: event.player,
      description: event.description,
      videoUrl: this.generateVideoUrl(event.type, event.team),
      thumbnailUrl: this.generateThumbnailUrl(event.type, event.team),
      duration: this.getHighlightDuration(event.type),
      isProOnly: true
    };
  }

  /**
   * Generate simulated video URL for highlights
   */
  private generateVideoUrl(eventType: string, team: 'home' | 'away'): string {
    // Return a placeholder since we're using JavaScript animation now
    return `data:application/json;base64,${Buffer.from(JSON.stringify({
      eventType,
      team,
      animated: true
    })).toString('base64')}`;
  }

  /**
   * Generate simulated thumbnail URL for highlights
   */
  private generateThumbnailUrl(eventType: string, team: 'home' | 'away'): string {
    // Use football-related placeholder images
    const baseUrl = 'https://images.unsplash.com';
    
    switch (eventType) {
      case 'goal':
        return `${baseUrl}/photo-1431324155629-1a6deb1dec8d?w=64&h=48&fit=crop&crop=center`;
      case 'save':
        return `${baseUrl}/photo-1574629810360-7efbbe195018?w=64&h=48&fit=crop&crop=center`;
      case 'red_card':
        return `${baseUrl}/photo-1571019613454-1cb2f99b2d8b?w=64&h=48&fit=crop&crop=center`;
      case 'penalty':
        return `${baseUrl}/photo-1574629810360-7efbbe195018?w=64&h=48&fit=crop&crop=center`;
      default:
        return `${baseUrl}/photo-1431324155629-1a6deb1dec8d?w=64&h=48&fit=crop&crop=center`;
    }
  }

  /**
   * Get highlight duration based on event type
   */
  private getHighlightDuration(eventType: string): number {
    switch (eventType) {
      case 'goal':
        return 15; // 15 seconds for goals
      case 'save':
        return 8;  // 8 seconds for saves
      case 'red_card':
        return 12; // 12 seconds for red cards
      case 'penalty':
        return 20; // 20 seconds for penalties
      default:
        return 10; // 10 seconds default
    }
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
