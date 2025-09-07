import { PlayerPosition } from '@prisma/client';

export interface GeneratedPlayer {
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
}

// Danish and international names for player generation
const DANISH_FIRST_NAMES = [
  'Lars', 'Jens', 'Michael', 'Anders', 'Morten', 'Thomas', 'Henrik', 'Christian', 'Martin', 'Peter',
  'Søren', 'Niels', 'Kim', 'Ole', 'Jan', 'Erik', 'Per', 'Hans', 'Kjeld', 'Bent',
  'Anne', 'Mette', 'Lise', 'Hanne', 'Kirsten', 'Bente', 'Lone', 'Susanne', 'Pia', 'Dorte',
  'Camilla', 'Louise', 'Maria', 'Anna', 'Julie', 'Sara', 'Emma', 'Ida', 'Sofia', 'Freja'
];

const DANISH_LAST_NAMES = [
  'Nielsen', 'Jensen', 'Hansen', 'Andersen', 'Larsen', 'Christensen', 'Petersen', 'Madsen', 'Rasmussen', 'Olsen',
  'Pedersen', 'Jørgensen', 'Knudsen', 'Møller', 'Thomsen', 'Christiansen', 'Svendsen', 'Poulsen', 'Johansen', 'Mikkelsen',
  'Lund', 'Jakobsen', 'Henriksen', 'Sørensen', 'Kristensen', 'Morten', 'Eriksen', 'Holm', 'Clausen', 'Vestergaard'
];

const INTERNATIONAL_FIRST_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Charles', 'Joseph', 'Thomas',
  'Christopher', 'Daniel', 'Paul', 'Mark', 'Donald', 'Steven', 'Andrew', 'Joshua', 'Kenneth', 'Kevin',
  'Sarah', 'Jessica', 'Amanda', 'Ashley', 'Emily', 'Samantha', 'Elizabeth', 'Megan', 'Hannah', 'Lauren',
  'Maria', 'Anna', 'Sofia', 'Emma', 'Isabella', 'Olivia', 'Charlotte', 'Amelia', 'Sophia', 'Mia'
];

const INTERNATIONAL_LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

// Team color combinations
export const TEAM_COLORS = [
  { primary: '#FF0000', secondary: '#FFFFFF', name: 'Red & White' },
  { primary: '#0000FF', secondary: '#FFFFFF', name: 'Blue & White' },
  { primary: '#00FF00', secondary: '#000000', name: 'Green & Black' },
  { primary: '#FFFF00', secondary: '#000000', name: 'Yellow & Black' },
  { primary: '#FF8000', secondary: '#FFFFFF', name: 'Orange & White' },
  { primary: '#8000FF', secondary: '#FFFFFF', name: 'Purple & White' },
  { primary: '#000000', secondary: '#FFFFFF', name: 'Black & White' },
  { primary: '#808080', secondary: '#FFFFFF', name: 'Gray & White' }
];

// Team logos (simple geometric designs)
export const TEAM_LOGOS = [
  'circle', 'square', 'triangle', 'diamond', 'star', 'hexagon',
  'shield', 'crown', 'flame', 'lightning', 'wave', 'mountain'
];

// Position-specific stat requirements
const POSITION_STATS = {
  GOALKEEPER: {
    reflexes: { min: 70, max: 95 },
    defending: { min: 60, max: 85 },
    speed: { min: 30, max: 60 },
    shooting: { min: 20, max: 50 },
    passing: { min: 40, max: 70 },
    stamina: { min: 50, max: 80 }
  },
  DEFENDER: {
    defending: { min: 70, max: 90 },
    stamina: { min: 60, max: 85 },
    speed: { min: 50, max: 80 },
    passing: { min: 50, max: 75 },
    shooting: { min: 30, max: 60 },
    reflexes: { min: 40, max: 70 }
  },
  MIDFIELDER: {
    passing: { min: 70, max: 90 },
    stamina: { min: 70, max: 90 },
    speed: { min: 60, max: 85 },
    defending: { min: 50, max: 75 },
    shooting: { min: 50, max: 80 },
    reflexes: { min: 40, max: 70 }
  },
  ATTACKER: {
    shooting: { min: 70, max: 95 },
    speed: { min: 70, max: 90 },
    passing: { min: 50, max: 80 },
    stamina: { min: 60, max: 85 },
    defending: { min: 30, max: 60 },
    reflexes: { min: 50, max: 80 }
  }
};

// Quality levels for team generation
const QUALITY_LEVELS = {
  ELITE: { count: 2, statBonus: 15, valueMultiplier: 3 },
  PROFESSIONAL: { count: 4, statBonus: 5, valueMultiplier: 1.5 },
  ROOKIE: { count: 5, statBonus: 0, valueMultiplier: 1 }
};

