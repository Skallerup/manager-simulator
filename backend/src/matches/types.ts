export interface CreateMatchRequest {
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  matchDate: string; // ISO string
}

export interface MatchResponse {
  id: string;
  homeTeam: {
    id: string;
    name: string;
  };
  awayTeam: {
    id: string;
    name: string;
  };
  homeScore: number;
  awayScore: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  matchDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SimulateMatchRequest {
  matchId: string;
}

export interface SimulateMatchResponse {
  matchId: string;
  homeScore: number;
  awayScore: number;
  events: Array<{
    minute: number;
    type: string;
    team: string;
    player: string;
    description: string;
  }>;
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
