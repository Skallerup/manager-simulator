export interface CreateTrainingMatchRequest {
  opponentTeamId: string;
}

export interface TrainingMatchResponse {
  id: string;
  userTeam: {
    id: string;
    name: string;
  };
  opponentTeam: {
    id: string;
    name: string;
  };
  userScore: number;
  opponentScore: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  events: string | null;
  highlights: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SimulateTrainingMatchRequest {
  // No additional fields needed for simulation
}

export interface SimulateTrainingMatchResponse {
  matchId: string;
  userScore: number;
  opponentScore: number;
  events: any[];
  highlights: any[];
  stats: {
    userPossession: number;
    opponentPossession: number;
    userShots: number;
    opponentShots: number;
    userShotsOnTarget: number;
    opponentShotsOnTarget: number;
  };
}

export interface LeagueTeam {
  id: string;
  name: string;
  overallRating: number;
  formation: string;
  isBot: boolean;
  owner?: {
    id: string;
    name: string;
  };
}


