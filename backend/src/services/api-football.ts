import { config } from "../config";

export interface ApiFootballPlayer {
  player_id: number;
  player_name: string;
  player_age: number;
  player_number: number | null;
  player_type: string;
  player_image: string;
}

export interface ApiFootballTeam {
  team_id: number;
  team_name: string;
  team_logo: string;
}

export interface ApiFootballSquadResponse {
  api: {
    results: number;
    players: ApiFootballPlayer[];
  };
}

export interface ApiFootballTeamsResponse {
  api: {
    results: number;
    teams: ApiFootballTeam[];
  };
}

export interface ApiFootballLeaguesResponse {
  api: {
    results: number;
    leagues: Array<{
      league_id: number;
      name: string;
      country: string;
    }>;
  };
}

class ApiFootballService {
  private readonly baseUrl =
    "https://free-api-live-football-data.p.rapidapi.com/v2";
  private readonly headers = {
    "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
    "x-rapidapi-key": config.rapidApiKey,
  };

  /**
   * Find Danish Superliga league ID
   */
  async getDanishSuperligaId(): Promise<number> {
    const url = `${this.baseUrl}/leagues`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data: ApiFootballLeaguesResponse = await response.json();

      const superliga = data.api.leagues.find(
        (league) =>
          league.name.toLowerCase().includes("superliga") &&
          league.country.toLowerCase() === "denmark"
      );

      if (!superliga) {
        throw new Error("Danish Superliga not found in API");
      }

      console.log(`Found Danish Superliga with ID: ${superliga.league_id}`);
      return superliga.league_id;
    } catch (error) {
      console.error("Error fetching Danish Superliga ID:", error);
      throw error;
    }
  }

  /**
   * Hent alle hold i dansk superliga
   */
  async getDanishSuperligaTeams(): Promise<ApiFootballTeam[]> {
    const leagueId = await this.getDanishSuperligaId();
    const url = `${this.baseUrl}/teams/league/${leagueId}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data: ApiFootballTeamsResponse = await response.json();

      return data.api.teams;
    } catch (error) {
      console.error("Error fetching Danish Superliga teams:", error);
      throw error;
    }
  }

  /**
   * Hent spillere for et specifikt hold
   */
  async getTeamSquad(teamId: number): Promise<{
    team: ApiFootballTeam;
    players: ApiFootballPlayer[];
  }> {
    const url = `${this.baseUrl}/players/squad/${teamId}/2025`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data: ApiFootballSquadResponse = await response.json();

      // Find team info from the teams we already have
      const teams = await this.getDanishSuperligaTeams();
      const team = teams.find((t) => t.team_id === teamId);

      if (!team) {
        throw new Error(`Team with ID ${teamId} not found`);
      }

      return {
        team,
        players: data.api.players,
      };
    } catch (error) {
      console.error(`Error fetching squad for team ${teamId}:`, error);
      throw error;
    }
  }

  /**
   * Hent alle spillere fra dansk superliga
   */
  async getAllDanishSuperligaPlayers(): Promise<
    {
      team: ApiFootballTeam;
      players: ApiFootballPlayer[];
    }[]
  > {
    try {
      // Først hent alle hold
      const teams = await this.getDanishSuperligaTeams();
      console.log(`Found ${teams.length} teams in Danish Superliga`);

      // Hent spillere for hvert hold
      const squads = await Promise.all(
        teams.map(async (team) => {
          try {
            const squad = await this.getTeamSquad(team.team_id);
            console.log(
              `Fetched ${squad.players.length} players for ${team.team_name}`
            );
            return squad;
          } catch (error) {
            console.error(
              `Failed to fetch squad for ${team.team_name}:`,
              error
            );
            return null;
          }
        })
      );

      // Filtrer væk null værdier (fejlede requests)
      return squads.filter(
        (squad): squad is NonNullable<typeof squad> => squad !== null
      );
    } catch (error) {
      console.error("Error fetching all Danish Superliga players:", error);
      throw error;
    }
  }

  /**
   * Konverter API position til vores PlayerPosition enum
   * Free API Live Football Data uses player_type field
   */
  mapPositionToEnum(
    apiPosition: string
  ): "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "ATTACKER" {
    const position = apiPosition.toLowerCase();

    if (position === "goalkeeper" || position === "goalkeepers") {
      return "GOALKEEPER";
    } else if (position === "defender" || position === "defenders") {
      return "DEFENDER";
    } else if (position === "midfielder" || position === "midfielders") {
      return "MIDFIELDER";
    } else if (
      position === "attacker" ||
      position === "attackers" ||
      position === "forward" ||
      position === "forwards"
    ) {
      return "ATTACKER";
    } else {
      // Fallback for ukendte positioner
      console.warn(
        `Unknown position: ${apiPosition}, defaulting to MIDFIELDER`
      );
      return "MIDFIELDER";
    }
  }
}

export const apiFootballService = new ApiFootballService();
