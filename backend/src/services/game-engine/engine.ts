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
  public simulateMatch(homeTeam: Team, awayTeam: Team, options?: { homeAdvantage?: number }): MatchResult {
    const events: MatchEvent[] = [];
    const highlights: MatchHighlight[] = [];
    let homeScore = 0;
    let awayScore = 0;
    
    // Calculate team strengths with dynamic home advantage
    const homeAdvantage = options?.homeAdvantage ?? this.config.homeAdvantage;
    const homeStrength = this.calculateTeamStrength(homeTeam) + homeAdvantage;
    const awayStrength = this.calculateTeamStrength(awayTeam);
    
    // Calculate possession based on team strength
    const totalStrength = homeStrength + awayStrength;
    const homePossession = (homeStrength / totalStrength) * 100;
    const awayPossession = 100 - homePossession;
    
    // Simulate match minute by minute
    for (let minute = 1; minute <= this.config.matchLength; minute++) {
      // For very strong teams, simulate multiple events per minute
      const strengthDifference = Math.abs(homeStrength - awayStrength);
      const eventsPerMinute = strengthDifference > 30 ? 3 : (strengthDifference > 15 ? 2 : 1); // Up to 3 events per minute for very strong teams
      
      for (let i = 0; i < eventsPerMinute; i++) {
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
   * More realistic calculation that considers position-specific skills
   */
  private calculateTeamStrength(team: Team): number {
    const starters = team.players.filter(p => p.isStarter);
    if (starters.length === 0) return 20; // Very low if no starters
    
    let totalStrength = 0;
    
    starters.forEach(player => {
      let playerStrength = 0;
      
      // Position-specific skill weighting
      switch (player.position) {
        case 'GOALKEEPER':
          playerStrength = (player.reflexes * 0.4) + (player.overall * 0.3) + 
                          (player.defending * 0.2) + (player.speed * 0.1);
          break;
        case 'DEFENDER':
          playerStrength = (player.defending * 0.4) + (player.overall * 0.25) + 
                          (player.speed * 0.15) + (player.passing * 0.1) + 
                          (player.stamina * 0.1);
          break;
        case 'MIDFIELDER':
          playerStrength = (player.passing * 0.3) + (player.overall * 0.25) + 
                          (player.stamina * 0.2) + (player.speed * 0.15) + 
                          (player.defending * 0.1);
          break;
        case 'ATTACKER':
          playerStrength = (player.shooting * 0.4) + (player.speed * 0.25) + 
                          (player.overall * 0.2) + (player.passing * 0.15);
          break;
        default:
          playerStrength = (player.speed + player.shooting + player.passing + 
                           player.defending + player.stamina + player.reflexes) / 6;
      }
      
      // Captain bonus: +10% to all stats
      if (player.isCaptain) {
        playerStrength *= 1.1;
      }
      
      totalStrength += playerStrength;
    });

    const averageStrength = totalStrength / starters.length;
    
    // Penalty for incomplete teams (less than 11 players)
    if (starters.length < 11) {
      const penalty = (11 - starters.length) * 8; // 8 points penalty per missing player
      return Math.max(0, Math.round(averageStrength - penalty));
    }
    
    // Minimum team strength requirement
    if (starters.length < 5) {
      return 0; // Teams with less than 5 players have 0 strength
    }
    
    return Math.round(averageStrength);
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
    
    // Calculate possession more realistically - BALANCED
    const strengthDifference = homeStrength - awayStrength;
    const homePossession = 0.5 + (strengthDifference / 150); // More balanced possession changes
    const ballWithHome = Math.random() < Math.max(0.2, Math.min(0.8, homePossession)); // More balanced
    
    const attackingTeam = ballWithHome ? homeTeam : awayTeam;
    const defendingTeam = ballWithHome ? awayTeam : homeTeam;
    const teamSide = ballWithHome ? 'home' : 'away';
    const defendingSide = ballWithHome ? 'away' : 'home';
    
    // Calculate attacking team's offensive strength
    const attackingStrength = teamSide === 'home' ? homeStrength : awayStrength;
    const defendingStrength = teamSide === 'home' ? awayStrength : homeStrength;
    
    // Base event chance increases with team strength difference - BALANCED
    const strengthRatio = attackingStrength / Math.max(defendingStrength, 1);
    const baseEventChance = Math.min(0.6, 0.2 + (strengthRatio - 1) * 0.15); // More balanced event chance
    
    // Check if attacking team has any attackers
    const hasAttackers = attackingTeam.players.some(p => p.isStarter && p.position === 'ATTACKER');
    
    // Calculate goal chance based on team strength difference
    const goalChance = this.calculateGoalChance(attackingTeam, defendingTeam, attackingStrength, defendingStrength);
    const shotChance = this.calculateShotChance(attackingTeam, defendingTeam, attackingStrength, defendingStrength);
    
    const eventChance = Math.random();
    
    
    if (eventChance < goalChance) { // Dynamic goal chance based on strength
      if (hasAttackers) {
        const goalEvent = this.simulateGoal(attackingTeam, teamSide, minute, homeStrength, awayStrength);
        if (goalEvent) events.push(goalEvent);
      } else {
        // If no attackers, simulate a save instead
        const saveEvent = this.simulateSave(defendingTeam, defendingSide, minute);
        if (saveEvent) events.push(saveEvent);
      }
    } else if (eventChance < goalChance + shotChance) { // Dynamic shot chance
      if (hasAttackers) {
        const shotEvent = this.simulateShot(attackingTeam, teamSide, minute);
        if (shotEvent) events.push(shotEvent);
      } else {
        // If no attackers, simulate a save instead
        const saveEvent = this.simulateSave(defendingTeam, defendingSide, minute);
        if (saveEvent) events.push(saveEvent);
      }
    } else if (eventChance < baseEventChance + 0.02) { // 2% chance of card
      const cardEvent = this.simulateCard(attackingTeam, teamSide, minute);
      if (cardEvent) events.push(cardEvent);
    } else if (eventChance < baseEventChance + 0.03) { // 1% chance of substitution
      const subEvent = this.simulateSubstitution(attackingTeam, teamSide, minute);
      if (subEvent) events.push(subEvent);
    }
    
    return events;
  }

  /**
   * Calculate goal chance based on team strength and individual player skills
   */
  private calculateGoalChance(attackingTeam: Team, defendingTeam: Team, attackingStrength: number, defendingStrength: number): number {
    // Get attacking team's best attackers
    const attackers = attackingTeam.players.filter(p => p.isStarter && p.position === 'ATTACKER');
    if (attackers.length === 0) return 0.01; // Very low chance if no attackers
    
    // Get defending team's goalkeeper
    const goalkeepers = defendingTeam.players.filter(p => p.isStarter && p.position === 'GOALKEEPER');
    const goalkeeper = goalkeepers[0];
    
    // Calculate average attacking skill
    const avgAttackingSkill = attackers.reduce((sum, p) => sum + (p.shooting + p.speed + p.overall) / 3, 0) / attackers.length;
    
    // Calculate goalkeeper skill
    const goalkeeperSkill = goalkeeper ? (goalkeeper.reflexes + goalkeeper.overall) / 2 : 50;
    
    // Base goal chance from skill difference
    const skillDifference = (avgAttackingSkill - goalkeeperSkill) / 100;
    
    // Team strength difference impact - BALANCED
    const strengthDifference = (attackingStrength - defendingStrength) / 50; // More balanced
    
    // Calculate final goal chance - BALANCED
    const baseChance = 0.08 + skillDifference * 0.2 + strengthDifference * 0.3; // More balanced
    
    // Cap the chance between 2% and 40% - More realistic
    const finalChance = Math.max(0.02, Math.min(0.40, baseChance));
    
    return finalChance;
  }

  /**
   * Calculate shot chance based on team strength and individual player skills
   */
  private calculateShotChance(attackingTeam: Team, defendingTeam: Team, attackingStrength: number, defendingStrength: number): number {
    // Get attacking team's offensive players
    const offensivePlayers = attackingTeam.players.filter(p => p.isStarter && 
      (p.position === 'ATTACKER' || p.position === 'MIDFIELDER'));
    
    if (offensivePlayers.length === 0) return 0.01;
    
    // Calculate average offensive skill
    const avgOffensiveSkill = offensivePlayers.reduce((sum, p) => 
      sum + (p.shooting + p.speed + p.passing + p.overall) / 4, 0) / offensivePlayers.length;
    
    // Team strength difference impact - BALANCED
    const strengthDifference = (attackingStrength - defendingStrength) / 60; // More balanced
    
    // Calculate shot chance - BALANCED
    const baseChance = 0.15 + (avgOffensiveSkill - 50) / 100 + strengthDifference * 0.25; // More balanced
    
    // Cap the chance between 5% and 50% - More realistic
    return Math.max(0.05, Math.min(0.50, baseChance));
  }

  /**
   * Simulate a goal attempt
   */
  private simulateGoal(team: Team, teamSide: 'home' | 'away', minute: number, homeStrength: number, awayStrength: number): MatchEvent | null {
    const attackers = team.players.filter(p => p.isStarter && p.position === 'ATTACKER');
    if (attackers.length === 0) return null;
    
    // Choose the best attacker (highest shooting + overall)
    const attacker = attackers.reduce((best, current) => {
      const bestScore = best.shooting + best.overall;
      const currentScore = current.shooting + current.overall;
      return currentScore > bestScore ? current : best;
    });
    
    // Calculate goal chance based on team strength difference
    const attackingStrength = teamSide === 'home' ? homeStrength : awayStrength;
    const defendingStrength = teamSide === 'home' ? awayStrength : homeStrength;
    
    // Individual player skill impact (much higher)
    const playerSkill = (attacker.shooting + attacker.speed + attacker.overall) / 3;
    const playerGoalChance = playerSkill / 100; // MUCH higher than before (was 200)
    
    // Team strength difference impact (MUCH more dramatic)
    const strengthDifference = (attackingStrength - defendingStrength) / 20; // MUCH more dramatic impact (was 50)
    const strengthBonus = Math.max(0, strengthDifference * 0.6); // Up to 60% bonus for strong teams (was 30%)
    
    // Position-specific bonuses
    const positionBonus = attacker.position === 'ATTACKER' ? 0.2 : 0.1; // Higher bonuses
    
    // Captain bonus
    const captainBonus = attacker.isCaptain ? 0.1 : 0; // Higher captain bonus
    
    // Calculate final goal chance - MUCH higher
    const goalChance = Math.max(0.02, Math.min(0.9, 
      playerGoalChance + strengthBonus + positionBonus + captainBonus
    ));
    
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
    const offensivePlayers = team.players.filter(p => p.isStarter && 
      (p.position === 'ATTACKER' || p.position === 'MIDFIELDER'));
    if (offensivePlayers.length === 0) return null;
    
    // Choose player based on their offensive skills
    const attacker = offensivePlayers.reduce((best, current) => {
      const bestScore = best.shooting + best.speed + best.passing;
      const currentScore = current.shooting + current.speed + current.passing;
      return currentScore > bestScore ? current : best;
    });
    
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
    
    // Choose the best goalkeeper (highest reflexes + overall)
    const goalkeeper = goalkeepers.reduce((best, current) => {
      const bestScore = best.reflexes + best.overall;
      const currentScore = current.reflexes + current.overall;
      return currentScore > bestScore ? current : best;
    });
    
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