export class PlayerGenerator {
  private static getRandomName(): string {
    const useDanish = Math.random() < 0.6; // 60% Danish names
    const firstNames = useDanish ? DANISH_FIRST_NAMES : INTERNATIONAL_FIRST_NAMES;
    const lastNames = useDanish ? DANISH_LAST_NAMES : INTERNATIONAL_LAST_NAMES;
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }

  private static getRandomAge(): number {
    return Math.floor(Math.random() * 8) + 18; // 18-25 years old
  }

  private static generateStats(position: PlayerPosition, qualityLevel: keyof typeof QUALITY_LEVELS): {
    speed: number;
    shooting: number;
    passing: number;
    defending: number;
    stamina: number;
    reflexes: number;
  } {
    const positionStats = POSITION_STATS[position];
    const quality = QUALITY_LEVELS[qualityLevel];
    
    const generateStat = (baseRange: { min: number; max: number }) => {
      const baseValue = Math.floor(Math.random() * (baseRange.max - baseRange.min + 1)) + baseRange.min;
      return Math.min(100, baseValue + quality.statBonus);
    };

    return {
      speed: generateStat(positionStats.speed),
      shooting: generateStat(positionStats.shooting),
      passing: generateStat(positionStats.passing),
      defending: generateStat(positionStats.defending),
      stamina: generateStat(positionStats.stamina),
      reflexes: generateStat(positionStats.reflexes)
    };
  }

  private static calculateMarketValue(stats: any, age: number, qualityLevel: keyof typeof QUALITY_LEVELS = 'ROOKIE'): number {
    const totalStats = stats.speed + stats.shooting + stats.passing + stats.defending + stats.stamina + stats.reflexes;
    const averageStats = totalStats / 6;
    
    // Base value based on average stats
    let baseValue = Math.floor(averageStats * 10000); // 10,000 øre per stat point
    
    // Apply quality multiplier
    const quality = QUALITY_LEVELS[qualityLevel];
    baseValue = Math.floor(baseValue * quality.valueMultiplier);
    
    // Age factor (peak at 26-28)
    if (age >= 26 && age <= 28) {
      baseValue = Math.floor(baseValue * 1.2);
    } else if (age < 22) {
      baseValue = Math.floor(baseValue * 0.8); // Young players have potential
    } else if (age > 30) {
      baseValue = Math.floor(baseValue * 0.7); // Older players declining
    }
    
    return Math.max(100000, baseValue); // Minimum 1,000 kr
  }

  public static generateTeam(): GeneratedPlayer[] {
    const players: GeneratedPlayer[] = [];
    const positions: PlayerPosition[] = [
      'GOALKEEPER',
      'DEFENDER', 'DEFENDER', 'DEFENDER', 'DEFENDER',
      'MIDFIELDER', 'MIDFIELDER', 'MIDFIELDER',
      'ATTACKER', 'ATTACKER', 'ATTACKER'
    ];

    // Generate players by quality level
    let playerIndex = 0;
    
    // Elite players (2)
    for (let i = 0; i < QUALITY_LEVELS.ELITE.count; i++) {
      const position = positions[playerIndex] as PlayerPosition;
      const stats = this.generateStats(position, 'ELITE');
      const age = this.getRandomAge();
      
      players.push({
        name: this.getRandomName(),
        age,
        position,
        ...stats,
        marketValue: this.calculateMarketValue(stats, age, 'ELITE'),
        isCaptain: i === 0 // First elite player is captain
      });
      playerIndex++;
    }

    // Professional players (4)
    for (let i = 0; i < QUALITY_LEVELS.PROFESSIONAL.count; i++) {
      const position = positions[playerIndex] as PlayerPosition;
      const stats = this.generateStats(position, 'PROFESSIONAL');
      const age = this.getRandomAge();
      
      players.push({
        name: this.getRandomName(),
        age,
        position,
        ...stats,
        marketValue: this.calculateMarketValue(stats, age, 'PROFESSIONAL'),
        isCaptain: false
      });
      playerIndex++;
    }

    // Rookie players (5)
    for (let i = 0; i < QUALITY_LEVELS.ROOKIE.count; i++) {
      const position = positions[playerIndex] as PlayerPosition;
      const stats = this.generateStats(position, 'ROOKIE');
      const age = this.getRandomAge();
      
      players.push({
        name: this.getRandomName(),
        age,
        position,
        ...stats,
        marketValue: this.calculateMarketValue(stats, age, 'ROOKIE'),
        isCaptain: false
      });
      playerIndex++;
    }

    return players;
  }

  public static getRandomTeamColors() {
    return TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)];
  }

  public static getRandomTeamLogo() {
    return TEAM_LOGOS[Math.floor(Math.random() * TEAM_LOGOS.length)];
  }
}
