export interface Player {
  id: string;
  name: string;
  position: string;
  age?: number;
  overall: number; // Overall rating (1-100)
  pace: number;
  shooting: number;
  passing: number;
  defending: number;
  physical: number;
  isStarter: boolean;
}

export interface Team {
  id: string;
  name: string;
  formation: string;
  players: Player[];
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  possession: {
    home: number;
    away: number;
  };
  shots: {
    home: number;
    away: number;
  };
  shotsOnTarget: {
    home: number;
    away: number;
  };
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'shot' | 'save' | 'yellow_card' | 'red_card' | 'substitution' | 'penalty';
  team: 'home' | 'away';
  player: string;
  description: string;
}

export interface GameEngineConfig {
  matchLength: number; // in minutes
  homeAdvantage: number; // bonus for home team (0-1)
  weatherImpact: number; // weather impact factor (0-1)
}
