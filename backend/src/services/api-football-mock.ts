import {
  ApiFootballPlayer,
  ApiFootballTeam,
  ApiFootballSquadResponse,
} from "./api-football";

/**
 * Mock version af API-Football service til test formål
 * Bruger statiske data fra dansk superliga
 */
class ApiFootballMockService {
  private readonly mockTeams: ApiFootballTeam[] = [
    {
      team_id: 1,
      team_name: "FC København",
      team_logo: "https://media.api-sports.io/football/teams/1.png",
    },
    {
      team_id: 2,
      team_name: "Brøndby IF",
      team_logo: "https://media.api-sports.io/football/teams/2.png",
    },
    {
      team_id: 3,
      team_name: "AGF",
      team_logo: "https://media.api-sports.io/football/teams/3.png",
    },
    {
      team_id: 4,
      team_name: "FC Midtjylland",
      team_logo: "https://media.api-sports.io/football/teams/4.png",
    },
    {
      team_id: 5,
      team_name: "OB",
      team_logo: "https://media.api-sports.io/football/teams/5.png",
    },
  ];

  private readonly mockPlayers: { [teamId: number]: ApiFootballPlayer[] } = {
    1: [
      // FC København
      {
        player_id: 101,
        player_name: "Kamil Grabara",
        player_age: 25,
        player_number: 1,
        player_type: "Goalkeeper",
        player_image: "https://media.api-sports.io/football/players/101.png",
      },
      {
        player_id: 102,
        player_name: "Denis Vavro",
        player_age: 28,
        player_number: 2,
        player_type: "Defender",
        player_image: "https://media.api-sports.io/football/players/102.png",
      },
      {
        player_id: 103,
        player_name: "Kevin Diks",
        player_age: 27,
        player_number: 3,
        player_type: "Defender",
        player_image: "https://media.api-sports.io/football/players/103.png",
      },
      {
        player_id: 104,
        player_name: "Lukas Lerager",
        player_age: 30,
        player_number: 8,
        player_type: "Midfielder",
        player_image: "https://media.api-sports.io/football/players/104.png",
      },
      {
        player_id: 105,
        player_name: "Roony Bardghji",
        player_age: 18,
        player_number: 10,
        player_type: "Attacker",
        player_image: "https://media.api-sports.io/football/players/105.png",
      },
    ],
    2: [
      // Brøndby IF
      {
        player_id: 201,
        player_name: "Thomas Mikkelsen",
        player_age: 26,
        player_number: 1,
        player_type: "Goalkeeper",
        player_image: "https://media.api-sports.io/football/players/201.png",
      },
      {
        player_id: 202,
        player_name: "Andreas Maxsø",
        player_age: 29,
        player_number: 4,
        player_type: "Defender",
        player_image: "https://media.api-sports.io/football/players/202.png",
      },
      {
        player_id: 203,
        player_name: "Mathias Greve",
        player_age: 24,
        player_number: 6,
        player_type: "Midfielder",
        player_image: "https://media.api-sports.io/football/players/203.png",
      },
      {
        player_id: 204,
        player_name: "Oskar Fallenius",
        player_age: 22,
        player_number: 7,
        player_type: "Midfielder",
        player_image: "https://media.api-sports.io/football/players/204.png",
      },
      {
        player_id: 205,
        player_name: "Nicolai Vallys",
        player_age: 26,
        player_number: 9,
        player_type: "Attacker",
        player_image: "https://media.api-sports.io/football/players/205.png",
      },
    ],
    3: [
      // AGF
      {
        player_id: 301,
        player_name: "Jesper Hansen",
        player_age: 38,
        player_number: 1,
        player_type: "Goalkeeper",
        player_image: "https://media.api-sports.io/football/players/301.png",
      },
      {
        player_id: 302,
        player_name: "Patrick Mortensen",
        player_age: 35,
        player_number: 2,
        player_type: "Defender",
        player_image: "https://media.api-sports.io/football/players/302.png",
      },
      {
        player_id: 303,
        player_name: "Mikkel Duelund",
        player_age: 26,
        player_number: 10,
        player_type: "Midfielder",
        player_image: "https://media.api-sports.io/football/players/303.png",
      },
      {
        player_id: 304,
        player_name: "Janni Serra",
        player_age: 25,
        player_number: 11,
        player_type: "Attacker",
        player_image: "https://media.api-sports.io/football/players/304.png",
      },
    ],
    4: [
      // FC Midtjylland
      {
        player_id: 401,
        player_name: "Jonas Lössl",
        player_age: 35,
        player_number: 1,
        player_type: "Goalkeeper",
        player_image: "https://media.api-sports.io/football/players/401.png",
      },
      {
        player_id: 402,
        player_name: "Erik Sviatchenko",
        player_age: 32,
        player_number: 3,
        player_type: "Defender",
        player_image: "https://media.api-sports.io/football/players/402.png",
      },
      {
        player_id: 403,
        player_name: "Pione Sisto",
        player_age: 29,
        player_number: 7,
        player_type: "Midfielder",
        player_image: "https://media.api-sports.io/football/players/403.png",
      },
      {
        player_id: 404,
        player_name: "Sory Kaba",
        player_age: 28,
        player_number: 9,
        player_type: "Attacker",
        player_image: "https://media.api-sports.io/football/players/404.png",
      },
    ],
    5: [
      // OB
      {
        player_id: 501,
        player_name: "Oliver Christensen",
        player_age: 25,
        player_number: 1,
        player_type: "Goalkeeper",
        player_image: "https://media.api-sports.io/football/players/501.png",
      },
      {
        player_id: 502,
        player_name: "Jeppe Tverskov",
        player_age: 30,
        player_number: 4,
        player_type: "Defender",
        player_image: "https://media.api-sports.io/football/players/502.png",
      },
      {
        player_id: 503,
        player_name: "Mads Frøkjær-Jensen",
        player_age: 24,
        player_number: 8,
        player_type: "Midfielder",
        player_image: "https://media.api-sports.io/football/players/503.png",
      },
      {
        player_id: 504,
        player_name: "Kasper Junker",
        player_age: 29,
        player_number: 9,
        player_type: "Attacker",
        player_image: "https://media.api-sports.io/football/players/504.png",
      },
    ],
  };

