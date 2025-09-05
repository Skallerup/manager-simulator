import { Request, Response } from "express";
import { prisma } from "../prisma/client";
import { apiFootballMockService as apiFootballService } from "../services/api-football-mock";
import { PlayerPosition } from "@prisma/client";

export interface SyncResult {
  success: boolean;
  message: string;
  stats?: {
    clubsCreated: number;
    clubsUpdated: number;
    playersCreated: number;
    playersUpdated: number;
    errors: string[];
  };
}

/**
 * Sync alle spillere og klubber fra dansk superliga
 */
export async function syncDanishSuperligaData(
  req: Request,
  res: Response
): Promise<void> {
  try {
    console.log("Starting Danish Superliga data sync...");

    // Hent alle data fra API
    const squads = await apiFootballService.getAllDanishSuperligaPlayers();

    const stats = {
      clubsCreated: 0,
      clubsUpdated: 0,
      playersCreated: 0,
      playersUpdated: 0,
      errors: [] as string[],
    };

    // Process hver squad
    for (const squad of squads) {
      try {
        // Upsert klub
        const club = await prisma.club.upsert({
          where: { externalId: squad.team.team_id },
          update: {
            name: squad.team.team_name,
            logo: squad.team.team_logo,
            country: "Denmark",
          },
          create: {
            externalId: squad.team.team_id,
            name: squad.team.team_name,
            logo: squad.team.team_logo,
            country: "Denmark",
          },
        });

        if (club.createdAt.getTime() === club.updatedAt.getTime()) {
          stats.clubsCreated++;
        } else {
          stats.clubsUpdated++;
        }

        // Process spillere
        for (const apiPlayer of squad.players) {
          try {
            const position = apiFootballService.mapPositionToEnum(
              apiPlayer.player_type
            );

            await prisma.player.upsert({
              where: { externalId: apiPlayer.player_id },
              update: {
                name: apiPlayer.player_name,
                age: apiPlayer.player_age,
                number: apiPlayer.player_number,
                position: position,
                photo: apiPlayer.player_image,
                clubId: club.id,
              },
              create: {
                externalId: apiPlayer.player_id,
                name: apiPlayer.player_name,
                age: apiPlayer.player_age,
                number: apiPlayer.player_number,
                position: position,
                photo: apiPlayer.player_image,
                clubId: club.id,
              },
            });

            // Check om det var en oprettelse eller opdatering
            const existingPlayer = await prisma.player.findUnique({
              where: { externalId: apiPlayer.player_id },
            });

            if (
              existingPlayer &&
              existingPlayer.createdAt.getTime() ===
                existingPlayer.updatedAt.getTime()
            ) {
              stats.playersCreated++;
            } else {
              stats.playersUpdated++;
            }
          } catch (playerError) {
            const errorMsg = `Failed to sync player ${apiPlayer.player_name}: ${playerError}`;
            console.error(errorMsg);
            stats.errors.push(errorMsg);
          }
        }
      } catch (clubError) {
        const errorMsg = `Failed to sync club ${squad.team.team_name}: ${clubError}`;
        console.error(errorMsg);
        stats.errors.push(errorMsg);
      }
    }

    const result: SyncResult = {
      success: true,
      message: `Successfully synced Danish Superliga data. Created ${stats.clubsCreated} clubs, updated ${stats.clubsUpdated} clubs, created ${stats.playersCreated} players, updated ${stats.playersUpdated} players.`,
      stats,
    };

    console.log("Danish Superliga sync completed:", result);
    res.json(result);
  } catch (error) {
    console.error("Error during Danish Superliga sync:", error);

    const result: SyncResult = {
      success: false,
      message: `Failed to sync Danish Superliga data: ${error}`,
    };

    res.status(500).json(result);
  }
}

/**
 * Hent sync status - viser antal klubber og spillere i databasen
 */
export async function getSyncStatus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const [clubCount, playerCount] = await Promise.all([
      prisma.club.count(),
      prisma.player.count(),
    ]);

    const clubsByCountry = await prisma.club.groupBy({
      by: ["country"],
      _count: {
        country: true,
      },
    });

    const playersByPosition = await prisma.player.groupBy({
      by: ["position"],
      _count: {
        position: true,
      },
    });

    res.json({
      success: true,
      data: {
        totalClubs: clubCount,
        totalPlayers: playerCount,
        clubsByCountry,
        playersByPosition,
      },
    });
  } catch (error) {
    console.error("Error getting sync status:", error);
    res.status(500).json({
      success: false,
      message: `Failed to get sync status: ${error}`,
    });
  }
}

/**
 * Ryd op i gamle data (fjern spillere og klubber der ikke længere er aktive)
 * Dette er en avanceret funktion der kan bruges til at holde data opdateret
 */
export async function cleanupOldData(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // For nu, lad os bare returnere en besked om at funktionen ikke er implementeret endnu
    res.json({
      success: true,
      message:
        "Cleanup functionality not implemented yet. This would remove players/clubs that are no longer active in the API.",
    });
  } catch (error) {
    console.error("Error during cleanup:", error);
    res.status(500).json({
      success: false,
      message: `Failed to cleanup old data: ${error}`,
    });
  }
}
