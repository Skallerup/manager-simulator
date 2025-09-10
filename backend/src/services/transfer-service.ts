import { PrismaClient, TransferStatus, PlayerPosition } from "@prisma/client";
import { socketManager } from "../websocket/socket";

const prisma = new PrismaClient();

export interface TransferWithPlayer {
  id: string;
  playerId: string;
  fromTeamId: string | null;
  toTeamId: string | null;
  askingPrice: number;
  status: TransferStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  player: {
    id: string;
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
    isGenerated: boolean;
  };
  fromTeam?: {
    id: string;
    name: string;
  };
  toTeam?: {
    id: string;
    name: string;
  };
}

export class TransferService {
  // Get all available transfers (players for sale)
  public static async getAvailableTransfers(userId: string): Promise<TransferWithPlayer[]> {
    // Get user's team
    const userTeam = await prisma.team.findFirst({
      where: { ownerId: userId },
    });

    const transfers = await prisma.transfer.findMany({
      where: {
        status: TransferStatus.LISTED,
        // Only show transfers from other teams
        fromTeamId: userTeam ? { not: userTeam.id } : undefined,
      },
      include: {
        player: true,
        fromTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        toTeam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return transfers;
  }

  // Get transfers for a specific team
  public static async getTeamTransfers(teamId: string): Promise<TransferWithPlayer[]> {
    const transfers = await prisma.transfer.findMany({
      where: {
        OR: [
          { fromTeamId: teamId },
          { toTeamId: teamId },
        ],
      },
      include: {
        player: true,
        fromTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        toTeam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return transfers;
  }

  // List a player for transfer
  public static async listPlayerForTransfer(
    playerId: string,
    teamId: string,
    askingPrice: number
  ): Promise<TransferWithPlayer | null> {
    try {
      // Check if player belongs to team
      const teamPlayer = await prisma.teamPlayer.findFirst({
        where: {
          playerId,
          teamId,
        },
      });

      if (!teamPlayer) {
        throw new Error("Player is not on this team");
      }

      // Check if player is already listed
      const existingTransfer = await prisma.transfer.findFirst({
        where: {
          playerId,
          status: TransferStatus.LISTED,
        },
      });

      if (existingTransfer) {
        throw new Error("Player is already listed for transfer");
      }

      // Create transfer listing
      const transfer = await prisma.transfer.create({
        data: {
          playerId,
          fromTeamId: teamId,
          askingPrice,
          status: TransferStatus.LISTED,
        },
        include: {
          player: true,
          fromTeam: {
            select: {
              id: true,
              name: true,
            },
          },
          toTeam: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Remove captain status from player if they were captain
      await prisma.player.update({
        where: { id: playerId },
        data: { isCaptain: false },
      });

      // Remove captain from team if this player was the captain
      await prisma.team.updateMany({
        where: { captainId: playerId },
        data: { captainId: null },
      });

      return transfer;
    } catch (error) {
      console.error("Error listing player for transfer:", error);
      return null;
    }
  }

  // Buy a player
  public static async buyPlayer(
    transferId: string,
    buyerTeamId: string
  ): Promise<TransferWithPlayer> {
    try {
      const transfer = await prisma.transfer.findUnique({
        where: { id: transferId },
        include: {
          player: true,
          fromTeam: true,
        },
      });

      if (!transfer) {
        throw new Error("Transfer not found");
      }

      if (transfer.status !== TransferStatus.LISTED) {
        throw new Error("Transfer is not available");
      }

      if (transfer.fromTeamId && transfer.fromTeamId === buyerTeamId) {
        throw new Error("Cannot buy your own player");
      }

      // Get buyer team
      const buyerTeam = await prisma.team.findUnique({
        where: { id: buyerTeamId },
      });

      if (!buyerTeam) {
        throw new Error("Buyer team not found");
      }

      // Check if buyer has enough budget
      if (buyerTeam.budget < transfer.askingPrice) {
        throw new Error("Insufficient budget");
      }

      // Check if buyer team has space (max 16 players)
      const playerCount = await prisma.teamPlayer.count({
        where: { teamId: buyerTeamId },
      });

      if (playerCount >= 16) {
        throw new Error("Team is full (max 16 players)");
      }

      // Check if player is already on the buyer's team
      const existingTeamPlayer = await prisma.teamPlayer.findFirst({
        where: { 
          playerId: transfer.playerId,
          teamId: buyerTeamId
        },
      });

      if (existingTeamPlayer) {
        throw new Error("Player is already on your team");
      }

      // Check if player is already on another team (not the seller's team)
      if (transfer.fromTeamId) {
        const playerOnOtherTeam = await prisma.teamPlayer.findFirst({
          where: { 
            playerId: transfer.playerId,
            teamId: { not: transfer.fromTeamId }
          },
        });

        if (playerOnOtherTeam) {
          throw new Error("Player is already on another team");
        }
      }

      // Start transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update transfer status
        const updatedTransfer = await tx.transfer.update({
          where: { id: transferId },
          data: {
            status: TransferStatus.PENDING,
            toTeamId: buyerTeamId,
          },
          include: {
            player: true,
            fromTeam: {
              select: {
                id: true,
                name: true,
              },
            },
            toTeam: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        // Add player to buyer team
        await tx.teamPlayer.create({
          data: {
            playerId: transfer.playerId,
            teamId: buyerTeamId,
            position: transfer.player.position,
            isStarter: false, // New players start on bench
          },
        });

        // Remove captain status from player if they were captain
        await tx.player.update({
          where: { id: transfer.playerId },
          data: { isCaptain: false },
        });

        // Deduct money from buyer
        await tx.team.update({
          where: { id: buyerTeamId },
          data: {
            budget: buyerTeam.budget - transfer.askingPrice,
          },
        });

        // Add money to seller (if any)
        if (transfer.fromTeamId) {
          const sellerTeam = await tx.team.findUnique({
            where: { id: transfer.fromTeamId },
          });

          if (sellerTeam) {
            await tx.team.update({
              where: { id: transfer.fromTeamId },
              data: {
                budget: sellerTeam.budget + transfer.askingPrice,
              },
            });
          }
        }

        // Remove player from seller team (if any)
        if (transfer.fromTeamId) {
          await tx.teamPlayer.deleteMany({
            where: {
              playerId: transfer.playerId,
              teamId: transfer.fromTeamId,
            },
          });
        }

        // Complete transfer
        const completedTransfer = await tx.transfer.update({
          where: { id: transferId },
          data: {
            status: TransferStatus.COMPLETED,
            completedAt: new Date(),
          },
          include: {
            player: true,
            fromTeam: {
              select: {
                id: true,
                name: true,
              },
            },
            toTeam: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return completedTransfer;
      });

      // Send notification to seller if they have a team
      if (transfer.fromTeamId) {
        const sellerTeam = await prisma.team.findUnique({
          where: { id: transfer.fromTeamId },
          include: { owner: true },
        });

        if (sellerTeam) {
          socketManager.sendNotificationToUser(sellerTeam.ownerId, {
            type: 'player_sold',
            title: 'Spiller solgt!',
            message: `${transfer.player.name} er blevet solgt til ${result.toTeam?.name} for ${transfer.askingPrice} kr`,
            data: {
              playerName: transfer.player.name,
              buyerTeam: result.toTeam?.name,
              price: transfer.askingPrice,
              transferId: result.id,
            },
            timestamp: new Date().toISOString(),
          });
        }
      }

      return result;
    } catch (error) {
      console.error("Error buying player:", error);
      throw error;
    }
  }

  // Cancel a transfer listing
  public static async cancelTransfer(transferId: string, teamId: string): Promise<boolean> {
    try {
      const transfer = await prisma.transfer.findUnique({
        where: { id: transferId },
      });

      if (!transfer) {
        throw new Error("Transfer not found");
      }

      if (transfer.fromTeamId !== teamId) {
        throw new Error("You can only cancel your own transfers");
      }

      if (transfer.status !== TransferStatus.LISTED) {
        throw new Error("Transfer cannot be cancelled");
      }

      await prisma.transfer.update({
        where: { id: transferId },
        data: {
          status: TransferStatus.CANCELLED,
        },
      });

      return true;
    } catch (error) {
      console.error("Error cancelling transfer:", error);
      return false;
    }
  }

  // Fire a player (remove from team and make available for free transfer)
  public static async firePlayer(playerId: string, teamId: string): Promise<boolean> {
    try {
      // Check if player belongs to team
      const teamPlayer = await prisma.teamPlayer.findFirst({
        where: {
          playerId,
          teamId,
        },
      });

      if (!teamPlayer) {
        throw new Error("Player is not on this team");
      }

      // Start transaction
      await prisma.$transaction(async (tx) => {
        // Remove player from team
        await tx.teamPlayer.delete({
          where: {
            id: teamPlayer.id,
          },
        });

        // Create free transfer listing (no cost)
        await tx.transfer.create({
          data: {
            playerId,
            fromTeamId: null, // No selling team
            askingPrice: 0, // Free
            status: TransferStatus.LISTED,
          },
        });
      });

      return true;
    } catch (error) {
      console.error("Error firing player:", error);
      return false;
    }
  }

  // Get free transfer players (fired players available for free)
  public static async getFreeTransferPlayers(): Promise<TransferWithPlayer[]> {
    const transfers = await prisma.transfer.findMany({
      where: {
        status: TransferStatus.LISTED,
        askingPrice: 0, // Free transfers
        fromTeamId: null, // No selling team
      },
      include: {
        player: true,
        fromTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        toTeam: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return transfers;
  }

  // Sign a free transfer player (no cost)
  public static async signFreeTransferPlayer(playerId: string, teamId: string): Promise<boolean> {
    try {
      // Find the free transfer
      const transfer = await prisma.transfer.findFirst({
        where: {
          playerId,
          status: TransferStatus.LISTED,
          askingPrice: 0,
          fromTeamId: null,
        },
        include: {
          player: true,
        },
      });

      if (!transfer) {
        throw new Error("Free transfer player not found");
      }

      // Get buyer team
      const buyerTeam = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!buyerTeam) {
        throw new Error("Buyer team not found");
      }

      // Check if buyer team has space (max 16 players)
      const playerCount = await prisma.teamPlayer.count({
        where: { teamId },
      });

      if (playerCount >= 16) {
        throw new Error("Team is full (max 16 players)");
      }

      // Check if player is already on a team
      const existingTeamPlayer = await prisma.teamPlayer.findFirst({
        where: { playerId },
      });

      if (existingTeamPlayer) {
        throw new Error("Player is already on a team");
      }

      // Start transaction
      await prisma.$transaction(async (tx) => {
        // Update transfer status
        await tx.transfer.update({
          where: { id: transfer.id },
          data: {
            status: TransferStatus.PENDING,
            toTeamId: teamId,
          },
        });

        // Add player to buyer team
        await tx.teamPlayer.create({
          data: {
            playerId,
            teamId,
            position: transfer.player.position,
            isStarter: false, // New players start on bench
          },
        });

        // Complete transfer
        await tx.transfer.update({
          where: { id: transfer.id },
          data: {
            status: TransferStatus.COMPLETED,
            completedAt: new Date(),
          },
        });
      });

      return true;
    } catch (error) {
      console.error("Error signing free transfer player:", error);
      return false;
    }
  }

  // Generate some free agent players for the transfer market
  public static async generateFreeAgents(count: number = 20): Promise<void> {
    const positions: PlayerPosition[] = [
      PlayerPosition.GOALKEEPER,
      PlayerPosition.DEFENDER,
      PlayerPosition.MIDFIELDER,
      PlayerPosition.ATTACKER,
    ];

    const firstNames = [
      "Lars", "Anders", "Mikkel", "Christian", "Nikolaj", "Rasmus", "Mads", "Thomas",
      "Sofia", "Emma", "Ida", "Freja", "Mette", "Pia", "Lise", "Mia"
    ];

    const lastNames = [
      "Hansen", "Jensen", "Nielsen", "Andersen", "Pedersen", "Christensen", "Larsen", "Sørensen",
      "Rasmussen", "Jørgensen", "Petersen", "Madsen", "Kristensen", "Olsen", "Thomsen", "Christiansen"
    ];

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const position = positions[Math.floor(Math.random() * positions.length)];
      const age = Math.floor(Math.random() * 15) + 18; // 18-32 years old

      // Generate stats based on position
      let baseStats = 40;
      if (position === PlayerPosition.GOALKEEPER) {
        baseStats = 45;
      } else if (position === PlayerPosition.ATTACKER) {
        baseStats = 50;
      }

      const speed = Math.min(100, baseStats + Math.floor(Math.random() * 30));
      const shooting = Math.min(100, baseStats + Math.floor(Math.random() * 30));
      const passing = Math.min(100, baseStats + Math.floor(Math.random() * 30));
      const defending = Math.min(100, baseStats + Math.floor(Math.random() * 30));
      const stamina = Math.min(100, baseStats + Math.floor(Math.random() * 30));
      const reflexes = Math.min(100, baseStats + Math.floor(Math.random() * 30));

      const overallRating = Math.round((speed + shooting + passing + defending + stamina + reflexes) / 6);
      const marketValue = Math.max(500000, overallRating * 10000 + Math.floor(Math.random() * 500000));

      const player = await prisma.player.create({
        data: {
          name: `${firstName} ${lastName}`,
          age,
          position,
          speed,
          shooting,
          passing,
          defending,
          stamina,
          reflexes,
          marketValue,
          isGenerated: true,
        },
      });

      // List player for transfer
      await prisma.transfer.create({
        data: {
          playerId: player.id,
          fromTeamId: null, // Free agent
          askingPrice: marketValue,
          status: TransferStatus.LISTED,
        },
      });
    }
  }
}
