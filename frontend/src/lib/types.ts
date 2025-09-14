export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface League {
  id: string;
  name: string;
  description?: string;
  maxTeams: number;
  draftMethod: "SNAKE" | "LINEAR";
  signupDeadline: string;
  draftStartTime?: string;
  status: "SIGNUP" | "DRAFT_READY" | "DRAFT_IN_PROGRESS" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  admin: User;
  adminId: string;
  leagueMembers: LeagueMember[];
  teams: Team[];
  _count: {
    teams: number;
    leagueMembers: number;
  };
}

export interface LeagueMember {
  id: string;
  role: "ADMIN" | "MEMBER";
  joinedAt: string;
  user: User;
  userId: string;
  leagueId: string;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  owner: User;
  ownerId: string;
  league: {
    id: string;
    name: string;
  };
  leagueId: string;
  draftPosition?: number;
  players?: Player[];
  _count?: {
    players: number;
  };
}

export interface Player {
  id: string;
  name: string;
  position: string;
  club: string;
  createdAt: string;
  updatedAt: string;
  team?: Team;
  teamId?: string;
}

export interface CreateLeagueData {
  name: string;
  description?: string;
  maxTeams: number;
}

export interface UpdateLeagueData {
  name?: string;
  description?: string;
  maxTeams?: number;
}

export interface CreateTeamData {
  name: string;
  leagueId: string;
  logo?: string;
}

export interface UpdateTeamData {
  name?: string;
  logo?: string;
}