  async getDanishSuperligaTeams(): Promise<ApiFootballTeam[]> {
    // Simuler API delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return this.mockTeams;
  }

  async getTeamSquad(teamId: number): Promise<{
    team: ApiFootballTeam;
    players: ApiFootballPlayer[];
  }> {
    // Simuler API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const team = this.mockTeams.find((t) => t.team_id === teamId);
    if (!team) {
      throw new Error(`Team with ID ${teamId} not found`);
    }

    const players = this.mockPlayers[teamId] || [];
    return { team, players };
  }

  async getAllDanishSuperligaPlayers(): Promise<
    {
      team: ApiFootballTeam;
      players: ApiFootballPlayer[];
    }[]
  > {
    // Simuler API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const squads = [];
    for (const team of this.mockTeams) {
      const players = this.mockPlayers[team.team_id] || [];
      squads.push({ team, players });
    }

    return squads;
  }

  mapPositionToEnum(
    apiPosition: string
  ): "GOALKEEPER" | "DEFENDER" | "MIDFIELDER" | "ATTACKER" {
    const position = apiPosition.toLowerCase();

    if (position === "goalkeeper") {
      return "GOALKEEPER";
    } else if (position === "defender") {
      return "DEFENDER";
    } else if (position === "midfielder") {
      return "MIDFIELDER";
    } else if (position === "attacker") {
      return "ATTACKER";
    } else {
      console.warn(
        `Unknown position: ${apiPosition}, defaulting to MIDFIELDER`
      );
      return "MIDFIELDER";
    }
  }
}

export const apiFootballMockService = new ApiFootballMockService();
